import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import BoardMatrix from '../components/BoardMatrix';
import ChatInterface from '../components/ChatInterface';
import BoardIntelligenceDashboard from '../components/BoardIntelligenceDashboard';
import { 
  ArrowLeft, Users, AlertCircle, TrendingUp, 
  Calendar, Table, MessageSquare, BarChart3
} from 'lucide-react';
import axios from 'axios';

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
        withCredentials: true
      });
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-800 rounded-xl w-1/3" />
            <div className="h-96 bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-300">Project not found</h2>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics for dashboard
  const dashboardData = {
    female_percentage: calculateGenderPercentage(project.board_members),
    racial_diversity_percentage: calculateRacialDiversity(project.board_members),
    critical_gaps: project.gaps.filter(g => g.priority === 'critical').length,
    avg_tenure: 7
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-400 border-red-500/30',
      high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      medium: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      low: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/projects"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl font-black mb-2">
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {project.client_name}
                </span>
              </h1>
              <p className="text-slate-400 text-lg">{project.board_name}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {project.company_ticker && (
                <span className="px-4 py-2 text-sm font-bold bg-slate-800 text-cyan-400 rounded-lg">
                  {project.company_ticker}
                </span>
              )}
              <span className="px-4 py-2 text-sm font-semibold rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                {project.status}
              </span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-600 opacity-50 blur-sm" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <Users className="h-8 w-8 text-blue-400 mb-3" />
              <div className="text-4xl font-black text-white mb-1">{project.board_members.length}</div>
              <div className="text-sm text-slate-400">Board Members</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-amber-500 to-red-600 opacity-50 blur-sm" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <AlertCircle className="h-8 w-8 text-amber-400 mb-3" />
              <div className="text-4xl font-black text-white mb-1">{project.gaps.length}</div>
              <div className="text-sm text-slate-400">Gaps Identified</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 opacity-50 blur-sm" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <TrendingUp className="h-8 w-8 text-emerald-400 mb-3" />
              <div className="text-4xl font-black text-white mb-1">{project.candidates.length}</div>
              <div className="text-sm text-slate-400">Candidates</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="relative group">
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 opacity-50 blur-sm" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <Calendar className="h-8 w-8 text-purple-400 mb-3" />
              <div className="text-lg font-bold text-white mb-1">
                {project.target_completion_date 
                  ? new Date(project.target_completion_date).toLocaleDateString()
                  : 'Not set'
                }
              </div>
              <div className="text-sm text-slate-400">Target Date</div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 border-b border-slate-800">
            {[
              { id: 'dashboard', label: 'Intelligence Dashboard', icon: BarChart3 },
              { id: 'matrix', label: 'Board Matrix', icon: Table },
              { id: 'chat', label: 'AI Assistant', icon: MessageSquare },
              { id: 'gaps', label: 'Gap Analysis' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-semibold capitalize transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-white border-b-2 border-cyan-500'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <BoardIntelligenceDashboard projectData={dashboardData} />
        )}

        {activeTab === 'chat' && (
          <ChatInterface projectId={projectId} />
        )}

        {activeTab === 'matrix' && (
          <BoardMatrix boardMembers={project.board_members} />
        )}

        {activeTab === 'gaps' && (
          <div className="space-y-4">
            {project.gaps.map((gap, index) => (
              <motion.div
                key={gap.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <div className={`absolute -inset-[1px] rounded-2xl blur-sm ${
                  gap.priority === 'critical' ? 'bg-gradient-to-r from-red-500 to-orange-600 opacity-50' :
                  gap.priority === 'high' ? 'bg-gradient-to-r from-amber-500 to-yellow-600 opacity-50' :
                  'bg-gradient-to-r from-blue-500 to-cyan-600 opacity-50'
                }`} />
                <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{gap.title}</h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(gap.priority)}`}>
                          {gap.priority}
                        </span>
                      </div>
                      <p className="text-slate-300">{gap.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function calculateGenderPercentage(members) {
  if (!members || members.length === 0) return 0;
  const female = members.filter(m => 
    m.matrix_data?.demographics?.gender === 'Female'
  ).length;
  return Math.round((female / members.length) * 100);
}

function calculateRacialDiversity(members) {
  if (!members || members.length === 0) return 0;
  const diverse = members.filter(m => 
    m.matrix_data?.demographics?.race_ethnicity !== 'Caucasian'
  ).length;
  return Math.round((diverse / members.length) * 100);
}
