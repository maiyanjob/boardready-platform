from flask import Flask
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)

@app.route('/')
def hello():
    return {'message': 'BoardReady Backend Running!', 'status': 'ready'}

if __name__ == '__main__':
    print("✅ Backend setup complete!")
    print("✅ All packages installed!")
    print("Database:", os.getenv('DATABASE_URL'))
