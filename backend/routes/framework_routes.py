from flask import Blueprint, request, jsonify
from flask_login import login_required
from models.base import get_db
from sqlalchemy import text
import os
from anthropic import Anthropic
import json

framework_bp = Blueprint('framework', __name__)
anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

@framework_bp.route('/projects/<int:project_id>/generate-framework', methods=['POST'])
@login_required
def generate_intelligent_framework(project_id):
    """
    Claude analyzes company and generates custom framework
    """
    data = request.get_json()
    
    company_name = data.get('company_name')
    industry = data.get('industry', '')
    description = data.get('description', '')
    ticker = data.get('ticker', '')
    strategic_priorities = data.get('strategic_priorities', [])
    company_stage = data.get('company_stage', 'mature')
    
    db = next(get_db())
    
    # Get starter template if industry matches
    starter_template = None
    if industry:
        # Try to match industry to a starter
        result = db.execute(text("""
        SELECT suggested_categories 
        FROM industry_starter_templates
        WHERE EXISTS (
            SELECT 1 FROM unnest(common_keywords) AS keyword
            WHERE :industry ILIKE '%' || keyword || '%'
        )
        LIMIT 1
    """), {"industry": industry})
        
        row = result.fetchone()
        if row:
            starter_template = row[0]
    
    # Build intelligent prompt
    prompt = f"""You are a world-class board recruitment consultant. Your task is to analyze this company and generate a CUSTOM board gap framework.

COMPANY CONTEXT:
Company: {company_name}
Industry: {industry}
Description: {description}
Ticker: {ticker if ticker else "Private Company"}
Company Stage: {company_stage}
Strategic Priorities: {', '.join(strategic_priorities) if strategic_priorities else 'Not provided'}

"""

    if starter_template:
        prompt += f"""INDUSTRY BASELINE (Use as starting point, but customize!):
{json.dumps(starter_template, indent=2)}

"""

    prompt += """YOUR TASK:
Generate 6-8 critical gap categories that THIS SPECIFIC company's board needs.

CRITICAL INSTRUCTIONS:
1. Be SPECIFIC to this company - not generic
2. Consider their strategic priorities
3. Think about their industry dynamics and competitive landscape
4. Consider regulatory environment and market trends
5. If they mentioned specific goals (APAC expansion, sustainability, etc.), CREATE CATEGORIES FOR THOSE
6. Provide EVIDENCE-BASED reasoning (cite what you know about the company/industry)

For each category provide:
- category_name: Short, specific (e.g., "APAC Market Expansion" not just "International")
- description: What this expertise covers
- required_keywords: 8-12 specific keywords to search director bios for
- target_coverage: Realistic % of board (usually 20-50%)
- priority_score: 0-100 (how critical for THIS company)
- reasoning: 2-3 sentences WHY this matters for THIS specific company
- evidence: What info/context led you to include this category

Return ONLY valid JSON array, no other text:
[
  {
    "category_name": "Direct-to-Consumer Digital Commerce",
    "description": "E-commerce platforms, digital customer experience, personalization, mobile commerce",
    "required_keywords": ["e-commerce", "digital commerce", "DTC", "direct-to-consumer", "omnichannel", "mobile", "app", "digital platform", "customer experience", "personalization"],
    "target_coverage": 40,
    "priority_score": 95,
    "reasoning": "Nike's strategy explicitly prioritizes DTC channels with 60% revenue target by 2025. Board needs members who understand e-commerce economics, digital marketing, and platform development to oversee this transformation.",
    "evidence": "Known Nike strategy shift to direct-to-consumer, digital commerce focus"
  }
]
"""

    try:
        # Call Claude
        response = anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=4000,
            temperature=0.5,  # Lower temp for more structured output
            messages=[{"role": "user", "content": prompt}]
        )
        
        response_text = response.content[0].text.strip()
        
        # Clean JSON
        if '```json' in response_text:
            response_text = response_text.split('```json')[1].split('```')[0].strip()
        elif '```' in response_text:
            response_text = response_text.split('```')[1].split('```')[0].strip()
        
        categories = json.loads(response_text)
        
        # Save framework
        framework_result = db.execute(text("""
            INSERT INTO project_gap_frameworks 
            (project_id, generation_prompt, categories)
            VALUES (:pid, :prompt, :cats)
            RETURNING id
        """), {
            "pid": project_id,
            "prompt": prompt,
            "cats": json.dumps(categories)
        })
        
        framework_id = framework_result.fetchone()[0]
        
        # Save individual categories
        for cat in categories:
            db.execute(text("""
                INSERT INTO project_gap_categories 
                (framework_id, project_id, category_name, description, 
                 required_keywords, target_coverage, priority_score, 
                 claude_reasoning, evidence_source)
                VALUES (:fid, :pid, :name, :desc, :keywords, :target, :priority, :reasoning, :evidence)
            """), {
                "fid": framework_id,
                "pid": project_id,
                "name": cat['category_name'],
                "desc": cat['description'],
                "keywords": cat['required_keywords'],
                "target": cat['target_coverage'],
                "priority": cat['priority_score'],
                "reasoning": cat['reasoning'],
                "evidence": cat.get('evidence', 'AI analysis')
            })
        
        db.commit()
        
        return jsonify({
            'success': True,
            'framework_id': framework_id,
            'categories': categories,
            'message': f'Generated {len(categories)} intelligent gap categories'
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@framework_bp.route('/projects/<int:project_id>/analyze-gaps', methods=['POST'])
@login_required
def analyze_board_against_framework(project_id):
    """
    Analyze board composition against Claude's framework
    """
    db = next(get_db())
    
    # Get categories
    categories = db.execute(text("""
        SELECT id, category_name, required_keywords, target_coverage, priority_score, claude_reasoning
        FROM project_gap_categories
        WHERE project_id = :pid
        ORDER BY priority_score DESC
    """), {"pid": project_id}).fetchall()
    
    # Get board members
    members = db.execute(text("""
        SELECT name, matrix_data
        FROM board_members
        WHERE project_id = :pid AND deleted_at IS NULL
    """), {"pid": project_id}).fetchall()
    
    total_members = len(members)
    gaps_analysis = []
    
    for cat in categories:
        cat_id, cat_name, keywords, target, priority, reasoning = cat
        
        with_expertise = []
        missing = []
        
        for member in members:
            name = member[0]
            matrix_data = member[1] or {}
            bio = matrix_data.get('background', {}).get('bio', '') if isinstance(matrix_data.get('background', {}), dict) else ''
            
            has_expertise = any(kw.lower() in bio.lower() for kw in keywords) if bio else False
            
            (with_expertise if has_expertise else missing).append(name)
        
        coverage = round((len(with_expertise) / total_members * 100), 1) if total_members > 0 else 0
        gap_score = int(max(0, target - coverage))
        
        priority_level = 'critical' if gap_score >= 30 else 'high' if gap_score >= 20 else 'medium' if gap_score >= 10 else 'low'
        
        # Save analysis
        db.execute(text("""
            INSERT INTO project_gaps_v2 
            (project_id, category_id, category_name, current_coverage, 
             target_coverage, gap_score, priority, board_members_with_expertise, board_members_missing)
            VALUES (:pid, :cid, :name, :coverage, :target, :gap, :priority, :with_exp, :missing)
        """), {
            "pid": project_id,
            "cid": cat_id,
            "name": cat_name,
            "coverage": coverage,
            "target": target,
            "gap": gap_score,
            "priority": priority_level,
            "with_exp": with_expertise,
            "missing": missing
        })
        
        gaps_analysis.append({
            'category': cat_name,
            'current_coverage': coverage,
            'target_coverage': target,
            'gap_score': gap_score,
            'priority': priority_level,
            'reasoning': reasoning,
            'members_with_expertise': with_expertise,
            'members_missing': missing
        })
    
    db.commit()
    
    return jsonify({
        'success': True,
        'gaps': gaps_analysis,
        'total_categories': len(categories),
        'critical_gaps': len([g for g in gaps_analysis if g['priority'] == 'critical'])
    })
