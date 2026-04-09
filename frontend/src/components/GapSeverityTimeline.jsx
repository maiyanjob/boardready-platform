import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  AlertTriangle, 
  UserMinus, 
  ChevronRight, 
  Info,
  Calendar,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Target,
  Users
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';

// Severity Color helper for Heatmap
const getSeverityColor = (val) => {
  if (val >= 0.8) return 'bg-red-500/90 shadow-[0_0_15px_rgba(239,68,68,0.4)]';
  if (val >= 0.6) return 'bg-orange-500/80 shadow-[0_0_12px_rgba(249,115,22,0.3)]';
  if (val >= 0.3) return 'bg-amber-500/70 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
  return 'bg-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.1)]';
};

const getSeverityBorder = (val) => {
  if (val >= 0.8) return 'border-red-400 border-2';
  if (val >= 0.6) return 'border-orange-400 border-2';
  if (val >= 0.3) return 'border-amber-400/50';
  return 'border-emerald-400/30';
};

const SeverityCell = ({ gap, forecast, yearIdx, initialExperts }) => {
  const data = forecast[yearIdx];
  const severity = data.severity_index;
  const retiringThisYear = data.retiring_experts || [];
  
  // Find who has already retired
  const retiredBefore = forecast
    .slice(0, yearIdx)
    .reduce((acc, f) => [...acc, ...(f.retiring_experts || [])], []);
  
  const remainingExperts = initialExperts.filter(e => !retiredBefore.includes(e) && !retiringThisYear.includes(e));

  return (
    <div className="relative group flex-1 aspect-[2/1] min-w-[100px]">
      <div 
        className={`w-full h-full rounded-lg border transition-all duration-300 flex flex-col items-center justify-center cursor-help ${getSeverityColor(severity)} ${getSeverityBorder(severity)} group-hover:scale-[1.02] group-hover:brightness-110`}
      >
        <span className="text-white text-2xl font-black">{Math.round(severity * 100)}</span>
        {retiringThisYear.length > 0 && (
          <div className="absolute top-1 right-1">
            <UserMinus className="h-4 w-4 text-white/90" />
          </div>
        )}
      </div>

      {/* Enhanced Tooltip on Hover */}
      <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
        <div className="flex justify-between items-start mb-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{data.year} Forecast</div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${severity >= 0.6 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-400'}`}>
            {severity >= 0.8 ? 'Critical Alert' : severity >= 0.6 ? 'High Risk' : 'Strategic Stability'}
          </span>
        </div>
        
        <div className="text-sm font-bold text-white mb-2 truncate">{gap}</div>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Coverage</div>
              <div className="text-lg font-black text-white">{data.projected_coverage}%</div>
            </div>
            <div className="bg-slate-950 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Gap Severity</div>
              <div className="text-lg font-black text-cyan-400">{Math.round(severity * 100)}%</div>
            </div>
          </div>

          {retiringThisYear.length > 0 && (
            <div className="pt-2">
              <div className="text-[10px] font-bold text-red-400 mb-2 flex items-center gap-1">
                <UserMinus className="h-3 w-3" /> RETIRING THIS YEAR
              </div>
              <div className="space-y-1">
                {retiringThisYear.map(name => (
                  <div key={name} className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-[11px] border border-red-500/20 font-bold flex justify-between">
                    <span>{name}</span>
                    <span className="opacity-50 font-normal">Expertise loss</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800">
            <div className="text-[10px] font-bold text-emerald-400 mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> REMAINING EXPERTS ({remainingExperts.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {remainingExperts.length > 0 ? (
                remainingExperts.map(name => (
                  <span key={name} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] border border-slate-700 font-medium">
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-red-500 italic font-bold">ZERO Coverage Remaining</span>
              )}
            </div>
          </div>

          {severity > 0.3 && (
            <div className="pt-2 mt-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-2 text-[10px] font-bold text-amber-400 flex items-start gap-2">
              <ShieldAlert className="h-3 w-3 mt-0.5 shrink-0" />
              <div>STRATEGIC NEED: Recruit replacement by Q4 {data.year - 1}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryStat = ({ label, value, sub, icon: Icon, color = 'cyan' }) => (
  <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
    <div className={`absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-400`}>
      <Icon className="h-20 w-20" />
    </div>
    <div className="relative z-10">
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="flex items-end gap-2">
        <div className="text-3xl font-black text-white leading-none">{value}</div>
        <div className="text-xs text-slate-400 font-medium mb-1">{sub}</div>
      </div>
    </div>
  </div>
);

export default function GapSeverityTimeline({ projectId, setActiveTab }) {
  const [data, setData] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [timelineRes, candidatesRes] = await Promise.all([
          axios.get(`/api/projects/${projectId}/severity-timeline`, { withCredentials: true }),
          axios.get(`/api/projects/${projectId}/candidates`, { withCredentials: true })
        ]);
        setData(timelineRes.data);
        setCandidates(candidatesRes.data.candidates || []);
      } catch (error) {
        console.error('Failed to fetch timeline data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium animate-pulse tracking-widest uppercase text-xs">Simulating Board Refreshment Dynamics...</p>
      </div>
    );
  }

  if (!data?.success || !data.timeline?.length) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 italic">
        Baseline gap analysis required to model timeline forecast.
      </div>
    );
  }

  const years = data.timeline[0].forecast.map(f => f.year);
  
  // Aggregate statistics
  const aggregateTrend = years.map((year, idx) => {
    const avgSeverity = data.timeline.reduce((acc, cat) => acc + cat.forecast[idx].severity_index, 0) / data.timeline.length;
    return { year, severity: Math.round(avgSeverity * 100) };
  });

  const totalRetirements = new Set(data.timeline.flatMap(cat => cat.forecast.flatMap(f => f.retiring_experts))).size;
  const criticalGaps = data.timeline.filter(cat => cat.forecast[cat.forecast.length - 1].severity_index >= 0.8).length;
  const blindSpots = data.timeline.filter(cat => cat.forecast[0].projected_coverage === 0).length;
  const peakRisk = Math.max(...aggregateTrend.map(t => t.severity));

  // Determine Succession Priorities
  const priorities = data.timeline
    .map(cat => {
      const peakForecast = [...cat.forecast].sort((a, b) => b.severity_index - a.severity_index)[0];
      const urgencyScore = cat.forecast.reduce((acc, f) => acc + f.severity_index, 0);
      
      // Find top candidate for this gap
      const topCandidate = candidates
        .filter(c => c.gap_coverage_scores && c.gap_coverage_scores[cat.category])
        .sort((a, b) => b.gap_coverage_scores[cat.category] - a.gap_coverage_scores[cat.category])[0];

      return {
        category: cat.category,
        urgency: urgencyScore,
        peakSeverity: peakForecast.severity_index,
        peakYear: peakForecast.year,
        initialCoverage: cat.forecast[0].projected_coverage,
        finalCoverage: cat.forecast[cat.forecast.length - 1].projected_coverage,
        isBlindSpot: cat.forecast[0].projected_coverage === 0,
        candidate: topCandidate
      };
    })
    .sort((a, b) => b.urgency - a.urgency)
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-20">
      
      {/* ── Forecast Summary Metrics ── */}
      <div className="grid grid-cols-4 gap-6">
        <SummaryStat label="Critical Retirements" value={totalRetirements} sub="Directors by 2031" icon={UserMinus} color="red" />
        <SummaryStat label="Future Blind Spots" value={criticalGaps} sub="Severe shortages" icon={ShieldAlert} color="orange" />
        <SummaryStat label="Zero-Coverage Gaps" value={blindSpots} sub="Existing gaps" icon={Target} color="amber" />
        <SummaryStat label="Peak Strategy Risk" value={`${peakRisk}%`} sub="Projected for 2029" icon={TrendingUp} color="cyan" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Risk Trend Chart */}
        <div className="col-span-8 bg-slate-900/60 border border-white/5 rounded-3xl p-8 relative overflow-hidden group backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Clock className="h-48 w-48 text-cyan-400" />
          </div>
          
          <div className="relative z-10 flex justify-between items-start mb-10">
            <div>
              <h3 className="text-2xl font-black text-white flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-cyan-400" />
                Strategic Risk Horizon
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-md">Aggregate board deficiency model accounting for all skill-loss vectors over the 5-year engagement term.</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aggregateTrend}>
                <defs>
                  <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 13, fontWeight: 700}}
                  dy={15}
                />
                <YAxis hide domain={[0, 100]} />
                <RechartsTooltip 
                  cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-950 border border-slate-700 p-4 rounded-2xl shadow-2xl">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{payload[0].payload.year} Projection</div>
                          <div className="text-2xl font-black text-white">{payload[0].value}% <span className="text-xs font-normal text-slate-500">Board Deficiency</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="severity" 
                  stroke="#22d3ee" 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorSev)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 🎯 Succession Priorities Panel ── */}
        <div className="col-span-4 space-y-4">
          <div className="bg-slate-900/60 border border-white/5 rounded-3xl p-8 h-full backdrop-blur-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-red-500" />
              Succession Priorities
            </h3>
            <div className="space-y-6">
              {priorities.map((p, i) => (
                <motion.div 
                  key={p.category}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`p-4 rounded-2xl border ${p.peakSeverity >= 0.8 ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950/50 border-white/5'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${p.peakSeverity >= 0.8 ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'}`}>
                      {p.peakSeverity >= 0.8 ? 'Urgent' : 'Critical'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{p.peakYear} Impact</span>
                  </div>
                  <div className="text-sm font-black text-white mb-1 truncate">{p.category}</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                    {p.isBlindSpot 
                      ? "Complete blind spot - zero existing board coverage identified."
                      : `Coverage drops ${Math.round(p.initialCoverage * 100)}% → ${Math.round(p.finalCoverage * 100)}% by ${p.peakYear}.`
                    }
                  </p>
                  
                  {p.candidate && (
                    <div 
                      onClick={() => setActiveTab('match')}
                      className="group/cand bg-slate-900/80 border border-white/5 rounded-xl p-3 cursor-pointer hover:border-cyan-500/30 transition-all"
                    >
                      <div className="text-[9px] font-bold text-slate-600 uppercase mb-1">Recommended Solution</div>
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-cyan-400 group-hover/cand:text-cyan-300 transition-colors flex items-center gap-1">
                          {p.candidate.name} <ExternalLink className="h-3 w-3" />
                        </div>
                        <div className="text-[10px] font-black text-white">{p.candidate.gap_coverage_scores[p.category]}% Match</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Clock className="h-3 w-3" /> Recruit by Q3 {p.peakYear - 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Severity Matrix (Heatmap) ── */}
      <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-sm relative overflow-hidden">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="text-3xl font-black text-white">Board Deficiency Roadmap</h3>
            <p className="text-slate-500 mt-2 max-w-2xl">Projected gap severity scores from 2026 to 2031. Severity escalates as expertise rolls off the board due to retirement or tenure limits.</p>
          </div>
          
          <div className="bg-slate-950/80 rounded-2xl border border-white/5 p-4">
            <div className="flex gap-6 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-emerald-500/60" /> <span className="opacity-70">Stable</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-amber-500/70" /> <span className="opacity-70">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-orange-500/80 shadow-[0_0_10px_rgba(249,115,22,0.2)]" /> <span className="opacity-70">High Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-lg bg-red-500/90 shadow-[0_0_15px_rgba(239,68,68,0.3)]" /> <span className="opacity-100">Critical</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Header Year labels */}
          <div className="flex gap-4 mb-4">
            <div className="w-72" /> {/* Spacer for category column */}
            {years.map(year => (
              <div key={year} className="flex-1 text-center py-4 bg-slate-900/40 rounded-2xl border border-white/5">
                <div className="text-lg font-black text-white leading-none">{year}</div>
                <div className="text-[10px] text-slate-500 uppercase font-black mt-1 tracking-tighter">Forecast</div>
              </div>
            ))}
          </div>

          {/* Category Rows */}
          {data.timeline.map((cat, catIdx) => {
             // Find all experts for this category across the timeline
             const experts = new Set(cat.forecast.flatMap(f => f.retiring_experts || []));
             // Estimate total experts from initial coverage if set, or just use retiring list
             const initialExperts = Array.from(experts);

             return (
              <motion.div 
                key={cat.category}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIdx * 0.08 }}
                className="flex gap-4 items-center group/row"
              >
                <div className="w-72 pr-6">
                  <h4 className="text-base font-black text-slate-200 group-hover/row:text-cyan-400 transition-colors truncate">
                    {cat.category}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Target className="h-3 w-3 text-slate-600" />
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                      Target: {cat.target_coverage}%
                    </span>
                  </div>
                </div>
                
                {cat.forecast.map((f, yIdx) => (
                  <SeverityCell 
                    key={yIdx} 
                    gap={cat.category} 
                    forecast={cat.forecast} 
                    yearIdx={yIdx} 
                    initialExperts={initialExperts}
                  />
                ))}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Footer / Methodology ── */}
      <div className="bg-slate-900/20 border-t border-white/5 p-8 flex justify-between items-center rounded-b-3xl">
        <div className="flex items-center gap-10 text-[11px] text-slate-500 font-bold uppercase tracking-widest">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-cyan-500/50" />
            Forecast Audit: Refreshment Cycle v2.1
          </div>
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5 text-purple-500/50" />
            Logic: Mandatory retirement @ 75 or 12yr term
          </div>
          <div className="flex items-center gap-3">
            <Info className="h-5 w-5 text-slate-700" />
            Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
        <button className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black text-white hover:bg-white/10 transition-all flex items-center gap-3 uppercase tracking-[0.2em] group">
          Export Full Engagement Roadmap
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
}
