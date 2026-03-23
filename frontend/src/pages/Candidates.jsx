import { useEffect, useState } from 'react';
import { getCandidates } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Briefcase, Target, Plus } from 'lucide-react';

function CandidateCard({ candidate }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient border */}
      <div
        className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 transition-all duration-500 ${
          isHovered ? "opacity-100 blur-sm" : "opacity-60 blur-[2px]"
        }`}
      />

      {/* Decorative blobs */}
      <div
        className={`absolute -top-20 -right-20 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl transition-all duration-700 pointer-events-none ${
          isHovered ? "scale-150 bg-blue-500/30" : ""
        }`}
      />
      <div
        className={`absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-purple-500/20 blur-3xl transition-all duration-700 pointer-events-none ${
          isHovered ? "scale-150 bg-purple-500/30" : ""
        }`}
      />

      {/* Card content - DARK BACKGROUND */}
      <div
        className={`relative rounded-2xl bg-slate-900 border border-white/10 p-6 transition-all duration-500 ${
          isHovered ? "translate-y-[-4px] shadow-2xl shadow-blue-500/20" : "shadow-xl shadow-black/20"
        }`}
      >
        {/* Header */}
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 p-0.5">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-bold bg-gradient-to-br from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  {candidate.name.split(" ").map((n) => n[0]).join("")}
                </span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-1">{candidate.name}</h3>
            <p className="text-sm text-slate-300">{candidate.title}</p>
            <p className="text-sm text-slate-400">{candidate.company}</p>
          </div>

          {/* View Profile Button */}
          <button className="flex-shrink-0 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all">
            View Profile
          </button>
        </div>

        {/* Bio */}
        <p className="mt-4 text-slate-300 leading-relaxed">{candidate.bio}</p>

        {/* Stats */}
        <div className="mt-5 flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <Briefcase className="h-4 w-4 text-cyan-400" />
            <span className="text-slate-200 font-medium text-sm">{candidate.years_experience} years</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <Target className="h-4 w-4 text-purple-400" />
            <span className="text-slate-200 font-medium text-sm">{candidate.board_count} boards</span>
          </div>
        </div>

        {/* Industries */}
        {candidate.industries && candidate.industries.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Industries</p>
            <div className="flex flex-wrap gap-2">
              {candidate.industries.map((industry) => (
                <span
                  key={industry}
                  className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-sm font-medium text-cyan-300 hover:border-cyan-400/50 hover:bg-cyan-400/20 transition-all cursor-pointer"
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
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full border border-slate-700 bg-slate-800/50 text-sm font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-800 rounded w-1/3"></div>
            <div className="h-48 bg-slate-800/50 rounded-2xl border border-slate-800"></div>
            <div className="h-48 bg-slate-800/50 rounded-2xl border border-slate-800"></div>
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
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Candidates
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              {candidates.length} executive{candidates.length !== 1 ? 's' : ''} in your network
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all">
            <Plus className="h-5 w-5" />
            Add Candidate
          </button>
        </div>

        {/* Candidates Grid */}
        <div className="space-y-6">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>

        {/* Empty State */}
        {candidates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">👥</div>
            <h2 className="text-3xl font-bold text-white mb-3">No candidates yet</h2>
            <p className="text-slate-400 text-lg mb-8">Add your first candidate to get started</p>
            <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all">
              <Plus className="inline h-6 w-6 mr-2" />
              Add Your First Candidate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
