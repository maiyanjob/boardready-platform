# BoardReady Backend API

Base URL: `http://localhost:5000`

Authentication:
- Session-based auth with Flask-Login
- Most endpoints require a logged-in session cookie
- Public endpoints: `POST /api/register`, `POST /api/login`, `GET /api/health`

Common error handling:
- `400 Bad Request`: missing or invalid input
- `401 Unauthorized`: missing session for protected endpoint
- `404 Not Found`: missing resource
- `500 Internal Server Error`: unexpected backend or provider failure

## Auth Endpoints

### `POST /api/register`
- Auth: none
- Request JSON:
```json
{
  "email": "user@example.com",
  "password": "secret",
  "name": "User Name",
  "role": "MD"
}
```
- Response `200`:
```json
{"message": "User created successfully"}
```

### `POST /api/login`
- Auth: none
- Request JSON:
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
- Response `200`:
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "MD"
  }
}
```
- Errors: `401 {"error":"Invalid credentials"}`

### `POST /api/logout`
- Auth: required
- Response `200`: `{"message":"Logged out successfully"}`

### `GET /api/me`
- Auth: required
- Response `200`:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "MD"
}
```

### `GET /api/health`
- Auth: none
- Response `200`: `{"status":"ok"}`

## Candidate Endpoints

### `POST /api/candidates`
- Auth: required
- Request JSON:
```json
{
  "name": "Rachel Foster",
  "title": "Chief Sustainability Officer",
  "company": "GreenTech Ventures",
  "bio": "Sustainability leader...",
  "linkedin_url": "https://linkedin.com/in/example",
  "years_experience": 14,
  "board_count": 2,
  "industries": ["Sustainability", "ESG"],
  "skills": ["ESG Strategy", "Carbon Reduction"]
}
```
- Response `201`:
```json
{
  "message": "Candidate created successfully",
  "candidate": {
    "id": 41,
    "name": "Rachel Foster",
    "title": "Chief Sustainability Officer"
  }
}
```
- Errors: `500 {"error":"..."}` from embedding or DB failure

### `GET /api/candidates`
- Auth: required
- Response `200`:
```json
{
  "candidates": [
    {
      "id": 41,
      "name": "Rachel Foster",
      "title": "Chief Sustainability Officer",
      "company": "GreenTech Ventures",
      "bio": "Sustainability leader...",
      "linkedin_url": "https://linkedin.com/in/example",
      "years_experience": 14,
      "board_count": 2,
      "industries": ["Sustainability", "ESG"],
      "skills": ["ESG Strategy", "Carbon Reduction"],
      "gap_coverage_scores": {
        "Circular Economy & Sustainable Manufacturing": 0.92
      }
    }
  ]
}
```

### `POST /api/candidates/search`
- Auth: required
- Request JSON:
```json
{
  "query": "AI board director with retail experience",
  "limit": 5
}
```
- Response `200`:
```json
{
  "results": [
    {
      "id": 42,
      "name": "Samuel Lee",
      "title": "Chief Data Officer",
      "company": "DataVision Analytics",
      "bio": "Data executive...",
      "years_experience": 18,
      "board_count": 2
    }
  ]
}
```
- Errors: `400 {"error":"Query is required"}`

### `GET /api/candidates/<candidate_id>`
- Auth: required
- Response `200`: candidate detail object
- Errors: `404 {"error":"Candidate not found"}`

## Board Endpoints

### `POST /api/boards`
- Auth: required
- Request JSON:
```json
{
  "company_name": "Nike, Inc.",
  "ticker": "NKE",
  "description": "Global athletic apparel leader",
  "sector": "Retail",
  "last_proxy_date": "2026-03-01"
}
```
- Response `201`:
```json
{
  "message": "Board created successfully",
  "board": {
    "id": 7,
    "company_name": "Nike, Inc.",
    "ticker": "NKE"
  }
}
```

### `GET /api/boards`
- Auth: required
- Response `200`: `{"boards":[...]}` with board summary rows

### `POST /api/boards/search`
- Auth: required
- Request JSON: `{"query":"retail digital transformation board","limit":5}`
- Response `200`: `{"results":[...]}` board search results
- Errors: `400 {"error":"Query is required"}`

