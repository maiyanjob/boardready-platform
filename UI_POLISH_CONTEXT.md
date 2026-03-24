# BoardReady UI Polish Context

## Project Structure
```
boardready-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components: button, card, badge, input, etc.)
│   │   │   └── layout/
│   │   │       └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Candidates.jsx
│   │   │   ├── Boards.jsx
│   │   │   ├── Match.jsx
│   │   │   ├── AISearch.jsx
│   │   │   └── ImportExport.jsx
│   │   ├── lib/
│   │   │   ├── api.js (axios client)
│   │   │   └── utils.js
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── backend/ (Flask - don't touch)
```

## Current Tech Stack
- React 18 + Vite
- Tailwind CSS 3.4.1
- shadcn/ui components (Card, Badge, Button, Input, Separator, Avatar, Tabs, Alert, Skeleton)
- lucide-react (icons)
- React Router
- Axios

## Existing shadcn Components
Located in src/components/ui/:
- button.jsx
- card.jsx
- badge.jsx
- input.jsx
- separator.jsx
- avatar.jsx
- tabs.jsx
- alert.jsx
- skeleton.jsx

## Current State
- Dark mode theme (slate-950 background)
- 7 working pages
- Basic functionality complete
- CSV import/export working
- AI matching & search working
- Needs visual polish

## Design Goals
- Transform from $10K MVP → $50K-$80K professional product
- Consistent cyan → blue → purple gradient system
- Smooth animations with Framer Motion
- Glassmorphism effects
- Professional spacing and typography
- Loading states everywhere

## What NOT to Change
- Backend files (anything in /backend)
- API endpoints
- Core functionality
- Data flow
- Existing component logic (only enhance styling)

## Dependencies Already Installed
- framer-motion: ❌ NOT installed (need to install)
- lucide-react: ✅ Installed
- axios: ✅ Installed
- react-router-dom: ✅ Installed
- tailwindcss-animate: ✅ Installed

## Important Notes
- All pages use dark mode (slate-950 bg)
- Current gradient: cyan-400 → blue-400 → purple-400 (update to cyan-500 → blue-600 → purple-600)
- Sidebar already exists and works
- Login page already has animated blobs (enhance them)
- Cards currently have basic styling (add gradient borders + hover effects)

## Next Steps
1. Install framer-motion
2. Update src/index.css with new design tokens
3. Create EnhancedCard component
4. Create SkeletonLoader component  
5. Create Spinner component
6. Update each page systematically
7. Test after each page

## Success Criteria
- Consistent design across all 7 pages
- Smooth 60fps animations
- Professional spacing and typography
- Loading states on all data fetches
- Hover effects on all interactive elements
- No broken functionality
