# Project Memory — BoardReady Platform

> Phase-level context. Update when milestones ship or priorities change.
> Last updated: 2026-03-27

## Current Phase: Phase 1 — Core Placement Workflow
**Goal:** Fully functional gap analysis → candidate matching → placement pipeline.

### Phase 1 Milestones
- [x] AI Intelligence Dashboard (BoardIntelligenceDashboard)
- [x] Board Skills Matrix Heatmap
- [x] Gap Analysis tab
- [x] AI Assistant (ChatInterface)
- [x] CandidateMatchTab — arc gauges, heatmap, skill bars (2026-03-27)
- [ ] Real candidates from DB (replace CandidateMatchTab mock data)
- [ ] Candidate profile pages
- [ ] Gap-to-candidate matching algorithm (backend)
- [ ] Document generation (9 types — DocumentTypeSelector exists)

### Phase 2 Preview (do not build yet)
- Multi-project dashboard
- Client portal (read-only view)
- Email/calendar integrations

## Key Architectural Decisions
- Dashboard data served via `/api/projects/:id/dashboard-data` from `project_gaps_v2` (not `gap_analysis`)
- CandidateMatchTab uses `gap_title` = `project_gaps_v2.category_name` as expertise key
- All new pages/components: dark mode mandatory, use design system from long-term-memory.md

## Internship Priorities (Phase 1)
1. Complete candidate matching pipeline end-to-end
2. Replace all mock data with live DB queries
3. Add pgvector semantic search for candidate-gap matching
4. Polish CandidateMatchTab with real data
