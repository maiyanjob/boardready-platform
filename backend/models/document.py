from sqlalchemy import Column, Integer, String, Text, DateTime
from pgvector.sqlalchemy import Vector
from datetime import datetime
from .base import Base

class Document(Base):
    __tablename__ = 'documents'
    
    id = Column(Integer, primary_key=True)
    filename = Column(String(500), nullable=False)
    file_type = Column(String(50))
    content = Column(Text)
    
    # Voyage embeddings (1024 dimensions)
    content_embedding = Column(Vector(1024))
    
    uploaded_by = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Document {self.filename}>'
