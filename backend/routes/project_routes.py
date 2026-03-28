from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models.base import get_db
from models.candidate import Candidate, ProjectCandidate
from services.claude_service import claude_service
from services.document_service import document_service
from sqlalchemy import text, func
from datetime import datetime, date
import json

project_bp = Blueprint('projects', __name__)

@project_bp.route('/projects/<int:project_id>/candidates', methods=['GET'])
@login_required
def get_project_candidates(project_id):
    """
    Get candidates for a project with real-time semantic gap scoring.
    1. Fetch project gaps from project_gaps_v2
    2. Join project_candidates with candidates
    3. Compare candidate bio_embedding with gap_title embeddings
    4. Save scores and return
    """
    db_gen = get_db()
    db = next(db_gen)

    try:
        project_result = db.execute(text("""
            SELECT client_name, description
            FROM projects
            WHERE id = :pid AND deleted_at IS NULL
        """), {"pid": project_id}).fetchone()

        if not project_result:
            return jsonify({'error': 'Project not found'}), 404

        project_name = project_result[0] or "Board Search"
        project_desc = project_result[1] or ""

        # 1. Fetch gaps for this project
        # Note: We need embeddings for these gaps to do pgvector comparison.
        gaps_result = db.execute(text("""
            SELECT category_name, category_id
            FROM project_gaps_v2
            WHERE project_id = :pid
        """), {"pid": project_id}).fetchall()
        
        if not gaps_result:
            return jsonify({'success': True, 'candidates': []})
        
        # Prepare gap embeddings (cached in memory for this request)
        gap_embeddings = {}
        for row in gaps_result:
            cat_name = row[0]
            cat_id = row[1]
            
            # Check if we have an embedding in gap_analysis.
            emb_result = db.execute(text("""
                SELECT gap_embedding FROM gap_analysis 
                WHERE project_id = :pid AND gap_title = :title
                LIMIT 1
            """), {"pid": project_id, "title": cat_name}).fetchone()
            
            # Fallback to generating if missing
            if not emb_result or not emb_result[0]:
                print(f"Generating missing embedding for gap: {cat_name}")
                embedding = claude_service.generate_embedding(cat_name)
                if embedding:
                    gap_embeddings[cat_name] = embedding
            else:
                gap_embeddings[cat_name] = emb_result[0]
        
        # 2. Fetch candidates for this project
        candidates_query = db.query(ProjectCandidate, Candidate).join(
            Candidate, ProjectCandidate.candidate_id == Candidate.id
        ).filter(ProjectCandidate.project_id == project_id).all()
        
        results = []
        
        for pc, c in candidates_query:
            candidate_scores = {}
            total_fit = 0
            
            if c.bio_embedding is not None and gap_embeddings:
                for gap_name, gap_emb in gap_embeddings.items():
                    sim_result = db.execute(text("""
                        SELECT 1 - (CAST(:c_emb AS vector) <=> CAST(:g_emb AS vector)) AS similarity
                    """), {
                        "c_emb": str(c.bio_embedding.tolist()),
                        "g_emb": str(gap_emb if isinstance(gap_emb, list) else list(gap_emb))
                    }).fetchone()
                    
                    score = float(sim_result[0]) if sim_result else 0.0
                    candidate_scores[gap_name] = round(score * 100, 1)
                    total_fit += score
            
            pc.gap_coverage_scores = {
                "gaps_filled": [name for name, score in candidate_scores.items() if score >= 70],
                "gap_scores": candidate_scores,
                "total_gaps_addressed": len(candidate_scores),
                "weighted_score": round((total_fit / len(gap_embeddings) * 100), 1) if gap_embeddings else 0
            }
            pc.overall_match_score = pc.gap_coverage_scores["weighted_score"] / 100.0
            
            if not pc.match_reasoning:
                pc.match_reasoning = document_service.generate_strategy_fit_summary(
                    c.name, 
                    candidate_scores, 
                    project_name=project_name, 
                    project_description=project_desc
                )
            
            results.append({
                'id': pc.id,
                'candidate_id': c.id,
                'name': c.name,
                'title': c.title,
                'company': c.company,
                'status': pc.status,
                'match_score': round(pc.overall_match_score * 100, 1),
                'gap_coverage_scores': candidate_scores,
                'match_reasoning': pc.match_reasoning,
                'source': pc.source
            })
        
        db.commit()
        
        return jsonify({
            'success': True,
            'candidates': results
        })
    finally:
        try:
            next(db_gen)
        except StopIteration:
            pass

