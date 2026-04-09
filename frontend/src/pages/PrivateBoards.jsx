import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import {
  Building2, Search, Globe, FileText, Brain, Send, Loader2,
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  Users, DollarSign, Calendar, Zap, Star, MessageSquare,
  ExternalLink, Plus, Heart, TrendingUp, Lock, Sparkles, Newspaper
} from 'lucide-react';
import {
  searchNonprofits, getNonprofitBoard,
  scrapeBoardFromUrl,
  searchFormD, getFormDBoard,
  cascadeBoardLookup,
  analyzePrivateBoard, chatPrivateBoard,
} from '../lib/api';

const MODES = [
  { id: 'smart',  label: 'Smart Search',  icon: Sparkles,  desc: 'Auto-tries theorg.com → news → 990 → web — best for most companies' },
  { id: '990',    label: 'Non-Profit',    icon: Heart,     desc: 'Form 990 — foundations, hospitals, universities' },
  { id: 'url',    label: 'Company URL',   icon: Globe,     desc: 'Any company with a public board/leadership page' },
  { id: 'form_d', label: 'Funded Startup', icon: TrendingUp, desc: 'SEC Form D — VC/PE-backed companies' },
];

const TIER_STYLES = {
  HOT:  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/25' },
  WARM: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/25' },
  COLD: { bg: 'bg-slate-700/40',  text: 'text-slate-400',  border: 'border-slate-600/40' },
};

