from flask import Flask, jsonify
from flask_cors import CORS
from flask_login import LoginManager, login_user, logout_user, current_user, login_required
from werkzeug.security import check_password_hash
from dotenv import load_dotenv
import os

from models.base import get_db
from models.user import User
from routes.candidate_routes import candidate_bp
from routes.board_routes import board_bp
from routes.csv_routes import csv_bp
from routes.project_routes import project_bp

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False

# CORS configuration
CORS(app, supports_credentials=True, origins=['http://localhost:5173'])

# Flask-Login setup
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    db = next(get_db())
    return db.query(User).get(int(user_id))

# Auth routes (inline)
@app.route('/api/register', methods=['POST'])
def register():
    from flask import request
    from werkzeug.security import generate_password_hash
    
    data = request.get_json()
    db = next(get_db())
    
    existing_user = db.query(User).filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 400
    
    new_user = User(
        email=data['email'],
        name=data.get('name', ''),
        role=data.get('role', 'MD')
    )
    new_user.set_password(data['password'])
    
    db.add(new_user)
    db.commit()
    
    return jsonify({'message': 'User created successfully'})

@app.route('/api/login', methods=['POST'])
def login():
    from flask import request
    
    data = request.get_json()
    db = next(get_db())
    
    user = db.query(User).filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        login_user(user)
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role
            }
        })
    
    return jsonify({'error': 'Invalid credentials'}), 401

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

# Register blueprints
app.register_blueprint(candidate_bp, url_prefix='/api')
app.register_blueprint(board_bp, url_prefix='/api')
app.register_blueprint(csv_bp, url_prefix='/api/csv')
app.register_blueprint(project_bp, url_prefix='/api')

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    print("✅ Flask app ready!")
    print("✅ Board routes loaded!")
    print("✅ CSV routes loaded!")
    print("✅ Project routes loaded!")
    print("📍 API running on http://localhost:5000")
    app.run(debug=True, port=5000)