@project_bp.route('/projects', methods=['GET'])
@login_required
def get_projects():
    """Get all projects for current user"""
    db = next(get_db())
    
    # Get all active projects (for now, show all to admin)
    result = db.execute(text("""
        SELECT 
            p.id,
            p.client_name,
            p.board_name,
            p.company_ticker,
            p.industry,
            p.status,
            p.created_at,
            p.target_completion_date,
            p.description,
            (SELECT COUNT(*) FROM board_members WHERE project_id = p.id AND deleted_at IS NULL) as board_member_count,
            (SELECT COUNT(*) FROM gap_analysis WHERE project_id = p.id AND deleted_at IS NULL) as gap_count,
            (SELECT COUNT(*) FROM project_candidates WHERE project_id = p.id) as candidate_count
        FROM projects p
        WHERE p.deleted_at IS NULL
        ORDER BY p.last_activity_at DESC
    """))
    
    projects = []
    for row in result:
        projects.append({
            'id': row[0],
            'client_name': row[1],
            'board_name': row[2],
            'company_ticker': row[3],
            'industry': row[4],
            'status': row[5],
            'created_at': row[6].isoformat() if row[6] else None,
            'target_completion_date': row[7].isoformat() if row[7] else None,
            'description': row[8],
            'board_member_count': row[9],
            'gap_count': row[10],
            'candidate_count': row[11]
        })
    
    return jsonify(projects)

@project_bp.route('/projects/<int:project_id>', methods=['GET'])
@login_required
def get_project(project_id):
    """Get single project with full details"""
    db = next(get_db())
    
    # Get project
    result = db.execute(text("""
        SELECT 
            id, client_name, board_name, company_ticker, industry, status,
            created_at, target_completion_date, description, project_settings
        FROM projects
        WHERE id = :project_id AND deleted_at IS NULL
    """), {"project_id": project_id})
    
    row = result.fetchone()
    if not row:
        return jsonify({'error': 'Project not found'}), 404
    
    project = {
        'id': row[0],
        'client_name': row[1],
        'board_name': row[2],
        'company_ticker': row[3],
        'industry': row[4],
        'status': row[5],
        'created_at': row[6].isoformat() if row[6] else None,
        'target_completion_date': row[7].isoformat() if row[7] else None,
        'description': row[8],
        'project_settings': row[9]
    }
    
    # Get board members
    result = db.execute(text("""
        SELECT id, name, organization, position, matrix_data
        FROM board_members
        WHERE project_id = :project_id AND deleted_at IS NULL
        ORDER BY name
    """), {"project_id": project_id})
    
    board_members = []
    for row in result:
        board_members.append({
            'id': row[0],
            'name': row[1],
            'organization': row[2],
            'position': row[3],
            'matrix_data': row[4]
        })
    
    project['board_members'] = board_members
    
    # Get gaps
    result = db.execute(text("""
        SELECT 
            id, gap_category, gap_title, gap_description, 
            priority, priority_score, target_profile, status
        FROM gap_analysis
        WHERE project_id = :project_id AND deleted_at IS NULL
        ORDER BY priority_score DESC
    """), {"project_id": project_id})
    
    gaps = []
    for row in result:
        gaps.append({
            'id': row[0],
            'category': row[1],
            'title': row[2],
            'description': row[3],
            'priority': row[4],
            'priority_score': row[5],
            'target_profile': row[6],
            'status': row[7]
        })
    
    project['gaps'] = gaps
    
    # Get candidates
    result = db.execute(text("""
        SELECT 
            pc.id, pc.status, pc.overall_match_score, pc.source,
            c.id as candidate_id, c.name, c.title, c.company
        FROM project_candidates pc
        JOIN candidates c ON pc.candidate_id = c.id
        WHERE pc.project_id = :project_id
        ORDER BY pc.overall_match_score DESC NULLS LAST
    """), {"project_id": project_id})
    
    candidates = []
    for row in result:
        candidates.append({
            'id': row[0],
            'status': row[1],
            'match_score': row[2],
            'source': row[3],
            'candidate': {
                'id': row[4],
                'name': row[5],
                'title': row[6],
                'company': row[7]
            }
        })
    
    project['candidates'] = candidates
    
    return jsonify(project)

