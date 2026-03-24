-- Migration 002: Projects-First Architecture
-- Date: 2026-03-24
-- Purpose: Add project-based workspace system for board searches

-- =============================================================================
-- CORE: Projects (Board Searches)
-- =============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    
    -- Client info
    client_name VARCHAR(255) NOT NULL,
    board_name VARCHAR(255),
    company_ticker VARCHAR(10),
    industry VARCHAR(100),
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
    
    -- Dates
    created_at TIMESTAMP DEFAULT NOW(),
    target_completion_date DATE,
    started_at DATE,
    completed_at DATE,
    
    -- Team assignment
    lead_consultant_id INTEGER REFERENCES users(id),
    team_member_ids INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    
    -- Flexible settings (allows adding features without schema changes)
    project_settings JSONB DEFAULT '{
        "diversity_targets": {
            "gender_min_female": 0.40,
            "age_under_50_target": 0.30,
            "racial_diversity_target": 0.30
        },
        "priority_gaps": [],
        "client_preferences": {}
    }'::JSONB,
    
    -- Notes
    description TEXT,
    internal_notes TEXT,
    
    -- Activity tracking
    last_activity_at TIMESTAMP DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP
);

-- =============================================================================
-- Board Matrix (Current Board Composition)
-- =============================================================================
CREATE TABLE IF NOT EXISTS board_members (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Basic information
    name VARCHAR(255) NOT NULL,
    organization VARCHAR(255),
    position VARCHAR(255),
    linkedin_url VARCHAR(500),
    email VARCHAR(255),
    phone VARCHAR(50),
    
    -- Matrix data (JSONB for maximum flexibility)
    matrix_data JSONB DEFAULT '{
        "demographics": {
            "gender": null,
            "age_range": null,
            "race_ethnicity": null,
            "has_disability": false
        },
        "professional": {
            "sector": null,
            "expertise": [],
            "community_connections": [],
            "personal_style": [],
            "years_on_board": null
        },
        "geography": {
            "primary_location": null,
            "regions": []
        },
        "additional": {}
    }'::JSONB,
    
    -- Data quality tracking
    data_source VARCHAR(50) DEFAULT 'manual' CHECK (data_source IN ('manual', 'linkedin', 'ai_enriched', 'uploaded')),
    auto_filled BOOLEAN DEFAULT false,
    confidence_scores JSONB DEFAULT '{}'::JSONB,
    last_verified_at TIMESTAMP,
    verified_by_user_id INTEGER REFERENCES users(id),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP
);

-- =============================================================================
-- Gap Analysis (What's Missing from Board)
-- =============================================================================
CREATE TABLE IF NOT EXISTS gap_analysis (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Gap classification
    gap_category VARCHAR(100) NOT NULL CHECK (gap_category IN (
        'expertise', 'diversity_gender', 'diversity_race', 'diversity_age',
        'geography', 'governance', 'industry', 'network', 'other'
    )),
    gap_title VARCHAR(255) NOT NULL,
    gap_description TEXT,
    
    -- Priority
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
    priority_score INTEGER DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
    
    -- AI analysis
    gap_embedding VECTOR(1024), -- For semantic matching
    ai_generated BOOLEAN DEFAULT false,
    ai_confidence FLOAT CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
    ai_reasoning TEXT,
    
    -- Target profile (what we're looking for)
    target_profile JSONB DEFAULT '{
        "expertise_required": [],
        "demographics_preferred": {},
        "geography_preferred": [],
        "other_requirements": {}
    }'::JSONB,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'filled', 'deferred', 'closed')),
    filled_by_candidate_id INTEGER REFERENCES candidates(id),
    filled_at TIMESTAMP,
    deferred_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Soft delete
    deleted_at TIMESTAMP
);

-- =============================================================================
-- Project Candidates (Candidate Pipeline per Project)
-- =============================================================================
CREATE TABLE IF NOT EXISTS project_candidates (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    candidate_id INTEGER NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    
    -- Sourcing information
    source VARCHAR(50) DEFAULT 'internal_db' CHECK (source IN (
        'internal_db', 'linkedin', 'referral', 'uploaded', 'external_search', 'client_provided'
    )),
    sourced_by_user_id INTEGER REFERENCES users(id),
    sourced_at TIMESTAMP DEFAULT NOW(),
    sourcing_notes TEXT,
    
    -- Matching scores
    overall_match_score FLOAT CHECK (overall_match_score >= 0 AND overall_match_score <= 1),
    gap_coverage_scores JSONB DEFAULT '{
        "gaps_filled": [],
        "gap_scores": {},
        "total_gaps_addressed": 0,
        "weighted_score": 0
    }'::JSONB,
    match_reasoning TEXT,
    
    -- Pipeline status
    status VARCHAR(50) DEFAULT 'sourced' CHECK (status IN (
        'sourced', 'reviewed', 'shortlisted', 'submitted', 
        'interviewing', 'finalist', 'placed', 'rejected', 'withdrawn'
    )),
    status_changed_at TIMESTAMP DEFAULT NOW(),
    status_changed_by_user_id INTEGER REFERENCES users(id),
    
    -- Team collaboration
    team_notes JSONB DEFAULT '[]'::JSONB,
    /* Format: [
        {"user_id": 1, "timestamp": "2026-03-24T10:30:00", "note": "Great culture fit"},
        {"user_id": 2, "timestamp": "2026-03-25T14:00:00", "note": "Client interested"}
    ] */
    
    -- Client interaction
    submitted_to_client_at TIMESTAMP,
    submitted_by_user_id INTEGER REFERENCES users(id),
    client_feedback TEXT,
    client_interested BOOLEAN,
    
    -- Interview tracking
    interview_scheduled_at TIMESTAMP,
    interview_completed_at TIMESTAMP,
    interview_feedback TEXT,
    
    -- Placement
    placement_date DATE,
    placement_terms JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(project_id, candidate_id) -- Can't add same candidate twice to same project
);

