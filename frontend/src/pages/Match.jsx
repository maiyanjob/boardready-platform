import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBoards, matchCandidatesToBoard } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Sparkles, Building2, ChevronRight } from 'lucide-react';

const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

function AIThinkingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

export default function Match() {
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBoards()
      .then((r) => setBoards(r.data.boards))
      .catch(console.error);
  }, []);

  const handleMatch = async (boardId) => {
    setLoading(true);
    setSelectedBoard(boardId);
    setMatches([]);
    try {
      const r = await matchCandidatesToBoard(boardId, 5);
      setMatches(r.data.matched_candidates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedBoardData = boards.find((b) => b.id === selectedBoard);

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
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI Candidate Matching
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Select a board to find semantically matched candidates
          </p>
        </motion.div>

        <div className="grid grid-cols-5 gap-6 items-start">
          {/* Left: Board selector */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-2"
          >
            <div className="relative">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-purple-500 to-blue-600 opacity-30 blur-sm" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Select Board
                </h2>
                {boards.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Loading boards...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {boards.map((board) => {
                      const isSelected = selectedBoard === board.id;
                      return (
                        <motion.button
                          key={board.id}
                          onClick={() => handleMatch(board.id)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-purple-500/60 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                              : 'border-white/5 bg-slate-800/40 hover:border-white/10 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`font-bold text-sm truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                  {board.company_name}
                                </span>
                                {board.ticker && (
                                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                                    isSelected
                                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                                      : 'bg-slate-700 border-slate-600 text-slate-400'
                                  }`}>
                                    {board.ticker}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">{board.sector}</p>
                            </div>
                            {isSelected ? (
                              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            ) : (
                              <ChevronRight className="flex-shrink-0 h-4 w-4 text-slate-600" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="col-span-3"
          >
            <div className="relative">
              <div className={`absolute -inset-[1px] rounded-2xl blur-sm transition-all duration-500 ${
                selectedBoard
                  ? 'bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-40'
                  : 'bg-gradient-to-r from-slate-700 to-slate-600 opacity-30'
              }`} />
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden" style={{ minHeight: '460px' }}>
                {/* Card Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div>
                    <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">AI Results</h2>
                    {selectedBoardData && !loading && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {matches.length} candidates matched to {selectedBoardData.company_name}
                      </p>
                    )}
                  </div>
                  {loading && <AIThinkingDots />}
                </div>

                <div className="p-5">
                  {/* Empty state */}
                  {!selectedBoard && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                      <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-white/5 flex items-center justify-center mb-4">
                        <Sparkles className="h-7 w-7 text-slate-600" />
                      </div>
                      <p className="text-base font-semibold text-slate-400 mb-1">Select a board to begin</p>
                      <p className="text-sm text-slate-500">AI will semantically match candidates</p>
                    </div>
                  )}

                  {/* Loading skeleton */}
                  {loading && (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl border border-white/5 bg-slate-800/40 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-slate-700 flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-slate-700 rounded-lg w-36" />
                              <div className="h-3 bg-slate-700 rounded-lg w-52" />
                            </div>
                          </div>
                        </div>
                      ))}
                      <p className="text-center text-xs text-slate-500 pt-2">Analyzing candidate profiles...</p>
                    </div>
                  )}

                  {/* Results */}
                  <AnimatePresence>
                    {!loading && selectedBoard && matches.length > 0 && (
                      <div className="space-y-3">
                        {matches.map((candidate, index) => (
                          <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.08 }}
                            className="group relative"
                          >
                            <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 opacity-0 group-hover:opacity-50 blur-sm transition-all duration-300" />
                            <div className="relative flex items-start justify-between p-4 rounded-xl border border-white/5 bg-slate-800/40 group-hover:bg-slate-800/60 group-hover:-translate-y-0.5 group-hover:shadow-lg transition-all duration-200">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="relative flex-shrink-0">
                                  <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                                    <span className="text-white text-sm font-black">
                                      {getInitials(candidate.name)}
                                    </span>
                                  </div>
                                  <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
                                    <span className="text-white text-[8px] font-black">#{index + 1}</span>
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-white text-sm">{candidate.name}</h4>
                                  <p className="text-xs text-slate-400">{candidate.title} · {candidate.company}</p>
                                  <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">{candidate.bio}</p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-slate-500">{candidate.years_experience}y exp</span>
                                    <span className="text-slate-700">·</span>
                                    <span className="text-xs text-slate-500">{candidate.board_count} board seats</span>
                                  </div>
                                </div>
                              </div>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 px-3 py-1.5 text-xs font-semibold bg-slate-700 border border-white/10 text-slate-300 rounded-lg hover:border-purple-500/50 hover:text-white transition-colors duration-200">
                                View
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 relative"
            >
              <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-purple-500/40 to-blue-500/40 blur-sm" />
              <div className="relative p-4 rounded-xl bg-slate-900/90 border border-purple-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-purple-300 mb-1">How AI Matching Works</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Semantic embeddings compare board requirements against candidate expertise in meaning-space — finding genuine fit even when terms don't match exactly.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