@project_bp.route('/projects', methods=['POST'])
@login_required
def create_project():
    """Create new project"""
    data = request.get_json()
    
    # Validate required fields
    if not data.get('client_name'):
        return jsonify({'error': 'client_name is required'}), 400
    
    db = next(get_db())
    
    result = db.execute(text("""
        INSERT INTO projects (
            client_name,
            board_name,
            company_ticker,
            industry,
            status,
            target_completion_date,
            description,
            lead_consultant_id
        ) VALUES (
            :client_name,
            :board_name,
            :company_ticker,
            :industry,
            :status,
            :target_date,
            :description,
            :user_id
        ) RETURNING id
    """), {
        "client_name": data['client_name'],
        "board_name": data.get('board_name'),
        "company_ticker": data.get('company_ticker'),
        "industry": data.get('industry'),
        "status": data.get('status', 'active'),
        "target_date": data.get('target_completion_date'),
        "description": data.get('description'),
        "user_id": current_user.id
    })
    
    project_id = result.fetchone()[0]
    
    # Log activity
    db.execute(text("""
        INSERT INTO project_activity (
            project_id, user_id, activity_type, activity_description
        ) VALUES (
            :project_id, :user_id, 'project_created', :description
        )
    """), {
        "project_id": project_id,
        "user_id": current_user.id,
        "description": f"Created project: {data['client_name']}"
    })
    
    db.commit()
    
    return jsonify({'id': project_id, 'message': 'Project created successfully'}), 201

@project_bp.route('/projects/<int:project_id>', methods=['PUT'])
@login_required
def update_project(project_id):
    """Update project"""
    data = request.get_json()
    db = next(get_db())
    
    # Build update query dynamically based on provided fields
    update_fields = []
    params = {"project_id": project_id}
    
    allowed_fields = ['client_name', 'board_name', 'company_ticker', 'industry', 'status', 'description']
    for field in allowed_fields:
        if field in data:
            update_fields.append(f"{field} = :{field}")
            params[field] = data[field]
    
    if 'target_completion_date' in data:
        update_fields.append("target_completion_date = :target_date")
        params['target_date'] = data['target_completion_date']
    
    if not update_fields:
        return jsonify({'error': 'No fields to update'}), 400
    
    query = f"""
        UPDATE projects 
        SET {', '.join(update_fields)}, last_activity_at = NOW()
        WHERE id = :project_id AND deleted_at IS NULL
    """
    
    db.execute(text(query), params)
    db.commit()
    
    return jsonify({'message': 'Project updated successfully'})

@project_bp.route('/projects/<int:project_id>', methods=['DELETE'])
@login_required
def delete_project(project_id):
    """Soft delete project"""
    db = next(get_db())
    
    db.execute(text("""
        UPDATE projects 
        SET deleted_at = NOW()
        WHERE id = :project_id
    """), {"project_id": project_id})
    
    db.commit()
    
    return jsonify({'message': 'Project deleted successfully'})

@project_bp.route('/projects/<int:project_id>/board-members', methods=['POST'])
@login_required
def add_board_member(project_id):
    """Add board member to project"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'name is required'}), 400
    
    db = next(get_db())
    
    # Prepare matrix_data
    matrix_data = data.get('matrix_data', {})
    
    result = db.execute(text("""
        INSERT INTO board_members (
            project_id, name, organization, position, 
            linkedin_url, matrix_data, data_source
        ) VALUES (
            :project_id, :name, :organization, :position,
            :linkedin_url, CAST(:matrix_data AS jsonb), :data_source
        ) RETURNING id
    """), {
        "project_id": project_id,
        "name": data['name'],
        "organization": data.get('organization'),
        "position": data.get('position'),
        "linkedin_url": data.get('linkedin_url'),
        "matrix_data": json.dumps(matrix_data),
        "data_source": data.get('data_source', 'manual')
    })
    
    member_id = result.fetchone()[0]
    db.commit()
    
    return jsonify({'id': member_id, 'message': 'Board member added successfully'}), 201
