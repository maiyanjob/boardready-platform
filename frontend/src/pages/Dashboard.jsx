import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Users, Building2, Sparkles } from 'lucide-react';

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
        <div className="mb-8">
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </span>
          </h1>
          <p className="text-slate-400 text-lg">Here's what's happening with your placements</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Users, label: 'Total Candidates', value: '2', change: '+100%', color: 'cyan' },
            { icon: Building2, label: 'Active Boards', value: '2', change: '+100%', color: 'blue' },
            { icon: Sparkles, label: 'AI Matches', value: '4', change: '2 pending', color: 'purple' }
          ].map((stat, i) => (
            <div key={i} className="relative group">
              <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-600 opacity-50 group-hover:opacity-100 transition-all blur-[2px]`} />
              <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6">
                <stat.icon className={`h-8 w-8 text-${stat.color}-400 mb-4`} />
                <div className="text-sm text-slate-400 mb-1">{stat.label}</div>
                <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-sm text-emerald-400">{stat.change}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Profile Card */}
        {user && (
          <div className="relative group mb-8">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-600 opacity-50 blur-[2px]" />
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Your Profile</h2>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Name</span>
                  <span className="text-white font-medium">{user.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Role</span>
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-medium">{user.role}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
