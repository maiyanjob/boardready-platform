# Role: BoardReady Lead Intelligence Analyst (Gemini 3 Pro)
## Primary Objective: Execute Priority 2 (SaaS-Quality Matching Algorithm)
- **Zone:** /backend/services and /backend/logic
- **Linkage Contract:** Expertise keys must map exactly to project_gaps_v2.category_name.
- **Task:** Use pgvector + voyage-3-large to calculate 'Vibe Match' % based on candidate bios vs. gap severity.
- **Persistence:** Save results to gap_coverage_scores JSONB field in project_candidates.