export default function PrivateBoards() {
  const [mode, setMode] = useState('smart');

  // ── Search state ──────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const searchTimeout = useRef(null);

  // ── Board data ────────────────────────────────────────────────────────────
  const [selectedCompany, setSelectedCompany] = useState(null); // raw search result
  const [boardData, setBoardData] = useState(null);             // enriched board data
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [boardError, setBoardError] = useState(null);

  // ── Analysis ──────────────────────────────────────────────────────────────
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisExpanded, setAnalysisExpanded] = useState(true);

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Reset when mode changes
  useEffect(() => {
    setQuery('');
    setUrlInput('');
    setSearchResults([]);
    setSelectedCompany(null);
    setBoardData(null);
    setAnalysis(null);
    setAnalysisError(null);
    setChatMessages([]);
    setSearchError(null);
    setBoardError(null);
  }, [mode]);

  // ── Search ────────────────────────────────────────────────────────────────
  const handleSearch = (q) => {
    setQuery(q);
    setSearchError(null);
    clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const fn = mode === '990' ? searchNonprofits : searchFormD;
        const { data } = await fn(q);
        setSearchResults(data || []);
        if (!data?.length) setSearchError('No results found');
      } catch (err) {
        const status = err?.response?.status;
        setSearchError(status === 401 ? 'Not logged in — please log in first' : `Search failed (${status || err.message})`);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  // ── Select company from search results ────────────────────────────────────
  const handleSelectCompany = async (company) => {
    setSearchResults([]);
    setQuery(company.name);
    setSelectedCompany(company);
    setBoardData(null);
    setAnalysis(null);
    setAnalysisError(null);
    setChatMessages([]);
    setBoardError(null);
    setLoadingBoard(true);

    try {
      let data;
      if (mode === '990') {
        const res = await getNonprofitBoard(company.ein);
        data = res.data;
      } else if (mode === 'form_d') {
        const res = await getFormDBoard(company.accession, company.name);
        data = res.data;
      }
      setBoardData(data);
    } catch (err) {
      setBoardError(err?.response?.data?.error || err.message);
    } finally {
      setLoadingBoard(false);
    }
  };

  // ── Smart search: cascade all sources ────────────────────────────────────
  const handleSmartSearch = async () => {
    if (!query.trim() || loadingBoard) return;
    setLoadingBoard(true);
    setBoardData(null);
    setAnalysis(null);
    setAnalysisError(null);
    setChatMessages([]);
    setBoardError(null);

    try {
      const { data } = await cascadeBoardLookup(query.trim());
      setBoardData(data);
      setSelectedCompany({ name: data.company_name || query, source: 'cascade' });
    } catch (err) {
      setBoardError(err?.response?.data?.error || err.message || 'Lookup failed');
    } finally {
      setLoadingBoard(false);
    }
  };

  // ── URL mode: scrape ──────────────────────────────────────────────────────
  const handleScrapeUrl = async () => {
    if (!urlInput.trim() || loadingBoard) return;
    setLoadingBoard(true);
    setBoardData(null);
    setAnalysis(null);
    setAnalysisError(null);
    setChatMessages([]);
    setBoardError(null);
    setSelectedCompany(null);

    try {
      const { data } = await scrapeBoardFromUrl(urlInput.trim());
      setBoardData(data);
      setSelectedCompany({ name: data.company_name || urlInput, source: 'url' });
    } catch (err) {
      setBoardError(err?.response?.data?.error || err.message || 'Failed to scrape page');
    } finally {
      setLoadingBoard(false);
    }
  };

  // ── AI Analysis ───────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!boardData || analyzing) return;
    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisExpanded(true);

    try {
      const { data } = await analyzePrivateBoard(
        selectedCompany?.name || 'Unknown',
        mode,
        boardData
      );
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setAnalysisError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setAnalysisError(err?.response?.data?.error || err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const handleSendChat = async () => {
    const content = chatInput.trim();
    if (!content || chatSending || !boardData) return;

    const newMessages = [...chatMessages, { role: 'user', content }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatSending(true);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const { data } = await chatPrivateBoard(
        selectedCompany?.name || 'Unknown',
        mode,
        boardData,
        newMessages
      );
      setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      setChatMessages([...newMessages, { role: 'assistant', content: `Error: ${err?.response?.data?.error || err.message}` }]);
    } finally {
      setChatSending(false);
      chatInputRef.current?.focus();
    }
  };

  const boardMembers = boardData?.directors || boardData?.board_members || [];
  const officers = boardData?.officers || [];
  const companyName = selectedCompany?.name || boardData?.company_name || '';

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8 min-w-0">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Intelligence Tools</p>
          <h1 className="text-4xl font-black tracking-tight mb-1">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Private Board Intel
            </span>
          </h1>
          <p className="text-slate-400 text-sm">Board composition analysis for non-profits, PE-backed companies, and funded startups</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Search Panel */}
          <div className="space-y-4">

            {/* Mode Tabs */}
            <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-1 flex gap-1">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-center transition-all ${
                    mode === m.id
                      ? 'bg-violet-600/20 border border-violet-500/30 text-violet-300'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <m.icon className="h-4 w-4" />
                  <span className="text-[10px] font-bold leading-tight">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Mode description */}
            <p className="text-[10px] text-slate-500 px-1">
              {MODES.find(m => m.id === mode)?.desc}
            </p>

            {/* Input area */}
            <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-5">

              {mode === 'smart' ? (
                /* Smart search input */
                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Company Name
                  </h2>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
                      <input
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSmartSearch()}
                        placeholder="Helion Energy, Brooks Running, AAA…"
                        className="w-full h-10 pl-9 pr-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={handleSmartSearch}
                      disabled={loadingBoard || !query.trim()}
                      className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {loadingBoard ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Searches theorg.com, news, 990s and web automatically
                  </p>
                </div>
              ) : mode === 'url' ? (
                /* URL input */
                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Board / Leadership Page URL
                  </h2>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="url"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleScrapeUrl()}
                        placeholder="https://company.com/about/board"
                        className="w-full h-10 pl-9 pr-3 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                      />
                    </div>
                    <button
                      onClick={handleScrapeUrl}
                      disabled={loadingBoard || !urlInput.trim()}
                      className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {loadingBoard ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    Tip: Link directly to /board, /directors, or /leadership pages for best results
                  </p>
                </div>
              ) : (
                /* Search input */
                <div>
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                    {mode === '990' ? 'Search Non-Profits' : 'Search Funded Companies'}
                  </h2>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={query}
                      onChange={e => handleSearch(e.target.value)}
                      placeholder={mode === '990' ? 'American Red Cross, Mayo Clinic…' : 'OpenAI, SpaceX, Stripe…'}
                      className="w-full h-10 pl-9 pr-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                    />
                    {searching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-violet-400 animate-spin" />
                    )}
                  </div>

                  {searchError && (
                    <p className="text-xs text-red-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />{searchError}
                    </p>
                  )}

                  {/* Dropdown */}
                  <AnimatePresence>
                    {searchResults.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-slate-800 border border-white/8 rounded-xl overflow-hidden"
                      >
                        {searchResults.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelectCompany(r)}
                            className="w-full flex items-start justify-between px-4 py-2.5 hover:bg-slate-700 transition-colors text-left border-b border-white/5 last:border-0"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-white font-medium truncate">{r.name}</p>
                              {(r.city || r.state) && (
                                <p className="text-[10px] text-slate-500">{[r.city, r.state].filter(Boolean).join(', ')}</p>
                              )}
                            </div>
                            {mode === '990' && r.ein && (
                              <span className="text-[9px] text-slate-600 ml-2 flex-shrink-0 font-mono">EIN {r.ein}</span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Loading board */}
              {loadingBoard && (
                <div className="flex items-center gap-2 mt-4 text-slate-400 text-xs">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-400" />
                  {mode === 'url' ? 'Fetching page via Jina Reader & extracting board…' : 'Loading board data…'}
                </div>
              )}

              {/* Board error */}
              {boardError && (
                <div className="mt-4 flex items-start gap-2 text-xs text-red-400 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>{boardError}</span>
                </div>
              )}

              {/* Selected company card */}
              {boardData && !loadingBoard && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-3"
                >
                  <div className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-white mb-1">{companyName}</h3>
                    {boardData.city && (
                      <p className="text-xs text-slate-400 mb-2">{[boardData.city, boardData.state].filter(Boolean).join(', ')}</p>
                    )}

                    {/* 990 financials */}
                    {mode === '990' && (boardData.total_revenue || boardData.tax_period) && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {boardData.tax_period && (
                          <div className="p-2 bg-slate-700/40 rounded-lg">
                            <p className="text-[9px] text-slate-500 uppercase">Filing Year</p>
                            <p className="text-xs font-bold text-white">{boardData.tax_period}</p>
                          </div>
                        )}
                        {boardData.total_revenue && (
                          <div className="p-2 bg-slate-700/40 rounded-lg">
                            <p className="text-[9px] text-slate-500 uppercase">Revenue</p>
                            <p className="text-xs font-bold text-white">${(boardData.total_revenue / 1e6).toFixed(1)}M</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sources trail for cascade mode */}
                    {boardData.sources_tried?.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[9px] text-slate-600 uppercase tracking-wider mb-1.5">Sources checked</p>
                        <div className="flex flex-wrap gap-1">
                          {boardData.sources_tried.map((s, i) => (
                            <span key={i} className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${
                              s.status === 'error' || s.members_found === 0
                                ? 'bg-slate-800 border-white/8 text-slate-600'
                                : 'bg-violet-500/10 border-violet-500/25 text-violet-300'
                            }`}>
                              {s.source} {s.members_found > 0 ? `✓ ${s.members_found}` : '—'}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confidence badge */}
                    {boardData.confidence != null && boardData.confidence > 0 && (
                      <div className={`flex items-center gap-2 mb-3 p-2 rounded-lg border text-xs ${
                        boardData.confidence >= 70 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-300' :
                        boardData.confidence >= 40 ? 'bg-amber-500/5 border-amber-500/20 text-amber-300' :
                        'bg-red-500/5 border-red-500/20 text-red-300'
                      }`}>
                        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="font-semibold">{boardData.confidence}% confidence</span>
                        <span className="text-slate-500 text-[10px]">— {boardData.confidence_reason}</span>
                      </div>
                    )}

                    <div className="text-xs text-slate-400 mb-3">
                      <span className="font-semibold text-white">{boardMembers.length}</span> directors
                      {officers.length > 0 && <> · <span className="font-semibold text-white">{officers.length}</span> officers</>}
                      {boardData.total_listed > boardMembers.length + officers.length && (
                        <span className="text-slate-600"> ({boardData.total_listed} total listed)</span>
                      )}
                    </div>

                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {analyzing
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analyzing board…</>
                        : <><Brain className="h-3.5 w-3.5" />Analyze with AI</>
                      }
                    </button>
                  </div>
                </motion.div>
              )}

              {!boardData && !loadingBoard && !selectedCompany && (
                <p className="text-xs text-slate-600 text-center py-6 mt-2">
                  {mode === 'url'
                    ? 'Paste a board or leadership page URL above'
                    : 'Search for a company to view its board composition'}
                </p>
              )}
            </div>
          </div>

          {/* Right: Board + Analysis + Chat */}
          <div className="xl:col-span-2 space-y-4">

            {!boardData && !loadingBoard && (
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
                <Building2 className="h-12 w-12 text-slate-700 mb-4" />
                <p className="text-slate-500 font-semibold mb-1">No board loaded</p>
                <p className="text-slate-600 text-sm">Search a company or paste a URL on the left to get started</p>
              </div>
            )}

            {boardData && (
              <>
                {/* Board Members Grid */}
                {boardMembers.length > 0 && (
                  <div className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
                      <Users className="h-4 w-4 text-violet-400" />
                      <span className="text-sm font-bold text-white">Board Directors</span>
                      <span className="text-xs text-slate-500">{boardMembers.length} members</span>
                      {mode === '990' && boardData.tax_period && (
                        <span className="ml-auto text-[10px] text-slate-600">From {boardData.tax_period} Form 990</span>
                      )}
                    </div>
                    <div className="divide-y divide-white/5 max-h-72 overflow-y-auto">
                      {boardMembers.map((m, i) => (
                        <BoardMemberRow key={i} member={m} mode={mode} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Officers (990 / Form D) */}
                {officers.length > 0 && (
                  <div className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
                      <Star className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-bold text-white">Executive Officers</span>
                      <span className="text-xs text-slate-500">{officers.length} listed</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {officers.slice(0, 6).map((o, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-2.5">
                          <div>
                            <p className="text-sm text-white font-medium">{o.name}</p>
                            <p className="text-xs text-slate-500">{o.title}</p>
                          </div>
                          {o.compensation > 0 && (
                            <span className="text-xs text-emerald-400 font-mono">${o.compensation.toLocaleString()}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                {(analyzing || analysis || analysisError) && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 border border-violet-500/20 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => setAnalysisExpanded(v => !v)}
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-violet-400" />
                        <span className="text-sm font-bold text-slate-200">AI Board Analysis</span>
                        {analysis && (
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                            TIER_STYLES[analysis.opportunity_tier]?.bg || ''
                          } ${TIER_STYLES[analysis.opportunity_tier]?.text || ''} ${
                            TIER_STYLES[analysis.opportunity_tier]?.border || ''
                          }`}>
                            {analysis.opportunity_tier}
                          </span>
                        )}
                      </div>
                      {analysisExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                    </button>

                    {analysisExpanded && (
                      <div className="px-5 pb-5 space-y-5">
                        {analyzing && (
                          <div className="flex items-center gap-3 py-4 text-sm text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                            <div>
                              <p className="text-violet-300 font-medium text-xs">Analyzing board composition…</p>
                              <p className="text-[10px] text-slate-500">Identifying gaps, tenure signals, placement opportunities</p>
                            </div>
                          </div>
                        )}
                        {analysisError && (
                          <div className="flex items-start gap-2 text-red-400 text-xs py-2">
                            <AlertTriangle className="h-4 w-4 flex-shrink-0" />{analysisError}
                          </div>
                        )}
                        {analysis && !analyzing && <AnalysisDisplay analysis={analysis} />}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Chat */}
                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/6">
                      <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                      <span className="text-xs font-bold text-slate-300">Ask about this board</span>
                      <span className="text-[9px] text-slate-600 ml-auto">Reads actual board data · no guessing</span>
                    </div>

                    {chatMessages.length > 0 && (
                      <div className="max-h-72 overflow-y-auto px-5 py-4 space-y-3">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                              msg.role === 'user'
                                ? 'bg-violet-600 text-white rounded-br-sm'
                                : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-white/6'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        ))}
                        {chatSending && (
                          <div className="flex justify-start">
                            <div className="bg-slate-800 border border-white/6 rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                    )}

                    {chatMessages.length === 0 && (
                      <div className="px-5 pt-3 pb-2 flex flex-wrap gap-1.5">
                        {[
                          'Who has been on the board longest?',
                          'What skill gaps exist?',
                          'How diverse is this board?',
                          'Who is the highest paid director?',
                        ].map(q => (
                          <button
                            key={q}
                            onClick={() => { setChatInput(q); chatInputRef.current?.focus(); }}
                            className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 border border-white/8 text-slate-400 hover:text-white hover:border-violet-500/40 transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="px-5 pb-4 pt-2 flex gap-2 items-end">
                      <textarea
                        ref={chatInputRef}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChat(); }
                        }}
                        placeholder="Ask anything about this board…"
                        rows={2}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 outline-none resize-none transition-all"
                      />
                      <button
                        onClick={handleSendChat}
                        disabled={chatSending || !chatInput.trim()}
                        className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-40 flex-shrink-0"
                      >
                        {chatSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardMemberRow({ member, mode }) {
  return (
    <div className="flex items-start justify-between px-5 py-3 hover:bg-white/3 transition-colors">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-white">{member.name}</p>
        <p className="text-xs text-slate-400">{member.title}</p>
        {member.bio && (
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{member.bio}</p>
        )}
        {member.tenure_signal && (
          <span className="inline-flex items-center gap-1 mt-1 text-[9px] text-amber-400/80 bg-amber-500/5 border border-amber-500/15 px-1.5 py-0.5 rounded">
            <Calendar className="h-2.5 w-2.5" />{member.tenure_signal}
          </span>
        )}
      </div>
      {member.compensation > 0 && (
        <div className="ml-4 flex-shrink-0 text-right">
          <p className="text-xs font-mono text-emerald-400">${member.compensation.toLocaleString()}</p>
          {member.hours_per_week > 0 && (
            <p className="text-[9px] text-slate-600">{member.hours_per_week}h/wk</p>
          )}
        </div>
      )}
    </div>
  );
}

function AnalysisDisplay({ analysis: a }) {
  const tierStyle = TIER_STYLES[a.opportunity_tier] || TIER_STYLES.COLD;

  return (
    <div className="space-y-5">
      {/* Score */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Opportunity</span>
          <span className={`text-sm font-black ${tierStyle.text}`}>{a.opportunity_score}/100 · {a.opportunity_tier}</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              a.opportunity_score >= 80 ? 'bg-red-400' :
              a.opportunity_score >= 50 ? 'bg-amber-400' : 'bg-violet-500'
            }`}
            style={{ width: `${a.opportunity_score}%` }}
          />
        </div>
        {a.opportunity_reasoning && (
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">{a.opportunity_reasoning}</p>
        )}
      </div>

      {/* Stats row */}
      {(a.board_size || a.avg_tenure_years || a.women_on_board != null || a.independent_directors != null) && (
        <div className="grid grid-cols-4 gap-2">
          {a.board_size && <StatPill label="Size" value={a.board_size} icon={Users} />}
          {a.avg_tenure_years && <StatPill label="Avg Tenure" value={`${a.avg_tenure_years}y`} icon={Calendar} />}
          {a.women_on_board != null && <StatPill label="Women" value={a.women_on_board} icon={Users} />}
          {a.independent_directors != null && <StatPill label="Independent" value={a.independent_directors} icon={Star} />}
        </div>
      )}

      {/* Two-col: gaps + current skills */}
      <div className="grid grid-cols-2 gap-4">
        {a.skill_gaps?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Skill Gaps</p>
            <div className="flex flex-wrap gap-1.5">
              {a.skill_gaps.map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
        {a.current_skills?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Current Strengths</p>
            <div className="flex flex-wrap gap-1.5">
              {a.current_skills.map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tenure flags */}
      {a.tenure_flags?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Tenure Signals</p>
          <div className="space-y-1.5">
            {a.tenure_flags.map((f, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-amber-500/5 border border-amber-500/15 rounded-lg">
                <Zap className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">{f.director}</p>
                  <p className="text-[10px] text-slate-400">{f.signal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ideal candidate */}
      {a.ideal_candidate_profile && (
        <div className="p-3 bg-violet-500/5 border border-violet-500/15 rounded-xl">
          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-1.5">Ideal Candidate Profile</p>
          <p className="text-xs text-slate-300 leading-relaxed">{a.ideal_candidate_profile}</p>
        </div>
      )}

      {/* Key findings */}
      {a.key_findings?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Key Findings</p>
          <ul className="space-y-1.5">
            {a.key_findings.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />{f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Urgency */}
      {a.urgency && (
        <div className={`flex items-center gap-3 p-3 rounded-xl border ${
          a.urgency === 'HIGH' ? 'bg-red-500/5 border-red-500/20' :
          a.urgency === 'MEDIUM' ? 'bg-amber-500/5 border-amber-500/20' :
          'bg-slate-700/30 border-slate-600/30'
        }`}>
          <span className={`text-[10px] font-black uppercase flex-shrink-0 ${
            a.urgency === 'HIGH' ? 'text-red-400' :
            a.urgency === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
          }`}>{a.urgency} URGENCY</span>
          {a.urgency_reasoning && (
            <span className="text-[10px] text-slate-400">{a.urgency_reasoning}</span>
          )}
        </div>
      )}
    </div>
  );
}

function StatPill({ label, value, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center p-2.5 bg-slate-800/60 rounded-xl border border-white/5 text-center">
      <Icon className="h-3 w-3 text-slate-500 mb-1" />
      <p className="text-sm font-black text-white">{value}</p>
      <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}
