import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, Search, Sparkles, Upload, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Candidates', path: '/candidates', icon: Users },
  { name: 'Boards', path: '/boards', icon: Building2 },
  { name: 'AI Search', path: '/search', icon: Search },
  { name: 'Match', path: '/match', icon: Sparkles },
  { name: 'Import/Export', path: '/import-export', icon: Upload },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-slate-900 min-h-screen p-4 border-r border-slate-800">
      <div className="mb-8">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
          BoardReady
        </h1>
        <p className="text-xs text-slate-500 mt-1">AI Placement Platform</p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative block"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-lg border-l-4 border-blue-500"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <div className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}>
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-slate-500 text-center py-2 border-t border-slate-800">
          Powered by <span className="text-cyan-400 font-semibold">Voyage AI</span>
        </div>
      </div>
    </div>
  );
}
