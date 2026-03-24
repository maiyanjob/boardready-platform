import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Search, Sparkles, ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Candidates', path: '/candidates', icon: Users },
  { name: 'Boards', path: '/boards', icon: Building2 },
  { name: 'AI Search', path: '/search', icon: Search },
  { name: 'Match', path: '/match', icon: Sparkles },
  { name: 'Import/Export', path: '/import-export', icon: ArrowUpDown },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-slate-900/80 backdrop-blur-xl min-h-screen p-5 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-tight">
          BoardReady
        </h1>
        <p className="text-xs text-slate-500 mt-0.5 font-medium">AI Placement Platform</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        {navigation.map((item, i) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                to={item.path}
                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group overflow-hidden ${
                  isActive
                    ? 'text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {/* Active gradient background */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-600/20 to-purple-600/20 rounded-xl border border-white/10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}

                {/* Active left accent */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-r-full" />
                )}

                <Icon
                  className={`relative h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span className="relative">{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Bottom badge */}
      <div className="mt-4 px-2">
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/5">
          <p className="text-xs text-slate-400 font-medium">Powered by</p>
          <p className="text-xs font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Voyage AI Embeddings
          </p>
        </div>
      </div>
    </div>
  );
}
