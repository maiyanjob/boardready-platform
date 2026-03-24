import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getCandidates } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { SkeletonCard } from '../components/ui/skeleton-loader';
import { Briefcase, Target, Plus } from 'lucide-react';

function CandidateCard({ candidate, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group relative w-full"
    >
      {/* Animated gradient border glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl transition-all duration-700 pointer-events-none group-hover:bg-blue-500/20 group-hover:scale-150" />
      <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl transition-all duration-700 pointer-events-none group-hover:bg-purple-500/20 group-hover:scale-150" />

      {/* Card */}
      <div className="relative rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-blue-500/10 transition-all duration-300">
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-0.5">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black bg-gradient-to-br from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {candidate.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-0.5">{candidate.name}</h3>
            <p className="text-sm text-slate-300 font-medium">{candidate.title}</p>
            <p className="text-sm text-slate-400">{candidate.company}</p>
          </div>

          {/* View Profile Button */}
          <button className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200">
            View Profile
          </button>
        </div>

        {/* Bio */}
        <p className="mt-4 text-slate-300 leading-relaxed">{candidate.bio}</p>

        {/* Stats */}
        <div className="mt-5 flex gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
            <Briefcase className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-200 font-semibold text-sm">{candidate.years_experience} yrs exp</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <Target className="h-4 w-4 text-purple-400" />
            <span className="text-slate-200 font-semibold text-sm">{candidate.board_count} boards</span>
          </div>
        </div>

        {/* Industries */}
        {candidate.industries && candidate.industries.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Industries</p>
            <div className="flex flex-wrap gap-2">
              {candidate.industries.map((industry) => (
                <span
                  key={industry}
                  className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-sm font-medium text-cyan-300 hover:border-cyan-400/60 hover:bg-cyan-400/20 transition-all duration-200 cursor-pointer"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800/60 text-sm font-medium text-slate-300 hover:border-slate-500 hover:bg-slate-700/60 transition-all duration-200 cursor-pointer"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await getCandidates();
        setCandidates(response.data.candidates);
      } catch (error) {
        console.error('Failed to fetch candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCandidates();
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
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Candidates
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              {loading ? 'Loading...' : `${candidates.length} executive${candidates.length !== 1 ? 's' : ''} in your network`}
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200">
            <Plus className="h-5 w-5" />
            Add Candidate
          </button>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Candidates List */}
        {!loading && (
          <div className="space-y-6">
            {candidates.map((candidate, index) => (
              <CandidateCard key={candidate.id} candidate={candidate} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && candidates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-24"
          >
            <div className="text-8xl mb-6">👥</div>
            <h2 className="text-3xl font-bold text-white mb-3">No candidates yet</h2>
            <p className="text-slate-400 text-lg mb-8">Add your first candidate to get started</p>
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200">
              <Plus className="inline h-6 w-6 mr-2" />
              Add Your First Candidate
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
