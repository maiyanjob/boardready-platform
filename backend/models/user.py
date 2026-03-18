from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from flask_login import UserMixin
from .base import Base

class User(UserMixin, Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
    name = Column(String(200))
    role = Column(String(50))  # 'MD', 'Strategist', 'ProgramDirector'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<User {self.email}>'
