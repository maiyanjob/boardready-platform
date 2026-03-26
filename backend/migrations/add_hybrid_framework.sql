-- Lightweight industry starter templates (NOT rigid!)
CREATE TABLE industry_starter_templates (
    id SERIAL PRIMARY KEY,
    industry_category VARCHAR(100),  -- 'retail', 'technology', 'finance', etc.
    suggested_categories JSONB,  -- Starter categories Claude can adapt
    common_keywords TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI-generated custom frameworks (The actual framework Claude creates)
CREATE TABLE project_gap_frameworks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    generation_prompt TEXT,  -- What we asked Claude
    claude_rationale TEXT,  -- Why Claude chose these categories
    categories JSONB,  -- The framework Claude generated
    source_documents TEXT[],  -- If 10-K or docs were analyzed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual gap categories (from Claude's framework)
CREATE TABLE project_gap_categories (
    id SERIAL PRIMARY KEY,
    framework_id INTEGER REFERENCES project_gap_frameworks(id),
    project_id INTEGER REFERENCES projects(id),
    category_name VARCHAR(200),
    description TEXT,
    required_keywords TEXT[],
    target_coverage INTEGER,
    priority_score INTEGER,
    claude_reasoning TEXT,  -- Why this category matters for THIS company
    evidence_source TEXT,  -- "10-K page 42", "Company website", "Industry analysis"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gap analysis results (board vs framework)
CREATE TABLE project_gap_analysis (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    category_id INTEGER REFERENCES project_gap_categories(id),
    category_name VARCHAR(200),
    current_coverage DECIMAL(5,2),
    target_coverage INTEGER,
    gap_score INTEGER,
    priority VARCHAR(20),
    board_members_with_expertise TEXT[],
    board_members_missing TEXT[],
    recommendations TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed lightweight starter templates
INSERT INTO industry_starter_templates (industry_category, suggested_categories, common_keywords) VALUES
('retail_apparel', 
 '[
   {"name": "Digital Commerce", "keywords": ["e-commerce", "digital", "DTC", "omnichannel"]},
   {"name": "Supply Chain", "keywords": ["supply chain", "manufacturing", "logistics"]},
   {"name": "Brand Strategy", "keywords": ["marketing", "brand", "consumer"]},
   {"name": "Sustainability", "keywords": ["sustainability", "ESG", "climate"]},
   {"name": "International", "keywords": ["international", "global", "expansion"]}
 ]'::jsonb,
 ARRAY['retail', 'apparel', 'consumer', 'brand']),

('technology_software', 
 '[
   {"name": "Product Development", "keywords": ["product", "engineering", "development"]},
   {"name": "AI/ML", "keywords": ["AI", "ML", "machine learning", "data science"]},
   {"name": "Cybersecurity", "keywords": ["security", "cybersecurity", "privacy"]},
   {"name": "Cloud Infrastructure", "keywords": ["cloud", "infrastructure", "SaaS"]},
   {"name": "Go-to-Market", "keywords": ["sales", "marketing", "growth"]}
 ]'::jsonb,
 ARRAY['technology', 'software', 'SaaS', 'platform']),

('financial_services',
 '[
   {"name": "Regulation", "keywords": ["regulatory", "compliance", "SEC", "banking"]},
   {"name": "Fintech", "keywords": ["fintech", "digital banking", "payments"]},
   {"name": "Risk Management", "keywords": ["risk", "capital", "credit"]},
   {"name": "Cybersecurity", "keywords": ["cybersecurity", "fraud", "security"]}
 ]'::jsonb,
 ARRAY['financial', 'banking', 'investment']);

COMMIT;
