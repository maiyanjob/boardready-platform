from sqlalchemy import Column, Integer, String, Text, ARRAY, DateTime
from pgvector.sqlalchemy import Vector
from datetime import datetime
from .base import Base

class Candidate(Base):
    __tablename__ = 'candidates'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(200), nullable=False)
    title = Column(String(200))
    company = Column(String(200))
    bio = Column(Text)
    linkedin_url = Column(String(500))
    
    # Semantic search with pgvector!
    bio_embedding = Column(Vector(1536))
    
    # Structured data
    years_experience = Column(Integer)
    board_count = Column(Integer)
    industries = Column(ARRAY(String))
    skills = Column(ARRAY(String))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Candidate {self.name}>'
