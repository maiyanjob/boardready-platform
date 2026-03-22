from flask import Blueprint, request, jsonify
from flask_login import login_required
from models.base import SessionLocal
from models.board import Board
from services.claude_service import claude_service
from datetime import datetime

board_bp = Blueprint('board', __name__)

@board_bp.route('/boards', methods=['POST'])
@login_required
def create_board():
    """Create a new board with AI-generated embeddings"""
    data = request.get_json()
    db = SessionLocal()
    
    try:
        # Generate embedding for description
        description_embedding = None
        if data.get('description'):
            description_embedding = claude_service.generate_embedding(data['description'])
        
        # Parse date if provided
        last_proxy_date = None
        if data.get('last_proxy_date'):
            last_proxy_date = datetime.strptime(data['last_proxy_date'], '%Y-%m-%d').date()
        
        board = Board(
            company_name=data['company_name'],
            ticker=data.get('ticker'),
            description=data.get('description'),
            sector=data.get('sector'),
            last_proxy_date=last_proxy_date,
            description_embedding=description_embedding
        )
        
        db.add(board)
        db.commit()
        
        return jsonify({
            'message': 'Board created successfully',
            'board': {
                'id': board.id,
                'company_name': board.company_name,
                'ticker': board.ticker
            }
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        db.close()

@board_bp.route('/boards', methods=['GET'])
@login_required
def get_boards():
    """Get all boards"""
    db = SessionLocal()
    
    boards = db.query(Board).all()
    
    return jsonify({
        'boards': [{
            'id': b.id,
            'company_name': b.company_name,
            'ticker': b.ticker,
            'description': b.description,
            'sector': b.sector,
            'last_proxy_date': b.last_proxy_date.isoformat() if b.last_proxy_date else None
        } for b in boards]
    })

@board_bp.route('/boards/search', methods=['POST'])
@login_required
def search_boards():
    """Semantic search for boards"""
    data = request.get_json()
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'Query is required'}), 400
    
    db = SessionLocal()
    
    # Use semantic search
    results = claude_service.semantic_search(
        query=query,
        embedding_column=Board.description_embedding,
        model_class=Board,
        db=db,
        limit=data.get('limit', 5)
    )
    
    return jsonify({
        'results': [{
            'id': b.id,
            'company_name': b.company_name,
            'ticker': b.ticker,
            'description': b.description,
            'sector': b.sector
        } for b in results]
    })

@board_bp.route('/boards/<int:board_id>', methods=['GET'])
@login_required
def get_board(board_id):
    """Get a specific board"""
    db = SessionLocal()
    board = db.query(Board).get(board_id)
    
    if not board:
        return jsonify({'error': 'Board not found'}), 404
    
    return jsonify({
        'id': board.id,
        'company_name': board.company_name,
        'ticker': board.ticker,
        'description': board.description,
        'sector': board.sector,
        'last_proxy_date': board.last_proxy_date.isoformat() if board.last_proxy_date else None
    })

@board_bp.route('/boards/<int:board_id>/match-candidates', methods=['POST'])
@login_required
def match_candidates_to_board(board_id):
    """Find best candidate matches for a board using AI"""
    db = SessionLocal()
    
    board = db.query(Board).get(board_id)
    if not board:
        return jsonify({'error': 'Board not found'}), 404
    
    # Use board description to find matching candidates
    from models.candidate import Candidate
    
    results = claude_service.semantic_search(
        query=board.description,
        embedding_column=Candidate.bio_embedding,
        model_class=Candidate,
        db=db,
        limit=request.get_json().get('limit', 5) if request.get_json() else 5
    )
    
    return jsonify({
        'board': {
            'id': board.id,
            'company_name': board.company_name,
            'sector': board.sector
        },
        'matched_candidates': [{
            'id': c.id,
            'name': c.name,
            'title': c.title,
            'company': c.company,
            'bio': c.bio,
            'years_experience': c.years_experience,
            'board_count': c.board_count
        } for c in results]
    })
