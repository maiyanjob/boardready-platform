import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Search, Sparkles, Upload, FolderKanban, ChevronRight, Flame, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const navSections = [
  {
    label: 'Main',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Projects', path: '/projects', icon: FolderKanban },
    ]
  },
  {
    label: 'Pipeline',
    items: [
      { name: 'Candidates', path: '/candidates', icon: Users },
      { name: 'Boards', path: '/boards', icon: Building2 },
      { name: 'Match', path: '/match', icon: Sparkles },
    ]
  },
  {
    label: 'Tools',
    items: [
      { name: 'SEC Tracker', path: '/sec-tracker', icon: Flame },
      { name: 'Private Boards', path: '/private-boards', icon: Lock },
      { name: 'AI Search', path: '/search', icon: Search },
      { name: 'Import / Export', path: '/import-export', icon: Upload },
    ]
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 min-h-screen flex flex-col" style={{ background: '#0b0e18', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-black text-xs">BR</span>
          </div>
          <h1 className="text-[17px] font-bold tracking-tight text-white">
            Board<span className="text-indigo-400">Ready</span>
          </h1>
        </div>
        <p className="text-[10px] text-slate-500 pl-9 uppercase tracking-widest font-medium">AI Placement Platform</p>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Quick search..."
            className="w-full pl-8 pr-3 py-2 text-xs bg-white/5 border border-white/8 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all duration-200"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="px-3 mb-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-600">
                {section.label}
              </span>
            </div>
            {section.items.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative block mb-0.5"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(99, 102, 241, 0.15)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <div className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'text-indigo-300'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                  }`}>
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                    <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                    {isActive && (
                      <ChevronRight className="h-3 w-3 ml-auto text-indigo-500/60" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-bold text-xs">JC</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-200 truncate">Consultant</div>
            <div className="text-[10px] text-slate-500 truncate">
              Powered by <span className="text-indigo-400">Voyage AI</span>
            </div>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" title="Online" />
        </div>
      </div>
    </div>
  );
}
