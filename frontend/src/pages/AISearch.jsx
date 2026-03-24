import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCandidates, searchBoards } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Spinner } from '../components/ui/spinner';
import { Search, Briefcase, Building2 } from 'lucide-react';

const getInitials = (name) =>
  name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

const examples = [
  'Find executives with cloud computing experience',
  'CFO with banking and M&A expertise',
  'Technology companies needing digital transformation',
];

const filterTabs = [
  { key: 'all', label: 'All Results' },
  { key: 'candidates', label: 'Candidates' },
  { key: 'boards', label: 'Boards' },
];

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [candidateResults, setCandidateResults] = useState([]);
  const [boardResults, setBoardResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const [cr, br] = await Promise.all([
        searchType !== 'boards' ? searchCandidates(query, 5) : null,
        searchType !== 'candidates' ? searchBoards(query, 5) : null,
      ]);
      setCandidateResults(cr?.data?.results ?? []);
      setBoardResults(br?.data?.results ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const totalResults = candidateResults.length + boardResults.length;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8 max-w-[1000px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-black mb-2">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Semantic Search
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Natural language queries — the AI understands context, not just keywords
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative group">
            {/* Glow */}
            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 opacity-0 group-focus-within:opacity-100 transition-all duration-500 blur-sm" />

            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              {/* Input row */}
              <div className="flex gap-3 mb-5">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder='Try: "Find CFO with fintech experience"'
                    className="w-full h-14 pl-12 pr-4 text-base bg-slate-800/60 border-2 border-slate-700 text-white placeholder:text-slate-500 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all duration-200"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="h-14 px-8 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Searching
                    </span>
                  ) : (
                    'Search'
                  )}
                </button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 p-1 bg-slate-800/60 rounded-xl w-fit">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSearchType(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      searchType === tab.key
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white border border-white/10'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Spinner label="Analyzing with AI..." />
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {!loading && searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              {totalResults === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-7 w-7 text-slate-500" />
                  </div>
                  <p className="text-lg font-semibold text-white mb-1">No results for "{query}"</p>
                  <p className="text-slate-400">Try different terms or add more data</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-slate-400 font-medium">
                    {totalResults} result{totalResults !== 1 ? 's' : ''} found
                  </p>

                  {/* Candidate Results */}
                  {candidateResults.length > 0 && (searchType === 'all' || searchType === 'candidates') && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Briefcase className="h-4 w-4 text-cyan-400" />
                        <h2 className="text-base font-bold text-white">Candidates</h2>
                        <span className="px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-xs font-bold">
                          {candidateResults.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {candidateResults.map((candidate, index) => (
                          <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 }}
                            className="group relative"
                          >
                            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 opacity-0 group-hover:opacity-60 blur-sm transition-all duration-300" />
                            <div className="relative bg-slate-900/90 border border-white/10 rounded-2xl p-4 group-hover:-translate-y-0.5 group-hover:shadow-xl transition-all duration-200">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  {/* Rank badge + avatar */}
                                  <div className="relative flex-shrink-0">
                                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                      <span className="text-white text-sm font-black">
                                        {getInitials(candidate.name)}
                                      </span>
                                    </div>
                                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                                      <span className="text-white text-[8px] font-black">#{index + 1}</span>
                                    </div>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white">{candidate.name}</h3>
                                    <p className="text-sm text-slate-400">{candidate.title} · {candidate.company}</p>
                                    <p className="text-sm text-slate-300 mt-1.5 leading-relaxed line-clamp-2">{candidate.bio}</p>
                                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                      <span>{candidate.years_experience}y exp</span>
                                      <span>·</span>
                                      <span>{candidate.board_count} board seats</span>
                                    </div>
                                  </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-white/10 text-slate-300 rounded-lg hover:border-cyan-500/50 hover:text-white transition-colors duration-200">
                                  View
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Board Results */}
                  {boardResults.length > 0 && (searchType === 'all' || searchType === 'boards') && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Building2 className="h-4 w-4 text-emerald-400" />
                        <h2 className="text-base font-bold text-white">Boards</h2>
                        <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-bold">
                          {boardResults.length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {boardResults.map((board, index) => (
                          <motion.div
                            key={board.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 + 0.1 }}
                            className="group relative"
                          >
                            <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-600 opacity-0 group-hover:opacity-60 blur-sm transition-all duration-300" />
                            <div className="relative bg-slate-900/90 border border-white/10 rounded-2xl p-4 group-hover:-translate-y-0.5 group-hover:shadow-xl transition-all duration-200">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2.5 mb-1">
                                    <span className="text-xs font-black text-emerald-400">#{index + 1}</span>
                                    <h3 className="font-bold text-white">{board.company_name}</h3>
                                    {board.ticker && (
                                      <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 text-xs font-mono font-bold">
                                        {board.ticker}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-400">{board.sector}</p>
                                  <p className="text-sm text-slate-300 mt-1.5 leading-relaxed line-clamp-2">{board.description}</p>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-white/10 text-slate-300 rounded-lg hover:border-emerald-500/50 hover:text-white transition-colors duration-200">
                                  View
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Example queries */}
        {!searched && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-slate-700 to-slate-600 opacity-50 blur-sm" />
              <div className="relative bg-slate-900/90 border border-white/10 rounded-2xl p-6">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">
                  Example Searches
                </h2>
                <div className="space-y-2">
                  {examples.map((ex, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ x: 6 }}
                      onClick={() => setQuery(ex)}
                      className="w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/40 transition-all duration-200 group/btn"
                    >
                      <Search className="h-4 w-4 text-slate-500 group-hover/btn:text-blue-400 transition-colors flex-shrink-0" />
                      <span className="text-sm text-slate-300 group-hover/btn:text-white transition-colors">
                        {ex}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
