from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models.base import get_db
from sqlalchemy import text
import os
from anthropic import Anthropic
import json

chat_bp = Blueprint('chat', __name__)
anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Define tools that Claude can use
TOOLS = [
    {
        "name": "calculate_diversity_metrics",
        "description": "Calculate diversity metrics for the current board composition including gender balance, racial diversity, and overall diversity score",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "integer",
                    "description": "The project ID to analyze"
                }
            },
            "required": ["project_id"]
        }
    },
    {
        "name": "search_candidates",
        "description": "Search the candidate database for people matching specific criteria",
        "input_schema": {
            "type": "object",
            "properties": {
                "expertise": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of required expertise areas"
                },
                "gender": {
                    "type": "string",
                    "description": "Preferred gender"
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of results",
                    "default": 5
                }
            }
        }
    },
    {
        "name": "get_board_gaps",
        "description": "Get detailed information about identified gaps in board composition",
        "input_schema": {
            "type": "object",
            "properties": {
                "project_id": {
                    "type": "integer",
                    "description": "The project ID"
                }
            },
            "required": ["project_id"]
        }
    }
]

def calculate_diversity_metrics_impl(project_id):
    """Calculate diversity metrics for a board"""
    db = next(get_db())
    
    result = db.execute(text("""
        SELECT matrix_data
        FROM board_members
        WHERE project_id = :pid AND deleted_at IS NULL
    """), {"pid": project_id})
    
    members = [row[0] for row in result if row[0]]
    
    total = len(members)
    if total == 0:
        return {"error": "No board members found"}
    
    female = sum(1 for m in members if m.get('demographics', {}).get('gender') == 'Female')
    diverse_race = sum(1 for m in members if m.get('demographics', {}).get('race_ethnicity') not in ['Caucasian', None, ''])
    
    return {
        "total_members": total,
        "gender_diversity": {
            "female_count": female,
            "male_count": total - female,
            "female_percentage": round((female / total * 100), 1)
        },
        "racial_diversity": {
            "diverse_count": diverse_race,
            "caucasian_count": total - diverse_race,
            "diverse_percentage": round((diverse_race / total * 100), 1)
        },
        "overall_diversity_score": round(((female + diverse_race) / (total * 2) * 100), 1),
        "benchmarks": {
            "sp500_female_avg": 32,
            "sp500_racial_diversity_avg": 28
        }
    }

def search_candidates_impl(expertise=None, gender=None, limit=5):
    """Search candidates in database"""
    db = next(get_db())
    
    query = "SELECT id, name, title, company FROM candidates WHERE 1=1"
    params = {"limit": limit}
    
    if gender:
        query += " AND gender = :gender"
        params['gender'] = gender
    
    query += " LIMIT :limit"
    
    result = db.execute(text(query), params)
    
    candidates = []
    for row in result:
        candidates.append({
            'id': row[0],
            'name': row[1],
            'title': row[2],
            'company': row[3]
        })
    
    return {
        "candidates": candidates,
        "total_found": len(candidates),
        "search_criteria": {
            "expertise": expertise,
            "gender": gender
        }
    }

def get_board_gaps_impl(project_id):
    """Get gap analysis for a project"""
    db = next(get_db())
    
    result = db.execute(text("""
        SELECT gap_title, gap_description, priority, priority_score, target_profile
        FROM gap_analysis
        WHERE project_id = :pid AND deleted_at IS NULL
        ORDER BY priority_score DESC
    """), {"pid": project_id})
    
    gaps = []
    for row in result:
        gaps.append({
            'title': row[0],
            'description': row[1],
            'priority': row[2],
            'priority_score': row[3],
            'target_profile': row[4]
        })
    
    return {
        "gaps": gaps,
        "total_gaps": len(gaps),
        "critical_gaps": len([g for g in gaps if g['priority'] == 'critical']),
        "high_priority_gaps": len([g for g in gaps if g['priority'] == 'high'])
    }

def execute_tool(tool_name, tool_input):
    """Execute a tool and return results"""
    if tool_name == "calculate_diversity_metrics":
        return calculate_diversity_metrics_impl(**tool_input)
    elif tool_name == "search_candidates":
        return search_candidates_impl(**tool_input)
    elif tool_name == "get_board_gaps":
        return get_board_gaps_impl(**tool_input)
    else:
        return {"error": f"Unknown tool: {tool_name}"}

@chat_bp.route('/projects/<int:project_id>/chat', methods=['POST'])
@login_required
def project_chat(project_id):
    """Agentic chat with tool use"""
    
    data = request.get_json()
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Build system prompt
    system_prompt = f"""You are an AI assistant for a board search project (Project ID: {project_id}).

You have access to tools that let you:
- Calculate diversity metrics for the board
- Search the candidate database
- Get information about board gaps

When analyzing the board or answering questions:
1. Use tools to get accurate, real-time data
2. Present findings clearly with specific numbers
3. Make actionable recommendations
4. Format responses professionally with markdown

IMPORTANT FORMATTING:
- Use ## for main headers
- Use ### for subheaders
- Use **bold** for key metrics and findings
- Use bullet points for lists
- Use tables for comparisons
- Include specific percentages and numbers

When you use a tool, explain what you're doing in a brief sentence before showing results.
"""
    
    messages = [{"role": "user", "content": user_message}]
    
    try:
        # Call Claude with tools
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            system=system_prompt,
            tools=TOOLS,
            messages=messages
        )
        
        # Track tool usage
        thinking_steps = []
        tool_calls = []
        
        # Handle tool use loop
        while response.stop_reason == "tool_use":
            # Extract tool calls from response
            for content_block in response.content:
                if content_block.type == "tool_use":
                    tool_name = content_block.name
                    tool_input = content_block.input
                    
                    # Add thinking step
                    thinking_steps.append(f"Using {tool_name}...")
                    
                    # Execute tool
                    tool_result = execute_tool(tool_name, tool_input)
                    
                    # Record tool call
                    tool_calls.append({
                        'name': tool_name,
                        'input': tool_input,
                        'result': tool_result
                    })
                    
                    # Continue conversation with tool results
                    messages.append({"role": "assistant", "content": response.content})
                    messages.append({
                        "role": "user",
                        "content": [{
                            "type": "tool_result",
                            "tool_use_id": content_block.id,
                            "content": json.dumps(tool_result)
                        }]
                    })
            
            # Get next response
            response = anthropic_client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4000,
                system=system_prompt,
                tools=TOOLS,
                messages=messages
            )
        
        # Extract final text response
        final_response = ""
        for content_block in response.content:
            if hasattr(content_block, 'text'):
                final_response += content_block.text
        
        return jsonify({
            'response': final_response,
            'thinking_steps': thinking_steps,
            'tool_calls': tool_calls,
            'model': 'claude-sonnet-4',
            'tokens': response.usage.input_tokens + response.usage.output_tokens
        })
        
    except Exception as e:
        print(f"Error in chat: {e}")
        return jsonify({'error': f'AI request failed: {str(e)}'}), 500
