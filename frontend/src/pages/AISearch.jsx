import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchCandidates, searchBoards } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';

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

  const handleKey = (e) => { if (e.key === 'Enter') handleSearch(); };

  const totalResults = candidateResults.length + boardResults.length;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 p-8 max-w-[1000px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Semantic Search</h1>
          </div>
          <p className="text-slate-500 text-sm ml-12">Search with natural language — the AI understands context, not just keywords</p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-6"
        >
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-5">
              {/* Search input */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder='Try: "Find CFO with fintech experience"'
                    className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-slate-900 placeholder:text-slate-400 transition-all"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="h-11 px-6 text-sm font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Searching
                    </span>
                  ) : 'Search'}
                </Button>
              </div>

              {/* Filter tabs */}
              <div className="flex gap-1 mt-4 p-1 bg-slate-100 rounded-lg w-fit">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSearchType(tab.key)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                      searchType === tab.key
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 text-center"
          >
            <div className="inline-flex items-center gap-3 px-5 py-3 bg-blue-50 rounded-xl border border-blue-100">
              <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span className="text-sm font-medium text-blue-700">Analyzing with AI...</span>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <AnimatePresence>
          {!loading && searched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {totalResults === 0 ? (
                <Card className="py-14 text-center border-dashed border-slate-200">
                  <CardContent>
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    </div>
                    <p className="text-sm font-medium text-slate-700">No results for "{query}"</p>
                    <p className="text-xs text-slate-400 mt-1">Try different terms or add more data</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <p className="text-xs text-slate-400 font-medium">{totalResults} result{totalResults !== 1 ? 's' : ''} found</p>

                  {/* Candidate Results */}
                  {candidateResults.length > 0 && (searchType === 'all' || searchType === 'candidates') && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-semibold text-slate-700">Candidates</h2>
                        <Badge className="text-xs bg-blue-50 text-blue-600 border-blue-200">{candidateResults.length}</Badge>
                      </div>
                      <div className="space-y-3">
                        {candidateResults.map((candidate, index) => (
                          <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06 }}
                          >
                            <Card className="hover:border-blue-200 hover:shadow-sm transition-all duration-200 group border-slate-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="relative flex-shrink-0">
                                      <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold">
                                          {getInitials(candidate.name)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
                                        <span className="text-white text-[7px] font-bold">#{index + 1}</span>
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-semibold text-sm text-slate-900">{candidate.name}</h3>
                                      <p className="text-xs text-slate-500">{candidate.title} · {candidate.company}</p>
                                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{candidate.bio}</p>
                                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                        <span>{candidate.years_experience}y exp</span>
                                        <span>·</span>
                                        <span>{candidate.board_count} board seats</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs h-7 px-2.5"
                                  >
                                    View
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Board Results */}
                  {boardResults.length > 0 && (searchType === 'all' || searchType === 'boards') && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-sm font-semibold text-slate-700">Boards</h2>
                        <Badge className="text-xs bg-emerald-50 text-emerald-600 border-emerald-200">{boardResults.length}</Badge>
                      </div>
                      <div className="space-y-3">
                        {boardResults.map((board, index) => (
                          <motion.div
                            key={board.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.06 + 0.1 }}
                          >
                            <Card className="hover:border-emerald-200 hover:shadow-sm transition-all duration-200 group border-slate-200">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <span className="text-xs font-bold text-emerald-600">#{index + 1}</span>
                                      <h3 className="font-semibold text-sm text-slate-900">{board.company_name}</h3>
                                      {board.ticker && (
                                        <Badge className="font-mono text-xs bg-emerald-50 text-emerald-700 border-emerald-200">{board.ticker}</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-500">{board.sector}</p>
                                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{board.description}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-xs h-7 px-2.5"
                                  >
                                    View
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-700">Example Searches</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {examples.map((ex, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ x: 4 }}
                    onClick={() => setQuery(ex)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-transparent transition-all duration-200 group"
                  >
                    <svg className="text-slate-400 group-hover:text-blue-500 transition-colors flex-shrink-0" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                    <span className="text-sm text-slate-600 group-hover:text-blue-700 transition-colors">{ex}</span>
                  </motion.button>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
