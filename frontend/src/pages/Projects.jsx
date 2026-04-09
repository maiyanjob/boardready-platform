import React, { useState, useRef } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import { Plus, Building2, Users, AlertCircle, Calendar, TrendingUp, Clock, Search, Activity, ExternalLink } from 'lucide-react';
import axios from 'axios';
import { secSearch, secCompany } from '../lib/api';

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Board Searches</p>
            <h1 className="text-4xl font-black tracking-tight mb-1">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Projects
              </span>
            </h1>
            <p className="text-slate-400">
              {projects.length} active board searches
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500
              text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25
              hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5
              transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500
                text-white font-bold rounded-xl inline-flex items-center gap-2 text-sm
                shadow-lg shadow-indigo-500/25 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
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
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600
                      opacity-0 group-hover:opacity-30 blur-sm transition-all duration-400" />

                    <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden
                      group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-indigo-500/10 transition-all duration-250">
                      {/* Top accent bar */}
                      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" />

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white mb-0.5 group-hover:text-indigo-300 transition-colors truncate">
                              {project.client_name}
                            </h3>
                            {project.company_ticker && (
                              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 rounded tracking-wider">
                                {project.company_ticker}
                              </span>
                            )}
                          </div>
                          <span className={`ml-3 px-2.5 py-1 text-[10px] font-bold rounded-full border flex-shrink-0 uppercase tracking-wide ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </div>

                        {project.board_name && (
                          <p className="text-slate-400 text-xs mb-4 line-clamp-1">
                            {project.board_name}
                          </p>
                        )}

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="bg-white/4 rounded-xl p-3 border border-white/5">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Members</div>
                            <div className="text-xl font-black text-white">{project.board_member_count}</div>
                          </div>
                          <div className="bg-white/4 rounded-xl p-3 border border-white/5">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Gaps</div>
                            <div className={`text-xl font-black ${getPriorityColor(project.gap_count)}`}>{project.gap_count}</div>
                          </div>
                          <div className="bg-white/4 rounded-xl p-3 border border-white/5">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1.5">Pipeline</div>
                            <div className="text-xl font-black text-white">{project.candidate_count}</div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-white/6">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                          {project.target_completion_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {new Date(project.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
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

  // SEC search state
  const [secQuery, setSecQuery] = useState('');
  const [secResults, setSecResults] = useState([]);
  const [secSearching, setSecSearching] = useState(false);
  const [secEnriching, setSecEnriching] = useState(false);
  const [secImported, setSecImported] = useState(null);
  const searchTimeout = useRef(null);

  const handleSecSearch = (q) => {
    setSecQuery(q);
    clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSecResults([]); return; }
    setSecSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await secSearch(q);
        setSecResults(data || []);
      } catch { setSecResults([]); }
      finally { setSecSearching(false); }
    }, 300);
  };

  const handleSelectCompany = async (company) => {
    setSecResults([]);
    setSecQuery('');
    setSecEnriching(true);
    try {
      const { data } = await secCompany(company.cik, company.ticker, company.name);
      setFormData(prev => ({
        ...prev,
        client_name: data.name || company.name,
        company_ticker: data.ticker || company.ticker,
        industry: data.industry || prev.industry,
        board_name: prev.board_name || 'Board of Directors',
      }));
      setSecImported({
        name: data.name,
        proxy: data.latest_proxy,
        city: data.city,
        state: data.state,
      });
    } catch {
      setFormData(prev => ({
        ...prev,
        client_name: company.name,
        company_ticker: company.ticker,
      }));
    } finally {
      setSecEnriching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('/api/projects', formData, { withCredentials: true });
      onSuccess();
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full h-12 px-4 border-2 border-slate-700 bg-slate-900 text-white rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Create New Project</h2>
        <p className="text-slate-400 text-sm mb-6">Search SEC to auto-fill company details, or enter manually.</p>

        {/* SEC Company Search */}
        <div className="mb-6 relative">
          <label className="block text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">
            SEC Company Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={secQuery}
              onChange={e => handleSecSearch(e.target.value)}
              placeholder="Search by company name or ticker…"
              className="w-full h-11 pl-9 pr-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
            />
            {secSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 border border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
            )}
          </div>

          {/* Search results dropdown */}
          {secResults.length > 0 && (
            <div className="absolute z-20 top-full mt-1 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {secResults.map(c => (
                <button
                  key={c.cik}
                  onClick={() => handleSelectCompany(c)}
                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="text-sm text-white font-medium">{c.name}</span>
                  <span className="text-xs font-bold text-cyan-400 ml-3">{c.ticker}</span>
                </button>
              ))}
            </div>
          )}

          {secEnriching && (
            <p className="mt-2 text-xs text-cyan-400 flex items-center gap-1.5">
              <span className="h-3 w-3 border border-cyan-400/40 border-t-cyan-400 rounded-full animate-spin" />
              Fetching SEC data…
            </p>
          )}

          {secImported && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <Activity className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
              <span className="text-xs text-cyan-300">
                Imported from SEC
                {secImported.city ? ` · ${secImported.city}, ${secImported.state}` : ''}
                {secImported.proxy ? ` · Latest proxy: ${secImported.proxy.filing_date}` : ''}
              </span>
              {secImported.proxy && (
                <a
                  href={secImported.proxy.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-cyan-400 hover:text-cyan-300"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-white/8 pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Client Name *</label>
              <input type="text" required value={formData.client_name}
                onChange={e => setFormData({...formData, client_name: e.target.value})}
                className={inputClass} placeholder="e.g., Nike, Inc." />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Board Name</label>
              <input type="text" value={formData.board_name}
                onChange={e => setFormData({...formData, board_name: e.target.value})}
                className={inputClass} placeholder="e.g., Board of Directors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Ticker Symbol</label>
                <input type="text" value={formData.company_ticker}
                  onChange={e => setFormData({...formData, company_ticker: e.target.value.toUpperCase()})}
                  className={inputClass} placeholder="e.g., NKE" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Industry</label>
                <input type="text" value={formData.industry}
                  onChange={e => setFormData({...formData, industry: e.target.value})}
                  className={inputClass} placeholder="e.g., Technology" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Target Completion Date</label>
              <input type="date" value={formData.target_completion_date}
                onChange={e => setFormData({...formData, target_completion_date: e.target.value})}
                className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
              <textarea value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border-2 border-slate-700 bg-slate-900 text-white rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 outline-none resize-none"
                placeholder="Brief description of the search..." />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 px-6 py-3 bg-slate-800 border-2 border-slate-700 text-white font-semibold rounded-xl hover:border-blue-500/50 hover:bg-slate-800/80 transition-all duration-300">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
