import { useEffect, useState } from 'react';
import { getBoards } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Plus, Building2, Calendar } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-slate-800 rounded w-1/3"></div>
            <div className="h-48 bg-slate-800/50 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Board Opportunities
              </span>
            </h1>
            <p className="text-slate-400 text-lg">{boards.length} active board{boards.length !== 1 ? 's' : ''}</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-all">
            <Plus className="h-5 w-5" />
            Add Board
          </button>
        </div>

        <div className="space-y-6">
          {boards.map((board) => (
            <div key={board.id} className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 opacity-60 group-hover:opacity-100 transition-all blur-[2px]" />
              <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-white">{board.company_name}</h3>
                      {board.ticker && (
                        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-mono font-bold">
                          {board.ticker}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 mb-3">
                      <Building2 className="h-4 w-4" />
                      <span>{board.sector}</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{board.description}</p>
                  </div>
                  <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:scale-105 transition-all">
                    Match Candidates
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
