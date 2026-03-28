import os
import tempfile
from datetime import datetime
from docxtpl import DocxTemplate
from .claude_service import claude_service

class DocumentService:
    def __init__(self):
        self.claude_client = claude_service.claude_client

    def generate_strategy_fit_summary(self, candidate_name, gap_scores, project_name=None, project_description=None):
        """
        Generates a 2-sentence 'Executive Summary' for a candidate profile.
        Takes top 3 gap_coverage_scores.
        """
        candidate_name = candidate_name or "Candidate"
        gap_scores = gap_scores or {}
        
        # Sort and get top 3 gaps - handle potential None scores
        try:
            sorted_gaps = sorted(
                [(k, v) for k, v in gap_scores.items() if v is not None], 
                key=lambda x: x[1], 
                reverse=True
            )[:3]
        except (AttributeError, TypeError):
            sorted_gaps = []

        if not sorted_gaps:
            return f"{candidate_name} is currently being evaluated for alignment with project requirements."

        top_gap, top_score = sorted_gaps[0]
        
        # Build prompt for Claude
        prompt = f"""You are a senior executive search consultant. Write a 2-sentence 'Strategy Fit' executive summary for a candidate profile.

CANDIDATE: {candidate_name}
PROJECT: {project_name or 'Board Search'}
PROJECT DESCRIPTION: {project_description or 'Strategic board placement'}
TOP GAPS FILLED:
{chr(10).join([f"- {gap}: {score}%" for gap, score in sorted_gaps])}

STYLE GUIDELINE:
- Professional, punchy, and data-driven.
- Sentence 1: Focus on the strongest gap alignment (the {top_gap} at {top_score}%).
- Sentence 2: Connect their overall profile to the company's strategic roadmap (use the project description for context).
- Limit to EXACTLY 2 sentences.
"""

        try:
            response = self.claude_client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=150,
                temperature=0.7,
                messages=[{"role": "user", "content": prompt}]
            )
            summary = response.content[0].text.strip()
            # Clean up any quotes
            summary = summary.strip("'\"")
            return summary
        except Exception as e:
            print(f"Error generating summary with Claude: {e}")
            # Fallback
            s2_context = project_name if project_name else "the current board search"
            return f"{candidate_name} provides {top_score}% coverage for our identified {top_gap} gap. Their expertise represents a high-priority alignment for {s2_context}."

    def generate_executive_brief_docx(self, candidate_data, project_data):
        """
        Injects candidate data and match_reasoning into the 'Executive Brief' Word template.
        """
        # Defensive checks for candidate_data
        candidate_data = candidate_data or {}
        project_data = project_data or {}
        gap_scores = candidate_data.get('gap_scores') or {}
        
        # Template location
        template_path = os.path.join(os.path.dirname(__file__), '..', 'templates', 'executive_brief_template.docx')
        
        if not os.path.exists(template_path):
            return None, "Executive Brief template not found."

        # Prepare context for docxtpl
        try:
            top_gaps = sorted(
                [(k, v) for k, v in gap_scores.items() if v is not None], 
                key=lambda x: x[1], 
                reverse=True
            )[:3]
        except (AttributeError, TypeError):
            top_gaps = []

        context = {
            'client_name': project_data.get('client_name', 'BoardReady Client'),
            'board_name': project_data.get('board_name', 'Board Search'),
            'candidate_name': candidate_data.get('name', 'Candidate'),
            'candidate_title': candidate_data.get('title', 'Professional'),
            'candidate_company': candidate_data.get('company', 'Company'),
            'match_score': round(candidate_data.get('match_score', 0) * 100) if candidate_data.get('match_score') else 0,
            'match_reasoning': candidate_data.get('match_reasoning', ''),
            'report_date': datetime.now().strftime('%B %d, %Y'),
            'gap_scores': gap_scores,
            'top_gaps': top_gaps
        }

        try:
            doc = DocxTemplate(template_path)
            doc.render(context)
            
            # Save to a temporary file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.docx')
            doc.save(temp_file.name)
            temp_file_path = temp_file.name
            temp_file.close()
            
            return temp_file_path, None
        except Exception as e:
            return None, f"Error rendering template: {str(e)}"

document_service = DocumentService()
