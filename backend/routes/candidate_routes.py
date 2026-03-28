from flask import Blueprint, request, jsonify
from flask_login import login_required
from models.base import SessionLocal
from models.candidate import Candidate
from services.claude_service import claude_service

candidate_bp = Blueprint('candidate', __name__)

@candidate_bp.route('/candidates', methods=['POST'])
@login_required
def create_candidate():
    """Create a new candidate with AI-generated embeddings"""
    data = request.get_json()
    db = SessionLocal()
    
    try:
        # Generate embedding for bio
        bio_embedding = None
        if data.get('bio'):
            bio_embedding = claude_service.generate_embedding(data['bio'])
        
        candidate = Candidate(
            name=data['name'],
            title=data.get('title'),
            company=data.get('company'),
            bio=data.get('bio'),
            linkedin_url=data.get('linkedin_url'),
            bio_embedding=bio_embedding,
            years_experience=data.get('years_experience'),
            board_count=data.get('board_count', 0),
            industries=data.get('industries', []),
            skills=data.get('skills', [])
        )
        
        db.add(candidate)
        db.commit()
        
        return jsonify({
            'message': 'Candidate created successfully',
            'candidate': {
                'id': candidate.id,
                'name': candidate.name,
                'title': candidate.title
            }
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@candidate_bp.route('/candidates', methods=['GET'])
@login_required
def get_candidates():
    """Get all candidates"""
    db = SessionLocal()
    try:
        candidates = db.query(Candidate).all()
        
        return jsonify({
            'candidates': [{
                'id': c.id,
                'name': c.name,
                'title': c.title,
                'company': c.company,
                'bio': c.bio,
                'linkedin_url': c.linkedin_url,
                'years_experience': c.years_experience,
                'board_count': c.board_count,
                'industries': c.industries,
                'skills': c.skills,
                'gap_coverage_scores': getattr(c, 'gap_coverage_scores', None)
            } for c in candidates]
        })
    finally:
        db.close()

@candidate_bp.route('/candidates/search', methods=['POST'])
@login_required
def search_candidates():
    """Semantic search for candidates"""
    data = request.get_json()
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    db = SessionLocal()
    
    # Use semantic search
    results = claude_service.semantic_search(
        query=query,
        embedding_column=Candidate.bio_embedding,
        model_class=Candidate,
        db=db,
        limit=data.get('limit', 5)
    )
    
    return jsonify({
        'results': [{
            'id': c.id,
            'name': c.name,
            'title': c.title,
            'company': c.company,
            'bio': c.bio,
            'years_experience': c.years_experience,
            'board_count': c.board_count
        } for c in results]
    })

@candidate_bp.route('/candidates/<int:candidate_id>', methods=['GET'])
@login_required
def get_candidate(candidate_id):
    """Get a specific candidate"""
    db = SessionLocal()
    candidate = db.query(Candidate).get(candidate_id)
    
    if not candidate:
        return jsonify({'error': 'Candidate not found'}), 404
    
    return jsonify({
        'id': candidate.id,
        'name': candidate.name,
        'title': candidate.title,
        'company': candidate.company,
        'bio': candidate.bio,
        'linkedin_url': candidate.linkedin_url,
        'years_experience': candidate.years_experience,
        'board_count': candidate.board_count,
        'industries': candidate.industries,
        'skills': candidate.skills
    })
