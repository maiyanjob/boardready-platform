import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import {
  Flame, Search, ExternalLink, RefreshCw, Building2,
  TrendingUp, FileText, AlertTriangle, CheckCircle2,
  Loader2, Plus, ArrowRight, Activity, Brain, ChevronDown, ChevronUp,
  Users, Calendar, Star, Zap, MessageSquare, Send, CornerDownLeft
} from 'lucide-react';
import { secSearch, secCompany, secOpportunities, secAnalyzeProxy, secProxyChat } from '../lib/api';
import axios from 'axios';

const TEMP_STYLES = {
  HOT:  { bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/25',    dot: 'bg-red-400' },
  WARM: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/25',  dot: 'bg-amber-400' },
  COLD: { bg: 'bg-slate-700/40',  text: 'text-slate-400',  border: 'border-slate-600/40',  dot: 'bg-slate-500' },
};

export default function SecTracker() {
  const navigate = useNavigate();

  // ── Opportunities feed ────────────────────────────────────────────────────
  const [opportunities, setOpportunities] = useState([]);
  const [oppsLoading, setOppsLoading] = useState(false);
  const [oppsLoaded, setOppsLoaded] = useState(false);
  const [tempFilter, setTempFilter] = useState('ALL');

  // ── Company search ────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [enriching, setEnriching] = useState(false);
  const searchTimeout = useRef(null);

  // ── AI proxy analysis ─────────────────────────────────────────────────────
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [analysisExpanded, setAnalysisExpanded] = useState(true);

  // ── Proxy chat ────────────────────────────────────────────────────────────
  const [chatMessages, setChatMessages] = useState([]); // {role, content}
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // ── Create project from opportunity ──────────────────────────────────────
  const [creatingFor, setCreatingFor] = useState(null); // cik being created

  const fetchOpportunities = async () => {
    setOppsLoading(true);
    try {
      const { data } = await secOpportunities();
      setOpportunities(data || []);
      setOppsLoaded(true);
    } catch (err) {
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setOppsLoading(false);
    }
  };

  // Auto-load on mount
  useEffect(() => { fetchOpportunities(); }, []);

  const handleSearch = (q) => {
    setQuery(q);
    setSearchError(null);
    clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const { data } = await secSearch(q);
        setSearchResults(data || []);
        if (!data || data.length === 0) setSearchError('No results found');
      } catch (err) {
        console.error('SEC search error:', err);
        const status = err?.response?.status;
        if (status === 401) {
          setSearchError('Not logged in — please log in first');
        } else {
          setSearchError(`Search failed (${status || err.message})`);
        }
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSelectCompany = async (company) => {
    setSearchResults([]);
    setQuery(company.name);
    setEnriching(true);
    setAnalysis(null);
    setAnalysisError(null);
    setChatMessages([]);
    setChatInput('');
    try {
      const { data } = await secCompany(company.cik, company.ticker, company.name);
      setSelectedCompany(data);
    } catch {
      setSelectedCompany({ ...company, latest_proxy: null });
    } finally {
      setEnriching(false);
    }
  };

  const handleAnalyzeProxy = async (company) => {
    if (!company?.latest_proxy?.url) return;
    setAnalyzing(true);
    setAnalysis(null);
    setAnalysisError(null);
    setAnalysisExpanded(true);
    try {
      const { data } = await secAnalyzeProxy(
        company.latest_proxy.url,
        company.name,
        company.ticker
      );
      if (data.success) {
        setAnalysis(data.analysis);
      } else {
        setAnalysisError(data.error || 'Analysis failed');
      }
    } catch (err) {
      setAnalysisError(err?.response?.data?.error || err.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendChat = async () => {
    const content = chatInput.trim();
    if (!content || chatSending || !selectedCompany?.latest_proxy?.url) return;

    const newMessages = [...chatMessages, { role: 'user', content }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatSending(true);

    // Scroll to bottom after user message renders
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

    try {
      const { data } = await secProxyChat(
        selectedCompany.latest_proxy.url,
        selectedCompany.name,
        selectedCompany.ticker,
        newMessages
      );
      const withReply = [...newMessages, { role: 'assistant', content: data.reply }];
      setChatMessages(withReply);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      const errMsg = err?.response?.data?.error || 'Failed to get response';
      setChatMessages([...newMessages, { role: 'assistant', content: `Error: ${errMsg}` }]);
    } finally {
      setChatSending(false);
      chatInputRef.current?.focus();
    }
  };

  const handleCreateProject = async (company) => {
    const cik = company.cik;
    setCreatingFor(cik);
    try {
      let enriched = company;
      if (!company.industry) {
        const { data } = await secCompany(cik, company.ticker || '', company.company_name || company.name || '');
        enriched = data;
      }
      const payload = {
        client_name: enriched.name || enriched.company_name || '',
        board_name: 'Board of Directors',
        company_ticker: enriched.ticker || '',
        industry: enriched.industry || enriched.sic_description || '',
        description: `Board search project. Latest proxy: ${enriched.latest_proxy?.filing_date || 'N/A'}`,
      };
      const { data: project } = await axios.post('/api/projects', payload, { withCredentials: true });
      navigate(`/projects/${project.id}`);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreatingFor(null);
    }
  };

  const filteredOpps = tempFilter === 'ALL'
    ? opportunities
    : opportunities.filter(o => o.temperature === tempFilter);

  const counts = {
    HOT:  opportunities.filter(o => o.temperature === 'HOT').length,
    WARM: opportunities.filter(o => o.temperature === 'WARM').length,
    COLD: opportunities.filter(o => o.temperature === 'COLD').length,
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 p-8 min-w-0">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Intelligence Tools</p>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-1">
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  SEC Tracker
                </span>
              </h1>
              <p className="text-slate-400 text-sm">
                Live board opportunity signals from SEC proxy filings (DEF 14A)
              </p>
            </div>
            <button
              onClick={fetchOpportunities}
              disabled={oppsLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-white/8 text-slate-300 text-sm font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${oppsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left: Company Search + Detail */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-5">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                Company Lookup
              </h2>

              {/* Search input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={query}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search by name or ticker…"
                  className="w-full h-10 pl-9 pr-4 bg-slate-800 border border-slate-700 text-white rounded-xl text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400 animate-spin" />
                )}
              </div>

              {/* Search error */}
              {searchError && (
                <p className="text-xs text-red-400 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  {searchError}
                  {searchError.includes('log in') && (
                    <button
                      onClick={() => navigate('/login')}
                      className="underline text-red-300 hover:text-white ml-1"
                    >
                      Go to login
                    </button>
                  )}
                </p>
              )}

              {/* Dropdown results */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 bg-slate-800 border border-white/8 rounded-xl overflow-hidden"
                  >
                    {searchResults.map(c => (
                      <button
                        key={c.cik}
                        onClick={() => handleSelectCompany(c)}
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-700 transition-colors text-left border-b border-white/5 last:border-0"
                      >
                        <span className="text-sm text-white font-medium truncate">{c.name}</span>
                        <span className="text-xs font-bold text-amber-400 ml-2 flex-shrink-0">{c.ticker}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Selected company detail */}
              {enriching && (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  Fetching SEC data…
                </div>
              )}

              {selectedCompany && !enriching && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="bg-slate-800/60 border border-white/8 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">{selectedCompany.name}</h3>
                        <p className="text-xs text-amber-400 font-mono">{selectedCompany.ticker}</p>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded">
                        CIK {selectedCompany.cik}
                      </span>
                    </div>

                    {selectedCompany.industry && (
                      <p className="text-xs text-slate-400 mb-2">{selectedCompany.industry}</p>
                    )}
                    {(selectedCompany.city || selectedCompany.state) && (
                      <p className="text-xs text-slate-500 mb-3">
                        {[selectedCompany.city, selectedCompany.state].filter(Boolean).join(', ')}
                      </p>
                    )}

                    {selectedCompany.latest_proxy ? (
                      <div className="flex items-center gap-2 p-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg mb-3">
                        <FileText className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-emerald-300">Latest DEF 14A</p>
                          <p className="text-[10px] text-slate-500">{selectedCompany.latest_proxy.filing_date}</p>
                        </div>
                        <a href={selectedCompany.latest_proxy.url} target="_blank" rel="noreferrer"
                          className="text-emerald-400 hover:text-emerald-300 flex-shrink-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2.5 bg-slate-700/30 border border-slate-600/30 rounded-lg mb-3">
                        <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs text-slate-500">No DEF 14A found</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAnalyzeProxy(selectedCompany)}
                        disabled={analyzing || !selectedCompany.latest_proxy}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                        title={!selectedCompany.latest_proxy ? 'No proxy filing available' : 'Analyze DEF 14A with AI'}
                      >
                        {analyzing ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" />Analyzing…</>
                        ) : (
                          <><Brain className="h-3.5 w-3.5" />Analyze 14A</>
                        )}
                      </button>
                      <button
                        onClick={() => handleCreateProject(selectedCompany)}
                        disabled={!!creatingFor}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {creatingFor === selectedCompany.cik ? (
                          <><Loader2 className="h-3.5 w-3.5 animate-spin" />Creating…</>
                        ) : (
                          <><Plus className="h-3.5 w-3.5" />Create Project</>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI Analysis Panel */}
              {(analyzing || analysis || analysisError) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/60 border border-amber-500/20 rounded-xl overflow-hidden"
                >
                  {/* Header */}
                  <button
                    onClick={() => setAnalysisExpanded(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-300">AI Proxy Analysis</span>
                      {analysis && (
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                          analysis.opportunity_tier === 'HOT' ? 'bg-red-500/10 text-red-400 border-red-500/25' :
                          analysis.opportunity_tier === 'WARM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                          'bg-slate-700/40 text-slate-400 border-slate-600/40'
                        }`}>
                          {analysis.opportunity_tier}
                        </span>
                      )}
                    </div>
                    {analysisExpanded ? <ChevronUp className="h-3.5 w-3.5 text-slate-500" /> : <ChevronDown className="h-3.5 w-3.5 text-slate-500" />}
                  </button>

                  {analysisExpanded && (
                    <div className="px-4 pb-4 space-y-4">
                      {analyzing && (
                        <div className="flex items-center gap-3 py-4 text-sm text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                          <div>
                            <p className="text-amber-300 font-medium text-xs">Scraping & analyzing proxy filing…</p>
                            <p className="text-[10px] text-slate-500">Reading the actual DEF 14A document — no guessing</p>
                          </div>
                        </div>
                      )}

                      {analysisError && (
                        <div className="flex items-start gap-2 py-3 text-red-400 text-xs">
                          <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{analysisError}</span>
                        </div>
                      )}

                      {analysis && !analyzing && (
                        <ProxyAnalysisDisplay analysis={analysis} />
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {!selectedCompany && !enriching && (
                <p className="text-xs text-slate-600 text-center py-6">
                  Search for any public company to see their proxy filing and create a project
                </p>
              )}

              {/* Proxy Chat — only show after analysis exists */}
              {analysis && selectedCompany?.latest_proxy?.url && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6">
                    <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-300">Ask about this filing</span>
                    <span className="text-[9px] text-slate-600 ml-auto">Powered by Claude · reads actual 14A</span>
                  </div>

                  {/* Message history */}
                  {chatMessages.length > 0 && (
                    <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-3">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white rounded-br-sm'
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

                  {/* Suggested questions (only before first message) */}
                  {chatMessages.length === 0 && (
                    <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
                      {[
                        'Who is retiring from the board?',
                        'What skills are they looking for?',
                        'How many women are on the board?',
                        'What committees exist?',
                      ].map(q => (
                        <button
                          key={q}
                          onClick={() => { setChatInput(q); chatInputRef.current?.focus(); }}
                          className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 border border-white/8 text-slate-400 hover:text-white hover:border-indigo-500/40 transition-all"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input */}
                  <div className="px-4 pb-4 pt-2 flex gap-2 items-end">
                    <textarea
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder="Ask anything about this proxy statement…"
                      rows={2}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none resize-none transition-all"
                    />
                    <button
                      onClick={handleSendChat}
                      disabled={chatSending || !chatInput.trim()}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-40 flex-shrink-0"
                      title="Send (Enter)"
                    >
                      {chatSending
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : <Send className="h-4 w-4" />
                      }
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Opportunities Feed */}
          <div className="xl:col-span-2 space-y-4">

            {/* Score cards */}
            <div className="grid grid-cols-3 gap-3">
              {(['HOT', 'WARM', 'COLD']).map(temp => {
                const s = TEMP_STYLES[temp];
                const icons = { HOT: Flame, WARM: Activity, COLD: TrendingUp };
                const Icon = icons[temp];
                return (
                  <button
                    key={temp}
                    onClick={() => setTempFilter(tempFilter === temp ? 'ALL' : temp)}
                    className={`p-4 rounded-2xl border transition-all text-left ${
                      tempFilter === temp || tempFilter === 'ALL'
                        ? `${s.bg} ${s.border}`
                        : 'bg-slate-900/40 border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`h-4 w-4 ${s.text}`} />
                      <span className={`text-xs font-black uppercase tracking-widest ${s.text}`}>{temp}</span>
                    </div>
                    <div className="text-2xl font-black text-white">{counts[temp]}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {temp === 'HOT' ? 'Director retiring / board expanding' :
                       temp === 'WARM' ? 'Notable signal detected' : 'Proxy filed — monitor'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feed */}
            <div className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-bold text-white">
                    {tempFilter === 'ALL' ? 'All Recent Filings' : `${tempFilter} Opportunities`}
                  </span>
                  <span className="text-xs text-slate-500">
                    {filteredOpps.length} result{filteredOpps.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {tempFilter !== 'ALL' && (
                  <button onClick={() => setTempFilter('ALL')}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                    Show all
                  </button>
                )}
              </div>

              {oppsLoading ? (
                <div className="flex items-center gap-3 px-5 py-8 text-slate-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                  Scanning SEC EDGAR for recent proxy filings…
                </div>
              ) : filteredOpps.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <Building2 className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No filings found for this filter.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 overflow-y-auto max-h-[600px]">
                  {filteredOpps.map((opp, i) => (
                    <OpportunityRow
                      key={i}
                      opp={opp}
                      onCreateProject={() => handleCreateProject(opp)}
                      creating={creatingFor === opp.cik}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProxyAnalysisDisplay({ analysis: a }) {
  const tierColor = a.opportunity_tier === 'HOT' ? 'text-red-400' :
                    a.opportunity_tier === 'WARM' ? 'text-amber-400' : 'text-slate-400';

  return (
    <div className="space-y-4">
      {/* Opportunity score */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Placement Opportunity</span>
          <span className={`text-xs font-black ${tierColor}`}>{a.opportunity_score}/100</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              a.opportunity_score >= 80 ? 'bg-red-400' :
              a.opportunity_score >= 50 ? 'bg-amber-400' : 'bg-slate-500'
            }`}
            style={{ width: `${a.opportunity_score}%` }}
          />
        </div>
        {a.opportunity_reasoning && (
          <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{a.opportunity_reasoning}</p>
        )}
      </div>

      {/* Board stats */}
      {(a.board_size || a.avg_director_age || a.avg_tenure_years || a.women_on_board != null) && (
        <div className="grid grid-cols-2 gap-2">
          {a.board_size != null && (
            <StatPill icon={Users} label="Board Size" value={a.board_size} />
          )}
          {a.avg_director_age != null && (
            <StatPill icon={Calendar} label="Avg Age" value={a.avg_director_age} />
          )}
          {a.avg_tenure_years != null && (
            <StatPill icon={Star} label="Avg Tenure" value={`${a.avg_tenure_years}y`} />
          )}
          {a.women_on_board != null && (
            <StatPill icon={Users} label="Women" value={a.women_on_board} />
          )}
        </div>
      )}

      {/* Vacancies */}
      {a.vacancies?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Vacancies / Departures
          </p>
          <div className="space-y-1.5">
            {a.vacancies.map((v, i) => (
              <div key={i} className="flex items-start gap-2 p-2 bg-red-500/5 border border-red-500/15 rounded-lg">
                <Zap className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-white">{v.director || 'Unnamed Director'}</p>
                  <p className="text-[10px] text-slate-400">{v.reason} {v.effective ? `— ${v.effective}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desired skills */}
      {a.desired_skills?.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Desired Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {a.desired_skills.map((s, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ideal candidate */}
      {a.ideal_candidate_profile && (
        <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-lg">
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">Ideal Candidate</p>
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
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Urgency */}
      {a.urgency && (
        <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${
          a.urgency === 'HIGH' ? 'bg-red-500/5 border-red-500/20' :
          a.urgency === 'MEDIUM' ? 'bg-amber-500/5 border-amber-500/20' :
          'bg-slate-700/30 border-slate-600/30'
        }`}>
          <span className={`text-[10px] font-black uppercase ${
            a.urgency === 'HIGH' ? 'text-red-400' :
            a.urgency === 'MEDIUM' ? 'text-amber-400' : 'text-slate-400'
          }`}>{a.urgency} URGENCY</span>
          {a.urgency_reasoning && (
            <span className="text-[10px] text-slate-400 flex-1">{a.urgency_reasoning}</span>
          )}
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-slate-700/40 rounded-lg border border-white/5">
      <Icon className="h-3 w-3 text-slate-500 flex-shrink-0" />
      <div>
        <p className="text-[9px] text-slate-500 uppercase tracking-wider">{label}</p>
        <p className="text-xs font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function OpportunityRow({ opp, onCreateProject, creating }) {
  const style = TEMP_STYLES[opp.temperature] || TEMP_STYLES.COLD;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3 transition-colors group"
    >
      {/* Temperature badge */}
      <span className={`flex-shrink-0 text-[9px] font-black px-2 py-0.5 rounded border w-10 text-center ${style.bg} ${style.text} ${style.border}`}>
        {opp.temperature}
      </span>

      {/* Company + signal */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-semibold text-white truncate block">{opp.company_name}</span>
        <span className="text-xs text-slate-500">{opp.primary_signal}</span>
      </div>

      {/* Score bar */}
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <div className="h-1.5 w-16 rounded-full bg-slate-700/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${opp.board_score >= 80 ? 'bg-red-400' : opp.board_score >= 50 ? 'bg-amber-400' : 'bg-slate-500'}`}
            style={{ width: `${opp.board_score}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-500 w-4">{opp.board_score}</span>
      </div>

      {/* Date + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[10px] text-slate-600 hidden md:block">{opp.filing_date}</span>

        {opp.link && (
          <a href={opp.link} target="_blank" rel="noreferrer"
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-slate-700 transition-all">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <button
          onClick={onCreateProject}
          disabled={creating}
          className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[10px] font-bold transition-all disabled:opacity-50"
        >
          {creating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Project
        </button>
      </div>
    </motion.div>
  );
}