-- =============================================================================
-- Deliverables (Client-Facing Documents)
-- =============================================================================
CREATE TABLE IF NOT EXISTS deliverables (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Document metadata
    document_type VARCHAR(100) NOT NULL CHECK (document_type IN (
        'board_matrix', 'gap_analysis', 'candidate_profiles', 
        'diversity_report', 'final_report', 'presentation', 'other'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    
    -- File information
    file_path VARCHAR(500),
    file_format VARCHAR(20) CHECK (file_format IN ('pdf', 'xlsx', 'docx', 'pptx')),
    file_size_kb INTEGER,
    
    -- Generation metadata
    generated_by_ai BOOLEAN DEFAULT false,
    generated_by_user_id INTEGER REFERENCES users(id),
    generation_params JSONB DEFAULT '{}'::JSONB,
    template_used VARCHAR(100),
    
    -- Client delivery
    sent_to_client BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    sent_by_user_id INTEGER REFERENCES users(id),
    send_method VARCHAR(50), -- 'email', 'portal', 'in_person'
    
    -- Client feedback
    client_viewed_at TIMESTAMP,
    client_feedback TEXT,
    requires_revision BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- Project Activity Log (Audit Trail)
-- =============================================================================
CREATE TABLE IF NOT EXISTS project_activity (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    
    -- Activity details
    activity_type VARCHAR(100) NOT NULL,
    activity_description TEXT NOT NULL,
    
    -- Flexible metadata
    metadata JSONB DEFAULT '{}'::JSONB,
    
    -- Timestamp
    created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================================================
-- Performance Indexes
-- =============================================================================

-- Projects
CREATE INDEX idx_projects_status ON projects(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_lead ON projects(lead_consultant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_created ON projects(created_at DESC);
CREATE INDEX idx_projects_activity ON projects(last_activity_at DESC);

-- Board Members
CREATE INDEX idx_board_members_project ON board_members(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_board_members_name ON board_members(name);
CREATE INDEX idx_board_members_matrix_gender ON board_members((matrix_data->'demographics'->>'gender'));
CREATE INDEX idx_board_members_matrix_data ON board_members USING GIN(matrix_data);

-- Gap Analysis
CREATE INDEX idx_gap_analysis_project ON gap_analysis(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_gap_analysis_status ON gap_analysis(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_gap_analysis_priority ON gap_analysis(priority);
CREATE INDEX idx_gap_analysis_category ON gap_analysis(gap_category);
CREATE INDEX idx_gap_analysis_embedding ON gap_analysis USING ivfflat (gap_embedding vector_cosine_ops);

-- Project Candidates
CREATE INDEX idx_project_candidates_project ON project_candidates(project_id);
CREATE INDEX idx_project_candidates_candidate ON project_candidates(candidate_id);
CREATE INDEX idx_project_candidates_status ON project_candidates(status);
CREATE INDEX idx_project_candidates_score ON project_candidates(overall_match_score DESC);
CREATE INDEX idx_project_candidates_sourced ON project_candidates(sourced_at DESC);

-- Deliverables
CREATE INDEX idx_deliverables_project ON deliverables(project_id);
CREATE INDEX idx_deliverables_type ON deliverables(document_type);
CREATE INDEX idx_deliverables_sent ON deliverables(sent_to_client, sent_at);

-- Activity Log
CREATE INDEX idx_activity_project ON project_activity(project_id);
CREATE INDEX idx_activity_user ON project_activity(user_id);
CREATE INDEX idx_activity_created ON project_activity(created_at DESC);
CREATE INDEX idx_activity_type ON project_activity(activity_type);

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_board_members_updated_at BEFORE UPDATE ON board_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gap_analysis_updated_at BEFORE UPDATE ON gap_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_candidates_updated_at BEFORE UPDATE ON project_candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliverables_updated_at BEFORE UPDATE ON deliverables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE projects IS 'Core project/workspace table - each project represents one board search';
COMMENT ON TABLE board_members IS 'Current board composition for a project - flexible JSONB schema allows adding fields without migrations';
COMMENT ON TABLE gap_analysis IS 'Identified gaps in board composition with AI-powered recommendations';
COMMENT ON TABLE project_candidates IS 'Candidate pipeline per project with scoring and status tracking';
COMMENT ON TABLE deliverables IS 'Client-facing documents generated for each project';
COMMENT ON TABLE project_activity IS 'Audit log of all project activities';

-- Migration complete
