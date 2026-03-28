from sqlalchemy import Column, Integer, String, Text, ARRAY, DateTime, Float, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
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
    
    # Voyage embeddings (1024 dimensions)
    bio_embedding = Column(Vector(1024))
    
    # Structured data
    years_experience = Column(Integer)
    board_count = Column(Integer)
    industries = Column(ARRAY(String))
    skills = Column(ARRAY(String))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<Candidate {self.name}>'

class ProjectCandidate(Base):
    __tablename__ = 'project_candidates'
    
    id = Column(Integer, primary_key=True)
    project_id = Column(Integer, nullable=False) # ForeignKey('projects.id') - assuming projects table exists but no model yet
    candidate_id = Column(Integer, ForeignKey('candidates.id'), nullable=False)
    
    source = Column(String(50), default='internal_db')
    sourced_by_user_id = Column(Integer)
    sourced_at = Column(DateTime, default=datetime.utcnow)
    sourcing_notes = Column(Text)
    
    overall_match_score = Column(Float)
    gap_coverage_scores = Column(JSONB, default=lambda: {
        "gaps_filled": [],
        "gap_scores": {},
        "total_gaps_addressed": 0,
        "weighted_score": 0
    })
    match_reasoning = Column(Text)
    
    status = Column(String(50), default='sourced')
    status_changed_at = Column(DateTime, default=datetime.utcnow)
    status_changed_by_user_id = Column(Integer)
    
    team_notes = Column(JSONB, default=list)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (UniqueConstraint('project_id', 'candidate_id', name='_project_candidate_uc'),)

    def __repr__(self):
        return f'<ProjectCandidate project={self.project_id} candidate={self.candidate_id}>'
