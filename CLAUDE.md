# BoardReady Platform — CLAUDE.md (PROTECTED)

> AI context file. Read at session start. Update via `/preserve`. Never delete PROTECTED sections.

---

## Project Overview (PROTECTED)

**BoardReady** is an AI-powered board placement and gap analysis SaaS for executive search consultants.

- **Goal:** End-to-end pipeline from board gap identification → candidate matching → placement documents
- **Positioning:** $50K–$80K SaaS quality; dark, professional, data-dense UI
- **Stage:** Phase 1 — Core placement workflow (internship sprint)

---

## Tech Stack (PROTECTED)

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS, Tremor, Framer Motion, Recharts |
| Backend | Flask + SQLAlchemy, Python 3.11 |
| Database | PostgreSQL (`boardready_dev`) + pgvector for semantic search |
| AI | Claude API (Anthropic), Voyage AI embeddings |
| Dev ports | Flask: `127.0.0.1:5000` · Vite: `[::1]:5173` |

---

## Key Paths (PROTECTED)

```
boardready-platform/
├── frontend/src/
│   ├── pages/          # ProjectDetail.jsx, Dashboard.jsx, etc.
│   ├── components/     # CandidateMatchTab.jsx, BoardMatrix.jsx, etc.
│   └── components/ui/  # enhanced-card, skeleton-loader, spinner
├── backend/
│   ├── routes/         # dashboard_routes.py, project_routes.py, etc.
│   ├── models/         # SQLAlchemy models
│   └── .env            # gitignored — never commit
├── .claude/
│   ├── memory/         # recent-memory.md, long-term-memory.md, project-memory.md
│   └── (commands in ~/.claude/commands/)
├── CC-Session-Logs/    # Created by /compress — gitignored
└── CLAUDE.md           # This file
```

---

## Design System (PROTECTED)

- **Heading gradient:** `bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent`
- **Card pattern:** `bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl`
- **Background:** `bg-slate-950`
- **Hover glow:** `absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-X to-Y opacity-50 blur-sm`
- **Animations:** `framer-motion` · `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`
- **CandidateMatchTab color scheme:** purple `#7c3aed` → teal `#14b8a6` (distinct from Intelligence Dashboard blue/red)

---

## Database Key Facts (PROTECTED)

- Nike project: `id = 3`
- Gap data source: `project_gaps_v2.category_name` (used as `gap_title` in API responses)
- Dashboard API: `GET /api/projects/:id/dashboard-data` → `{ gaps, success, ... }`
- Candidate expertise keys must match `project_gaps_v2.category_name` exactly

### Nike Gap Titles (project_id=3)
1. Circular Economy & Sustainable Manufacturing (critical, gap_score=30)
2. Diversity, Equity & Social Impact (high, gap_score=26)
3. Digital Marketing & Athlete Partnerships (medium, gap_score=16)
4. Global Supply Chain Resilience (medium, gap_score=13)
5. Greater China Market Strategy (medium, gap_score=11)
6. Direct-to-Consumer Digital Commerce (low, gap_score=6)
7. Data Analytics & AI-Driven Personalization (low, gap_score=0)
8. Athletic Performance Innovation & Technology (low, gap_score=0)

---

## Phase 1 Priorities (ARCHIVABLE when Phase 2 starts)

- [ ] Wire real candidates from `project_candidates` table into CandidateMatchTab
- [ ] Backend: gap-to-candidate matching algorithm using pgvector
- [ ] Replace all remaining mock data with live DB queries
- [ ] Candidate profile pages
- [ ] Test document generation (9 types via DocumentTypeSelector)

---

## CPR Workflow (PROTECTED)

| Command | When to use |
|---|---|
| `/resume` | Start of every session — loads CLAUDE.md + recent session logs |
| `/preserve` | During session — updates this CLAUDE.md with key decisions |
| `/compress` | End of session — saves full log to `CC-Session-Logs/`, then run `/compact` |

Session logs saved to: `CC-Session-Logs/DD-MM-YYYY-HH_MM-topic-name.md`

---

## Conventions

- All new components: dark mode mandatory, follow design system above
- New API routes: add `@login_required`, use `get_db()` pattern
- Never commit `.env` — credentials stay local
- Obsidian vault (`/Users/maiyanjob/Documents/BoardReady-Vault/`) is gitignored
