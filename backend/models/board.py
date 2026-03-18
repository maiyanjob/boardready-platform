from sqlalchemy import Column, Integer, String, Text, Date, DateTime
from pgvector.sqlalchemy import Vector
from datetime import datetime
from .base import Base

class Board(Base):
    __tablename__ = 'boards'
    
    id = Column(Integer, primary_key=True)
    company_name = Column(String(200), nullable=False)
    ticker = Column(String(10))
    description = Column(Text)
    sector = Column(String(100))
    last_proxy_date = Column(Date)
    
    # Semantic search
    description_embedding = Column(Vector(1536))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Board {self.company_name}>'