### `GET /api/boards/<board_id>`
- Auth: required
- Response `200`: board detail object
- Errors: `404 {"error":"Board not found"}`

### `POST /api/boards/<board_id>/match-candidates`
- Auth: required
- Optional request JSON: `{"limit": 5}`
- Response `200`:
```json
{
  "board": {
    "id": 7,
    "company_name": "Nike, Inc.",
    "sector": "Retail"
  },
  "matched_candidates": [
    {
      "id": 42,
      "name": "Samuel Lee",
      "title": "Chief Data Officer",
      "company": "DataVision Analytics",
      "bio": "Data executive...",
      "years_experience": 18,
      "board_count": 2
    }
  ]
}
```
- Errors: `404 {"error":"Board not found"}`

## Project Endpoints

### `GET /api/projects`
- Auth: required
- Response `200`: list of project summary objects with counts for board members, gaps, and candidates

### `POST /api/projects`
- Auth: required
- Request JSON:
```json
{
  "client_name": "Nike, Inc.",
  "board_name": "Nike Board of Directors",
  "company_ticker": "NKE",
  "industry": "Athletic Apparel & Retail",
  "status": "active",
  "target_completion_date": "2026-05-01",
  "description": "Board search for strategic growth and digital transformation"
}
```
- Response `201`: `{"id":3,"message":"Project created successfully"}`
- Errors: `400 {"error":"client_name is required"}`

### `GET /api/projects/<project_id>`
- Auth: required
- Response `200`:
```json
{
  "id": 3,
  "client_name": "Nike, Inc.",
  "board_name": "Nike Board of Directors",
  "company_ticker": "NKE",
  "industry": "Athletic Apparel & Retail",
  "status": "active",
  "created_at": "2026-03-28T00:00:00",
  "target_completion_date": "2026-05-01",
  "description": "Board search...",
  "project_settings": {},
  "board_members": [],
  "gaps": [],
  "candidates": []
}
```
- Errors: `404 {"error":"Project not found"}`

### `PUT /api/projects/<project_id>`
- Auth: required
- Request JSON: any subset of `client_name`, `board_name`, `company_ticker`, `industry`, `status`, `description`, `target_completion_date`
- Response `200`: `{"message":"Project updated successfully"}`
- Errors: `400 {"error":"No fields to update"}`

### `DELETE /api/projects/<project_id>`
- Auth: required
- Response `200`: `{"message":"Project deleted successfully"}`

### `POST /api/projects/<project_id>/board-members`
- Auth: required
- Request JSON:
```json
{
  "name": "Director Name",
  "organization": "Company",
  "position": "Independent Director",
  "linkedin_url": "https://linkedin.com/in/example",
  "data_source": "manual",
  "matrix_data": {
    "demographics": {"gender": "Female"},
    "background": {"bio": "Retail and AI leader"}
  }
}
```
- Response `201`: `{"id": 12, "message":"Board member added successfully"}`
- Errors: `400 {"error":"name is required"}`

### `GET /api/projects/<project_id>/candidates`
- Auth: required
- Purpose: joins `project_candidates` with `candidates`, computes semantic fit per project gap, persists scores, and returns UI-ready candidate cards
- Response `200`:
```json
{
  "success": true,
  "candidates": [
    {
      "id": 1,
      "candidate_id": 41,
      "name": "Rachel Foster",
      "title": "Chief Sustainability Officer",
      "company": "GreenTech Ventures",
      "status": "sourced",
      "match_score": 67.0,
      "gap_coverage_scores": {
        "Circular Economy & Sustainable Manufacturing": 92.0,
        "Data Analytics & AI-Driven Personalization": 48.0,
        "Global Supply Chain Resilience": 61.0
      },
      "match_reasoning": "Rachel Foster aligns strongly with Circular Economy & Sustainable Manufacturing.",
      "source": "internal_db"
    }
  ]
}
```
- Errors:
  - `404 {"error":"Project not found"}`
  - `401` for unauthenticated requests

## Framework and Dashboard Endpoints

