from sqlalchemy import Column, Integer, String, Text, DateTime, LargeBinary
from pgvector.sqlalchemy import Vector
from datetime import datetime
from .base import Base

class Document(Base):
    __tablename__ = 'documents'
    
    id = Column(Integer, primary_key=True)
    filename = Column(String(500), nullable=False)
    file_type = Column(String(50))  # 'pdf', 'docx', etc.
    content = Column(Text)  # Extracted text
    
    # For semantic search
    content_embedding = Column(Vector(1536))
    
    # Metadata
    uploaded_by = Column(Integer)  # user_id
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Document {self.filename}>'
