import sys
sys.path.insert(0, '.')

from routes.framework_routes import framework_bp
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.register_blueprint(framework_bp, url_prefix='/api')

# Test the route
with app.test_client() as client:
    print("Testing framework generation...")
    response = client.post('/api/projects/3/generate-framework', 
        json={
            "company_name": "Nike, Inc.",
            "industry": "Athletic Apparel & Retail",
            "description": "Global leader",
            "ticker": "NKE",
            "strategic_priorities": ["Digital"],
            "company_stage": "mature"
        }
    )
    
    print(f"Status: {response.status_code}")
    print(f"Response: {response.get_data(as_text=True)}")
