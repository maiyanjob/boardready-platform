import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCurrentUser } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Users, Building2, Sparkles, TrendingUp } from 'lucide-react';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stats = [
  {
    icon: Users,
    label: 'Total Candidates',
    value: '17',
    change: '+100%',
    changeLabel: 'this month',
    color: 'cyan',
    borderColor: 'border-cyan-500',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    glowColor: 'from-cyan-500 to-cyan-600',
  },
  {
    icon: Building2,
    label: 'Active Boards',
    value: '27',
    change: '+100%',
    changeLabel: 'this month',
    color: 'blue',
    borderColor: 'border-blue-500',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    glowColor: 'from-blue-500 to-blue-600',
  },
  {
    icon: Sparkles,
    label: 'AI Matches',
    value: '4',
    change: '2 pending',
    changeLabel: 'review',
    color: 'purple',
    borderColor: 'border-purple-500',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    glowColor: 'from-purple-500 to-purple-600',
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
      <div className="flex-1 p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Here's what's happening with your placements
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={itemVariants} className="group relative">
              {/* Glow */}
              <div
                className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r ${stat.glowColor} opacity-0 group-hover:opacity-60 transition-all duration-500 blur-sm`}
              />

              {/* Card */}
              <div
                className={`relative bg-slate-900 border border-white/10 rounded-2xl p-6 border-l-4 ${stat.borderColor} group-hover:-translate-y-1 group-hover:shadow-2xl transition-all duration-300`}
              >
                <div className={`inline-flex p-2.5 rounded-xl ${stat.iconBg} mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="text-sm text-slate-400 mb-1 font-medium">{stat.label}</div>
                <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-semibold">{stat.change}</span>
                  <span className="text-sm text-slate-500">{stat.changeLabel}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Profile Card */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="group relative"
          >
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-60 blur-sm transition-all duration-500" />
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 group-hover:-translate-y-1 group-hover:shadow-2xl transition-all duration-300">
              <h2 className="text-2xl font-bold text-white mb-5">Your Profile</h2>
              <div className="space-y-0">
                {[
                  { label: 'Name', value: user.name },
                  { label: 'Email', value: user.email },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center py-3 border-b border-slate-800 last:border-0"
                  >
                    <span className="text-slate-400 font-medium">{label}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-3">
                  <span className="text-slate-400 font-medium">Role</span>
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-semibold">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
