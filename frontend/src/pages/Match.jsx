import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBoards, matchCandidatesToBoard } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

function AIThinkingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-blue-500"
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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-8 max-w-[1200px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Candidate Matching</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">Select a board to find semantically matched candidates</p>
        </motion.div>

        <div className="grid grid-cols-5 gap-6 items-start">
          {/* Left: Board selector */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="col-span-2"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Select Board</CardTitle>
                <CardDescription className="text-xs">Click to run AI matching</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {boards.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">Loading boards...</div>
                ) : (
                  boards.map((board) => {
                    const isSelected = selectedBoard === board.id;
                    return (
                      <motion.button
                        key={board.id}
                        onClick={() => handleMatch(board.id)}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                          isSelected
                            ? 'border-violet-400 bg-violet-50 shadow-sm shadow-violet-100'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-slate-900">{board.company_name}</span>
                          {board.ticker && (
                            <Badge className={`font-mono text-xs ${isSelected ? 'bg-violet-100 text-violet-700 border-violet-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {board.ticker}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{board.sector}</p>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                            <span className="text-xs text-violet-600 font-medium">Selected</span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right: Results */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="col-span-3"
          >
            <Card className="min-h-[400px]">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-slate-700">AI Results</CardTitle>
                    {selectedBoardData && !loading && (
                      <CardDescription className="text-xs mt-0.5">
                        {matches.length} candidates matched to {selectedBoardData.company_name}
                      </CardDescription>
                    )}
                  </div>
                  {loading && <AIThinkingDots />}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {!selectedBoard && (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/></svg>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Select a board to begin</p>
                    <p className="text-xs text-slate-400 mt-1">AI will semantically match candidates</p>
                  </div>
                )}

                {loading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full shimmer" />
                          <div className="flex-1 space-y-1.5">
                            <div className="h-4 shimmer rounded w-32" />
                            <div className="h-3 shimmer rounded w-48" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="text-center pt-2">
                      <p className="text-xs text-slate-400">Analyzing candidate profiles...</p>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {!loading && selectedBoard && matches.length > 0 && (
                    <div className="space-y-3">
                      {matches.map((candidate, index) => (
                        <motion.div
                          key={candidate.id}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: index * 0.07 }}
                          className="group p-4 rounded-xl border border-slate-200 hover:border-violet-300 hover:shadow-sm hover:bg-violet-50/30 transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="relative">
                                <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-xs font-bold">
                                    {getInitials(candidate.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">#{index + 1}</span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-sm text-slate-900">{candidate.name}</h4>
                                </div>
                                <p className="text-xs text-slate-500">{candidate.title} · {candidate.company}</p>
                                <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">{candidate.bio}</p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-xs text-slate-400">{candidate.years_experience}y exp</span>
                                  <span className="text-slate-200">·</span>
                                  <span className="text-xs text-slate-400">{candidate.board_count} board seats</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs h-7 px-2.5 border-slate-200 hover:border-violet-300 hover:text-violet-700"
                            >
                              View
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-4 p-4 rounded-xl bg-violet-50 border border-violet-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-900 mb-0.5">How AI Matching Works</p>
                  <p className="text-xs text-violet-700 leading-relaxed">
                    Semantic embeddings compare board requirements against candidate expertise in meaning-space — finding genuine fit even when terms don't match exactly.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
