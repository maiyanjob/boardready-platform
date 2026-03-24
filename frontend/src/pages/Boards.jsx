import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getBoards } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { SkeletonCard } from '../components/ui/skeleton-loader';
import { Plus, Building2 } from 'lucide-react';

function BoardCard({ board, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group relative"
    >
      {/* Gradient border glow */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500" />

      {/* Card */}
      <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-emerald-500/10 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              {/* Company icon */}
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{board.company_name}</h3>
                {board.ticker && (
                  <span className="inline-block mt-0.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-mono font-bold">
                    {board.ticker}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm font-medium text-slate-400 mb-3 ml-13">
              {board.sector}
            </p>
            <p className="text-slate-300 leading-relaxed">{board.description}</p>
          </div>

          <button className="flex-shrink-0 ml-6 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200">
            Match Candidates
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Boards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getBoards();
        setBoards(response.data.boards);
      } catch (error) {
        console.error('Failed to fetch boards:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBoards();
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
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Board Opportunities
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              {loading ? 'Loading...' : `${boards.length} active board${boards.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200">
            <Plus className="h-5 w-5" />
            Add Board
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

        {/* Boards List */}
        {!loading && (
          <div className="space-y-6">
            {boards.map((board, index) => (
              <BoardCard key={board.id} board={board} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && boards.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-24"
          >
            <div className="text-8xl mb-6">🏢</div>
            <h2 className="text-3xl font-bold text-white mb-3">No boards yet</h2>
            <p className="text-slate-400 text-lg mb-8">Add your first board opportunity to get started</p>
            <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200">
              <Plus className="inline h-6 w-6 mr-2" />
              Add Your First Board
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
