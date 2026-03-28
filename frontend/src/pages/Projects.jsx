import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import { Plus, Building2, Users, AlertCircle, Calendar, TrendingUp, Clock } from 'lucide-react';
import axios from 'axios';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/api/projects', {
        withCredentials: true
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      'on_hold': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      completed: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      cancelled: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };
    return colors[status] || colors.active;
  };

  const getPriorityColor = (gapCount) => {
    if (gapCount >= 5) return 'text-red-400';
    if (gapCount >= 3) return 'text-amber-400';
    return 'text-emerald-400';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-800 rounded-xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-800 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Projects
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              {projects.length} active board searches
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 
              text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 
              hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 
              transition-all duration-300 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Building2 className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2">No projects yet</h2>
            <p className="text-slate-400 mb-6">Create your first board search project to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 
                text-white font-bold rounded-xl inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Create Project
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link to={`/projects/${project.id}`}>
                  <div className="group relative">
                    {/* Gradient border on hover */}
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 
                      opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />
                    
                    {/* Card */}
                    <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 
                      shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300">
                      
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                            {project.client_name}
                          </h3>
                          {project.company_ticker && (
                            <span className="inline-block px-2 py-1 text-xs font-semibold bg-slate-800 text-cyan-400 rounded">
                              {project.company_ticker}
                            </span>
                          )}
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>

                      {/* Board Name */}
                      {project.board_name && (
                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                          {project.board_name}
                        </p>
                      )}

                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <Users className="h-4 w-4 text-blue-400 mb-1" />
                          <div className="text-2xl font-bold text-white">{project.board_member_count}</div>
                          <div className="text-xs text-slate-400">Members</div>
                        </div>
                        
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <AlertCircle className={`h-4 w-4 mb-1 ${getPriorityColor(project.gap_count)}`} />
                          <div className="text-2xl font-bold text-white">{project.gap_count}</div>
                          <div className="text-xs text-slate-400">Gaps</div>
                        </div>
                        
                        <div className="bg-slate-800/50 rounded-lg p-3">
                          <TrendingUp className="h-4 w-4 text-emerald-400 mb-1" />
                          <div className="text-2xl font-bold text-white">{project.candidate_count}</div>
                          <div className="text-xs text-slate-400">Pipeline</div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </div>
                        {project.target_completion_date && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {new Date(project.target_completion_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <CreateProjectModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchProjects();
            }}
          />
        )}
      </div>
    </div>
  );
}

function CreateProjectModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    client_name: '',
    board_name: '',
    company_ticker: '',
    industry: '',
    description: '',
    target_completion_date: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/projects', formData, {
        withCredentials: true
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-3xl font-bold text-white mb-6">Create New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Client Name *
            </label>
            <input
              type="text"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({...formData, client_name: e.target.value})}
              className="w-full h-12 px-4 border-2 border-slate-700 bg-slate-900 
                text-white rounded-xl focus:border-blue-500 focus:ring-4 
                focus:ring-blue-500/20 transition-all duration-200 outline-none"
              placeholder="e.g., Nike, Inc."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Board Name
            </label>
            <input
              type="text"
              value={formData.board_name}
              onChange={(e) => setFormData({...formData, board_name: e.target.value})}
              className="w-full h-12 px-4 border-2 border-slate-700 bg-slate-900 
                text-white rounded-xl focus:border-blue-500 focus:ring-4 
                focus:ring-blue-500/20 transition-all duration-200 outline-none"
              placeholder="e.g., Board of Directors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Ticker Symbol
              </label>
              <input
                type="text"
                value={formData.company_ticker}
                onChange={(e) => setFormData({...formData, company_ticker: e.target.value.toUpperCase()})}
                className="w-full h-12 px-4 border-2 border-slate-700 bg-slate-900 
                  text-white rounded-xl focus:border-blue-500 focus:ring-4 
                  focus:ring-blue-500/20 transition-all duration-200 outline-none"
                placeholder="e.g., NKE"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
                className="w-full h-12 px-4 border-2 border-slate-700 bg-slate-900 
                  text-white rounded-xl focus:border-blue-500 focus:ring-4 
                  focus:ring-blue-500/20 transition-all duration-200 outline-none"
                placeholder="e.g., Technology"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Target Completion Date
            </label>
            <input
              type="date"
              value={formData.target_completion_date}
              onChange={(e) => setFormData({...formData, target_completion_date: e.target.value})}
              className="w-full h-12 px-4 border-2 border-slate-700 bg-slate-900 
                text-white rounded-xl focus:border-blue-500 focus:ring-4 
                focus:ring-blue-500/20 transition-all duration-200 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-700 bg-slate-900 
                text-white rounded-xl focus:border-blue-500 focus:ring-4 
                focus:ring-blue-500/20 transition-all duration-200 outline-none resize-none"
              placeholder="Brief description of the search..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-slate-800 border-2 border-slate-700 
                text-white font-semibold rounded-xl hover:border-blue-500/50 
                hover:bg-slate-800/80 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 
                text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 
                hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 
                transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
