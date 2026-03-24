from flask import Blueprint, request, jsonify, send_file
from flask_login import login_required
import csv
import io
from models.base import get_db
from models.candidate import Candidate
from models.board import Board
from services.claude_service import ClaudeService
from datetime import datetime

csv_bp = Blueprint('csv', __name__)
claude_service = ClaudeService()

@csv_bp.route('/export/candidates', methods=['GET'])
@login_required
def export_candidates():
    """Export all candidates to CSV"""
    db = next(get_db())
    candidates = db.query(Candidate).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Name', 'Title', 'Company', 'Bio', 'Years Experience', 'Board Count', 'Industries', 'Skills'])
    
    # Write data
    for candidate in candidates:
        writer.writerow([
            candidate.name,
            candidate.title,
            candidate.company,
            candidate.bio,
            candidate.years_experience,
            candidate.board_count,
            ','.join(candidate.industries) if candidate.industries else '',
            ','.join(candidate.skills) if candidate.skills else ''
        ])
    
    output.seek(0)
    
    # Convert to bytes for download
    bytes_output = io.BytesIO()
    bytes_output.write(output.getvalue().encode('utf-8'))
    bytes_output.seek(0)
    
    return send_file(
        bytes_output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'candidates_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    )

@csv_bp.route('/export/boards', methods=['GET'])
@login_required
def export_boards():
    """Export all boards to CSV"""
    db = next(get_db())
    boards = db.query(Board).all()
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Company Name', 'Ticker', 'Sector', 'Description', 'Last Proxy Date'])
    
    # Write data
    for board in boards:
        writer.writerow([
            board.company_name,
            board.ticker or '',
            board.sector,
            board.description,
            board.last_proxy_date.strftime('%Y-%m-%d') if board.last_proxy_date else ''
        ])
    
    output.seek(0)
    
    # Convert to bytes for download
    bytes_output = io.BytesIO()
    bytes_output.write(output.getvalue().encode('utf-8'))
    bytes_output.seek(0)
    
    return send_file(
        bytes_output,
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'boards_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    )

@csv_bp.route('/import/candidates', methods=['POST'])
@login_required
def import_candidates():
    """Import candidates from CSV with duplicate detection"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Read CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        db = next(get_db())
        added = 0
        skipped = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Validate required fields
                if not row.get('Name') or not row.get('Bio'):
                    errors.append(f"Row {row_num}: Missing required fields (Name, Bio)")
                    continue
                
                # Check for duplicate by name
                existing = db.query(Candidate).filter_by(name=row['Name']).first()
                if existing:
                    skipped += 1
                    continue
                
                # Generate embedding
                bio_embedding = claude_service.generate_embedding(row['Bio'])
                
                # Parse industries and skills
                industries = [i.strip() for i in row.get('Industries', '').split(',') if i.strip()]
                skills = [s.strip() for s in row.get('Skills', '').split(',') if s.strip()]
                
                # Create candidate
                candidate = Candidate(
                    name=row['Name'],
                    title=row.get('Title', ''),
                    company=row.get('Company', ''),
                    bio=row['Bio'],
                    bio_embedding=bio_embedding,
                    years_experience=int(row.get('Years Experience', 0)) if row.get('Years Experience') else 0,
                    board_count=int(row.get('Board Count', 0)) if row.get('Board Count') else 0,
                    industries=industries,
                    skills=skills
                )
                
                db.add(candidate)
                added += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        db.commit()
        
        return jsonify({
            'success': True,
            'added': added,
            'skipped': skipped,
            'errors': errors
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to process CSV: {str(e)}'}), 500

@csv_bp.route('/import/boards', methods=['POST'])
@login_required
def import_boards():
    """Import boards from CSV with duplicate detection"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'File must be a CSV'}), 400
    
    try:
        # Read CSV
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_reader = csv.DictReader(stream)
        
        db = next(get_db())
        added = 0
        skipped = 0
        errors = []
        
        for row_num, row in enumerate(csv_reader, start=2):
            try:
                # Validate required fields
                if not row.get('Company Name') or not row.get('Description'):
                    errors.append(f"Row {row_num}: Missing required fields (Company Name, Description)")
                    continue
                
                # Check for duplicate by company name
                existing = db.query(Board).filter_by(company_name=row['Company Name']).first()
                if existing:
                    skipped += 1
                    continue
                
                # Generate embedding
                description_embedding = claude_service.generate_embedding(row['Description'])
                
                # Parse date
                last_proxy_date = None
                if row.get('Last Proxy Date'):
                    try:
                        last_proxy_date = datetime.strptime(row['Last Proxy Date'], '%Y-%m-%d').date()
                    except:
                        pass
                
                # Create board
                board = Board(
                    company_name=row['Company Name'],
                    ticker=row.get('Ticker', ''),
                    sector=row.get('Sector', ''),
                    description=row['Description'],
                    description_embedding=description_embedding,
                    last_proxy_date=last_proxy_date
                )
                
                db.add(board)
                added += 1
                
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")
        
        db.commit()
        
        return jsonify({
            'success': True,
            'added': added,
            'skipped': skipped,
            'errors': errors
        })
        
    except Exception as e:
        return jsonify({'error': f'Failed to process CSV: {str(e)}'}), 500
