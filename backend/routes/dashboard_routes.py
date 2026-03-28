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

@dashboard_bp.route('/projects/<int:project_id>/severity-timeline', methods=['GET'])
@login_required
def get_severity_timeline(project_id):
    """
    Get 5-year Gap Severity Timeline with Heal-on-fly retirement projections.
    """
    import random
    from datetime import datetime
    db = next(get_db())
    
    # 1. Fetch gaps and targets
    gaps_result = db.execute(text("""
        SELECT category_name, target_coverage, current_coverage, board_members_with_expertise
        FROM project_gaps_v2
        WHERE project_id = :pid
    """), {"pid": project_id}).fetchall()
    
    # 2. Fetch board members
    members_result = db.execute(text("""
        SELECT name, matrix_data
        FROM board_members
        WHERE project_id = :pid AND deleted_at IS NULL
    """), {"pid": project_id}).fetchall()
    
    total_members = len(members_result)
    if total_members == 0:
        return jsonify({'success': True, 'timeline': [], 'message': 'No board members found'})
    
    current_year = 2026 # Forcing 2026 based on project context
    years = list(range(current_year, current_year + 6))
    
    # Process retirements (Heal-on-fly logic)
    retirements = {}
    for row in members_result:
        name = row[0]
        matrix = row[1] if row[1] else {}
        demographics = matrix.get('demographics', {}) if isinstance(matrix, dict) else {}
        professional = matrix.get('professional', {}) if isinstance(matrix, dict) else {}
        
        # Try to parse birth_year or age_range
        age_range = demographics.get('age_range')
        years_on_board = professional.get('years_on_board')
        
        retire_year = None
        if age_range == 'Over 65':
            retire_year = current_year + random.randint(1, 4)
        elif age_range == '51-65':
            retire_year = current_year + random.randint(5, 10)
        elif isinstance(years_on_board, int) and years_on_board >= 10:
            retire_year = current_year + max(1, 12 - years_on_board)
            
        if not retire_year:
            # Staggered Risk profile (T+3 to T+8)
            retire_year = current_year + random.randint(3, 8)
            
        retirements[name] = retire_year
        
    timeline_data = []
    
    for row in gaps_result:
        cat_name = row[0]
        target = (row[1] or 0) / 100.0
        members_with = row[3] or []
        
        yearly_data = []
        
        for year in years:
            # How many experts are still active?
            active_experts = sum(1 for m in members_with if retirements.get(m, current_year + 10) > year)
            # How many total members are still active?
            active_total = sum(1 for name, ry in retirements.items() if ry > year)
            
            if active_total == 0:
                projected_coverage = 0.0
            else:
                projected_coverage = active_experts / active_total
                
            severity = max(0.0, target - projected_coverage)
            
            # Find who is retiring this year that has this expertise
            retiring_experts = [m for m in members_with if retirements.get(m) == year]
            
            yearly_data.append({
                'year': year,
                'projected_coverage': round(projected_coverage * 100, 1),
                'severity_index': round(severity, 3),
                'retiring_experts': retiring_experts
            })
            
        timeline_data.append({
            'category': cat_name,
            'target_coverage': row[1] or 0,
            'forecast': yearly_data
        })
        
    return jsonify({
        'success': True,
        'timeline': timeline_data,
        'horizon': f"{current_year}-{current_year+5}"
    })
