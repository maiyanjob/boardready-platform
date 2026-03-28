# Long-Term Memory — BoardReady Platform

> Durable facts that survive context resets. Never delete without review.
> Last reviewed: 2026-03-27

## Project Identity
- **Product:** BoardReady — AI-powered board placement and gap analysis SaaS
- **Stack:** React 18 + Vite (frontend) · Flask + SQLAlchemy (backend) · PostgreSQL + pgvector · Tailwind CSS + Tremor + Framer Motion
- **Target market:** Executive search consultants placing board directors
- **Positioning goal:** Look and feel of a $50K–$80K SaaS product

## Design System (PROTECTED)
- Gradient: `from-cyan-400 via-blue-400 to-purple-400` (headings), `from-cyan-500 via-blue-600 to-purple-600` (buttons/borders)
- Background: `bg-slate-950` · Cards: `bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl`
- Hover: group-hover gradient glow + `-translate-y-1` + `shadow-2xl`
- All pages use framer-motion entrance animations (`initial={{ opacity: 0, y: 20 }}`)
- Candidate Match tab: purple/teal scheme (`#7c3aed → #14b8a6`) — distinct from Intelligence Dashboard (blue/red)

## Database (PROTECTED)
- `boardready_dev` PostgreSQL local
- Key tables: `projects`, `board_members`, `gap_analysis`, `project_gaps_v2`, `project_candidates`
- Nike project: id=3, 8 gaps in `project_gaps_v2`
- Gap titles (Nike): Circular Economy & Sustainable Manufacturing · Diversity, Equity & Social Impact · Digital Marketing & Athlete Partnerships · Global Supply Chain Resilience · Greater China Market Strategy · Direct-to-Consumer Digital Commerce · Data Analytics & AI-Driven Personalization · Athletic Performance Innovation & Technology

## Infrastructure
- Flask API: `127.0.0.1:5000` ✓
- Vite dev server: `[::1]:5173` (IPv6 loopback — see security note below)
- Obsidian vault: `/Users/maiyanjob/Documents/BoardReady-Vault/`
- `.env` is gitignored ✓

## Security Notes
- Vite is bound to IPv6 loopback `[::1]` not `127.0.0.1` — functionally local-only but worth watching
- Flask correctly bound to `127.0.0.1` ✓
- `.env`, `BoardReady-Vault/`, and `.mcp/` all in `.gitignore` ✓
