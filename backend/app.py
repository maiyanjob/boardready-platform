from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import os

from models import get_db, User, Candidate, Board, Document
from models.base import SessionLocal
from routes.candidate_routes import candidate_bp
from routes.board_routes import board_bp

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY')
CORS(app)

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    db = SessionLocal()
    return db.query(User).get(int(user_id))

# Register blueprints
app.register_blueprint(candidate_bp, url_prefix='/api')
app.register_blueprint(board_bp, url_prefix='/api')

# Auth Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    db = SessionLocal()
    
    existing_user = db.query(User).filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400
    
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        name=data.get('name'),
        role=data.get('role', 'Strategist')
    )
    db.add(user)
    db.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    db = SessionLocal()
    
    user = db.query(User).filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    login_user(user)
    
    return jsonify({
        'message': 'Logged in successfully',
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role
        }
    })

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'})

@app.route('/api/me', methods=['GET'])
@login_required
def get_current_user():
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'name': current_user.name,
        'role': current_user.role
    })

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'BoardReady API Running!'})

if __name__ == '__main__':
    print("✅ Flask app ready!")
    print("✅ Auth system configured!")
    print("✅ Candidate routes loaded!")
    print("✅ Board routes loaded!")
    print("📍 API running on http://localhost:5000")
    app.run(debug=True, port=5000)
