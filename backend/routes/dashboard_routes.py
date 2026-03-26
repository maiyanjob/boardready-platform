from flask import Blueprint, jsonify
from flask_login import login_required
from models.base import get_db
from sqlalchemy import text

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/projects/<int:project_id>/dashboard-data', methods=['GET'])
@login_required
def get_dashboard_data(project_id):
    """
    Get all data needed for Intelligence Dashboard
    """
    db = next(get_db())
    
    # Get intelligent gaps from new table
    gaps_result = db.execute(text("""
        SELECT 
            category_name,
            current_coverage,
            target_coverage,
            gap_score,
            priority,
            board_members_with_expertise,
            board_members_missing
        FROM project_gaps_v2
        WHERE project_id = :pid
        ORDER BY gap_score DESC
        LIMIT 10
    """), {"pid": project_id})
    
    gaps = []
    for row in gaps_result:
        gaps.append({
            'gap_title': row[0],
            'current_coverage': float(row[1]),
            'target_coverage': row[2],
            'gap_score': row[3],
            'priority': row[4],
            'members_with': row[5] or [],
            'members_missing': row[6] or []
        })
    
    # Get board member count
    members_result = db.execute(text("""
        SELECT COUNT(*) FROM board_members
        WHERE project_id = :pid AND deleted_at IS NULL
    """), {"pid": project_id})
    
    total_members = members_result.fetchone()[0]
    
    # Get diversity metrics
    diversity_result = db.execute(text("""
        SELECT 
            COUNT(*) FILTER (WHERE (matrix_data->'demographics'->>'gender') = 'Female') as female_count,
            COUNT(*) FILTER (WHERE (matrix_data->'demographics'->>'race_ethnicity') != 'Caucasian' 
                            AND (matrix_data->'demographics'->>'race_ethnicity') IS NOT NULL) as diverse_count
        FROM board_members
        WHERE project_id = :pid AND deleted_at IS NULL
    """), {"pid": project_id})
    
    diversity_row = diversity_result.fetchone()
    female_count = diversity_row[0] or 0
    diverse_count = diversity_row[1] or 0
    
    female_percentage = round((female_count / total_members * 100), 1) if total_members > 0 else 0
    diverse_percentage = round((diverse_count / total_members * 100), 1) if total_members > 0 else 0
    
    # Critical gaps count
    critical_gaps = len([g for g in gaps if g['priority'] == 'critical'])
    high_gaps = len([g for g in gaps if g['priority'] == 'high'])
    
    return jsonify({
        'success': True,
        'gaps': gaps,
        'metrics': {
            'total_members': total_members,
            'female_percentage': female_percentage,
            'diverse_percentage': diverse_percentage,
            'critical_gaps': critical_gaps,
            'high_gaps': high_gaps,
            'total_gaps': len(gaps)
        }
    })
