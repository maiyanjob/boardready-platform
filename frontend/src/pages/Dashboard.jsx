import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import WorkQueue from '../components/WorkQueue';
import { Users, Building2, Sparkles, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

const stats = [
  {
    icon: Users,
    label: 'Total Candidates',
    value: '17',
    change: '+12',
    changeLabel: 'this month',
    positive: true,
    accent: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    topBar: 'from-cyan-500 to-blue-600',
  },
  {
    icon: Building2,
    label: 'Active Boards',
    value: '27',
    change: '+5',
    changeLabel: 'this quarter',
    positive: true,
    accent: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    topBar: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Sparkles,
    label: 'AI Matches',
    value: '4',
    change: '2 pending',
    changeLabel: 'review',
    positive: null,
    accent: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-400',
    topBar: 'from-violet-500 to-purple-600',
  },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex items-start justify-between"
        >
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Overview</p>
            <h1 className="text-4xl font-black mb-1 tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </span>
            </h1>
            <p className="text-slate-400">
              Here's what's happening with your placements
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-slate-300">Live</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants} className="group relative">
              <div
                className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${stat.accent} opacity-0 group-hover:opacity-40 transition-all duration-500 blur-sm`}
              />
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden group-hover:-translate-y-0.5 group-hover:shadow-xl transition-all duration-300">
                {/* Top accent bar */}
                <div className={`h-0.5 w-full bg-gradient-to-r ${stat.topBar}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className={`inline-flex p-2 rounded-xl ${stat.iconBg}`}>
                      <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                    </div>
                    {/* Change badge */}
                    {stat.positive !== null ? (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        stat.positive
                          ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/12 text-red-400 border border-red-500/20'
                      }`}>
                        {stat.positive ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {stat.change}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/12 text-amber-400 border border-amber-500/20">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mb-1">{stat.label}</div>
                  <div className="text-4xl font-black text-white tracking-tight">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.changeLabel}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Work Queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 bg-slate-900/90 backdrop-blur-xl border border-white/8 rounded-2xl p-5"
        >
          <WorkQueue compact />
        </motion.div>

        {/* Profile Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="group relative"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 opacity-0 group-hover:opacity-30 blur-sm transition-all duration-500" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
              <div className="h-0.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                    <span className="text-white font-black text-sm">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'JC'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{user.name}</h2>
                    <span className="text-xs text-slate-500">{user.email}</span>
                  </div>
                  <div className="ml-auto">
                    <span className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/25 rounded-full text-indigo-300 text-xs font-bold uppercase tracking-wide">
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