### `POST /api/projects/<project_id>/generate-framework`
- Auth: required
- Request JSON:
```json
{
  "company_name": "Nike, Inc.",
  "industry": "Athletic Apparel & Retail",
  "description": "Global leader in athletic footwear and apparel",
  "ticker": "NKE",
  "strategic_priorities": ["Digital", "DTC", "China"],
  "company_stage": "mature"
}
```
- Response `200`:
```json
{
  "success": true,
  "framework_id": 9,
  "categories": [],
  "message": "Generated 8 intelligent gap categories"
}
```
- Errors: `500 {"error":"..."}` on AI or DB failure

### `POST /api/projects/<project_id>/analyze-gaps`
- Auth: required
- Request body: none
- Response `200`:
```json
{
  "success": true,
  "gaps": [],
  "total_categories": 8,
  "critical_gaps": 2
}
```

### `GET /api/projects/<project_id>/dashboard-data`
- Auth: required
- Response `200`:
```json
{
  "success": true,
  "gaps": [],
  "metrics": {
    "total_members": 9,
    "female_percentage": 22.2,
    "diverse_percentage": 33.3,
    "critical_gaps": 2,
    "high_gaps": 3,
    "total_gaps": 8
  }
}
```

## Chat Endpoint

### `POST /api/projects/<project_id>/chat`
- Auth: required
- Request JSON:
```json
{
  "message": "Summarize the highest-priority board gaps and recommend candidate profiles."
}
```
- Response `200`:
```json
{
  "response": "## Summary ...",
  "thinking_steps": ["Using get_board_gaps..."],
  "tool_calls": [],
  "model": "claude-sonnet-4",
  "tokens": 1234
}
```
- Errors:
  - `400 {"error":"Message is required"}`
  - `500 {"error":"AI request failed: ..."}`

## Document Endpoint

### `POST /api/projects/<project_id>/generate-report`
- Auth: required
- Request JSON:
```json
{
  "type": "executive_brief"
}
```
- Supported `type` values:
  - `board_analysis`
  - `ai_readiness`
  - `activist_defense`
  - `strategic_alignment`
  - `interlock_map`
  - `diversity_scorecard`
  - `executive_brief`
  - `gap_summary`
  - `candidate_dossier`
- Response `200`: downloadable `.docx` file
- Errors: `404 {"error":"Project not found"}`

## CSV Endpoints

### `GET /api/csv/export/candidates`
- Auth: required
- Response `200`: downloadable CSV of candidates

### `GET /api/csv/export/boards`
- Auth: required
- Response `200`: downloadable CSV of boards

### `POST /api/csv/import/candidates`
- Auth: required
- Multipart form:
  - field name: `file`
  - accepted extension: `.csv`
- Response `200`:
```json
{
  "success": true,
  "added": 10,
  "skipped": 2,
  "errors": []
}
```
- Errors:
  - `400 {"error":"No file provided"}`
  - `400 {"error":"No file selected"}`
  - `400 {"error":"File must be a CSV"}`
  - `500 {"error":"Failed to process CSV: ..."}`

### `POST /api/csv/import/boards`
- Auth: required
- Multipart form:
  - field name: `file`
  - accepted extension: `.csv`
- Response `200`: same shape as candidate import

## Curl Examples

Register:
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@boardready.com","password":"secret","name":"Admin","role":"MD"}'
```

Login and store session cookie:
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"admin@boardready.com","password":"secret"}'
```

List projects:
```bash
curl http://localhost:5000/api/projects -b cookies.txt
```

Get Nike project candidates:
```bash
curl http://localhost:5000/api/projects/3/candidates -b cookies.txt
```

Generate framework:
```bash
curl -X POST http://localhost:5000/api/projects/3/generate-framework \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"company_name":"Nike, Inc.","industry":"Athletic Apparel & Retail","description":"Global leader","ticker":"NKE","strategic_priorities":["Digital","China"],"company_stage":"mature"}'
```

Import candidates CSV:
```bash
curl -X POST http://localhost:5000/api/csv/import/candidates \
  -b cookies.txt \
  -F "file=@candidates.csv"
```
