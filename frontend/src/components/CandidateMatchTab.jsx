import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, ArrowRight, AlertTriangle } from 'lucide-react';
import { getProjectCandidates, updateProjectCandidateStatus } from '../lib/api';

const REVIEW_STATUSES = {
  new:          { label: 'New',          bg: 'bg-slate-700/50',    text: 'text-slate-300',  border: 'border-slate-600/40' },
  sourced:      { label: 'Sourced',      bg: 'bg-slate-700/50',    text: 'text-slate-300',  border: 'border-slate-600/40' },
  screened:     { label: 'Screened',     bg: 'bg-blue-500/10',     text: 'text-blue-400',   border: 'border-blue-500/25' },
  reviewed:     { label: 'Reviewed',     bg: 'bg-indigo-500/10',   text: 'text-indigo-400', border: 'border-indigo-500/25' },
  shortlisted:  { label: 'Shortlisted',  bg: 'bg-violet-500/10',   text: 'text-violet-400', border: 'border-violet-500/25' },
  client_ready: { label: 'Client-Ready', bg: 'bg-emerald-500/10',  text: 'text-emerald-400',border: 'border-emerald-500/25' },
  presented:    { label: 'Presented',    bg: 'bg-cyan-500/10',     text: 'text-cyan-400',   border: 'border-cyan-500/25' },
  archived:     { label: 'Archived',     bg: 'bg-slate-800/60',    text: 'text-slate-600',  border: 'border-slate-700/40' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatRelativeTime = (date) => {
  if (!date) return null;
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 10) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const clip = (n, min = 0, max = 100) => Math.min(max, Math.max(min, n));

/**
 * Gaps this candidate uniquely fills — ≥70% AND no other shortlisted candidate ≥70%.
 * Measures irreplaceability: if not hired, this capability stays off the board.
 */
const getUniqueGaps = (cand, gaps, allCands) =>
  gaps.filter(g => {
    if ((cand.expertise[g.gap_title] || 0) < 70) return false;
    return !allCands.some(o => o.id !== cand.id && (o.expertise[g.gap_title] || 0) >= 70);
  });

/**
 * Blind-spot gaps: current board coverage < 10% AND candidate ≥70%.
 * "Creates NEW capability" — highest strategic priority.
 */
const getBlindSpotGaps = (cand, gaps) =>
  gaps.filter(g => g.current_coverage < 10 && (cand.expertise[g.gap_title] || 0) >= 70);

/**
 * Redundant gaps: candidate fills (≥70%) but board already has strong coverage
 * (current_coverage ≥ 60 AND at least one existing member covers it).
 */
const getRedundantGaps = (cand, gaps) =>
  gaps.filter(g =>
    (cand.expertise[g.gap_title] || 0) >= 70 &&
    g.current_coverage >= 60 &&
    (g.members_with || []).length > 0
  );

/**
 * 4-component strategic fit score (replaces target-coverage weighted score):
 *   40% uniqueness         — unique gaps / gaps filled
 *   30% blind-spot value   — blind-spot gap weight / total gap weight
 *   20% complementary fit  — non-redundant fills / gaps filled
 *   10% overall expertise  — avg expertise score / 100
 */
const calcStrategicFit = (cand, gaps, allCands, totalGapWeight) => {
  const filledGaps   = gaps.filter(g => (cand.expertise[g.gap_title] || 0) >= 70);
  const uniqueGaps   = getUniqueGaps(cand, gaps, allCands);
  const blindSpots   = getBlindSpotGaps(cand, gaps);
  const redundant    = getRedundantGaps(cand, gaps);

  const uniqueness      = filledGaps.length > 0 ? uniqueGaps.length / filledGaps.length : 0;
  const blindSpotWeight = blindSpots.reduce((s, g) => s + (g.gap_score || 0), 0);
  const blindSpotValue  = totalGapWeight > 0 ? blindSpotWeight / totalGapWeight : 0;
  const compFit         = filledGaps.length > 0
    ? (filledGaps.length - redundant.length) / filledGaps.length
    : 0;
  const avgExpertise    = gaps.length > 0
    ? gaps.reduce((s, g) => s + (cand.expertise[g.gap_title] || 0), 0) / gaps.length / 100
    : 0;

  return Math.round((uniqueness * 0.4 + blindSpotValue * 0.3 + compFit * 0.2 + avgExpertise * 0.1) * 100);
};

/**
 * Strategic tier for each gap × candidate combination.
 * Based purely on board coverage level — board-coverage-based tiers, not shortlist uniqueness.
 *
 * EMERALD  candidate ≥70%, board <5%   — fills board blind spot (new capability)
 * TEAL     candidate ≥70%, board <30%  — strong unique contribution
 * AMBER    candidate ≥70%, board <70%  — incremental improvement
 * ROSE     candidate ≥70%, board ≥70%  — redundant with existing directors
 */
const getGapTier = (gap, candidateScore) => {
  if (candidateScore >= 70) {
    const cov = gap.current_coverage;
    if (cov < 5)  return { label: 'FILLS BLIND SPOT',    tier: 4, bar: '#10b981', badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' };
    if (cov < 30) return { label: 'UNIQUE CONTRIBUTION', tier: 3, bar: '#14b8a6', badge: 'bg-teal-500/15    border-teal-500/40    text-teal-300'    };
    if (cov < 70) return { label: 'INCREMENTAL VALUE',   tier: 2, bar: '#f59e0b', badge: 'bg-amber-500/15   border-amber-500/40   text-amber-300'   };
    return         { label: 'REDUNDANT WITH BOARD',      tier: 1, bar: '#f43f5e', badge: 'bg-rose-500/15    border-rose-500/40    text-rose-300'    };
  }
  if (candidateScore >= 50)
    return         { label: 'PARTIAL',                   tier: 1, bar: '#64748b', badge: 'bg-slate-700/50   border-slate-600/40   text-slate-400'   };
  return           { label: 'LOW',                       tier: 0, bar: '#1e293b', badge: 'bg-slate-800/60   border-slate-700/40   text-slate-600'   };
};

/**
 * Best complementary pairings from the shortlist.
 * Ranks other candidates by how many unique gaps they add on top of this one.
 */
const getComplementaryPairs = (cand, gaps, allCands) => {
  const myFilled = new Set(
    gaps.filter(g => (cand.expertise[g.gap_title] || 0) >= 70).map(g => g.gap_title)
  );
  return allCands
    .filter(o => o.id !== cand.id)
    .map(other => {
      const otherFilled = gaps.filter(g => (other.expertise[g.gap_title] || 0) >= 70).map(g => g.gap_title);
      const addedCoverage = otherFilled.filter(t => !myFilled.has(t)).length;
      const overlap = otherFilled.filter(t => myFilled.has(t)).length;
      return { candidate: other, addedCoverage, overlap };
    })
    .filter(p => p.addedCoverage > 0)
    .sort((a, b) => b.addedCoverage - a.addedCoverage)
    .slice(0, 2);
};

// ── ScoreRing ─────────────────────────────────────────────────────────────────

const ScoreRing = ({ score, size = 72, isSelected }) => {
  const pct = clip(score);
  // SVG r=15.9 → circumference ≈ 100, dasharray units == % directly
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 36 36" className="absolute inset-0 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1e293b" strokeWidth="2.8" />
        <circle
          cx="18" cy="18" r="15.9"
          fill="none"
          stroke={isSelected ? '#14b8a6' : '#7c3aed'}
          strokeWidth="2.8"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="relative flex flex-col items-center leading-none">
        <span className="text-white font-black" style={{ fontSize: Math.round(size * 0.23) }}>{score}</span>
        <span className="text-slate-500 uppercase tracking-wider" style={{ fontSize: Math.round(size * 0.1) }}>BRI fit</span>
      </div>
    </div>
  );
};

// ── StrategicGapBar ───────────────────────────────────────────────────────────

const StrategicGapBar = ({ gap, candidateScore }) => {
  const tier     = getGapTier(gap, candidateScore);
  const shortT   = gap.gap_title.length > 36 ? gap.gap_title.slice(0, 34) + '…' : gap.gap_title;
  const boardCov = Math.round(gap.current_coverage);
  const boardLabel = boardCov < 5  ? 'Board: ZERO'
                   : boardCov < 30 ? `Board: only ${boardCov}%`
                   :                 `Board: ${boardCov}%`;

  return (
    <div>
      <div className="flex items-center justify-between mb-1 gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {gap.priority === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
          {gap.priority === 'high'     && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
          {gap.priority !== 'critical' && gap.priority !== 'high' &&
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0" />}
          <span className="text-slate-300 text-xs font-medium truncate">{shortT}</span>
          <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${tier.badge}`}>
            {tier.label}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[10px] ${boardCov < 5 ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
            {boardLabel}
          </span>
          <span className="text-white text-xs font-black w-8 text-right">{candidateScore}%</span>
        </div>
      </div>
      {/* Stacked bar: board baseline (dim) + candidate score (bright) */}
      <div className="relative h-2 bg-slate-800/80 rounded-full overflow-hidden">
        <div className="absolute h-full rounded-full"
          style={{ width: `${boardCov}%`, backgroundColor: 'rgba(100,116,139,0.35)' }} />
        <div className="absolute h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${candidateScore}%`, backgroundColor: tier.bar, opacity: 0.88 }} />
        <div className="absolute top-0 bottom-0 w-px bg-slate-500/60" style={{ left: '70%' }} />
      </div>
      {/* Strategic annotation */}
      {boardCov < 5 && candidateScore >= 70 && (
        <div className="text-[10px] text-emerald-500/80 mt-0.5 pl-0.5 font-semibold">
          Board has zero coverage — candidate creates entirely new strategic capability
        </div>
      )}
      {boardCov >= 5 && boardCov < 30 && candidateScore >= 70 && (
        <div className="text-[10px] text-teal-500/70 mt-0.5 pl-0.5">
          Board barely covers this — candidate brings perspective no current director offers
        </div>
      )}
      {boardCov >= 70 && candidateScore >= 70 && (
        <div className="text-[10px] text-rose-500/60 mt-0.5 pl-0.5">
          Board already strong here — low incremental value
        </div>
      )}
    </div>
  );
};

// ── FreshnessIndicator ────────────────────────────────────────────────────────

const FreshnessIndicator = ({ syncedAt, onRefresh, refreshing }) => {
  const [label, setLabel] = useState(formatRelativeTime(syncedAt));
  useEffect(() => {
    if (!syncedAt) return;
    setLabel(formatRelativeTime(syncedAt));
    const iv = setInterval(() => setLabel(formatRelativeTime(syncedAt)), 15000);
    return () => clearInterval(iv);
  }, [syncedAt]);
  if (!syncedAt) return null;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
        </span>
        <span>pgvector sync</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400">{label}</span>
      </div>
      <button
        onClick={onRefresh}
        disabled={refreshing}
        className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40"
      >
        <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
        {refreshing ? 'Syncing…' : 'Refresh'}
      </button>
    </div>
  );
};

// ── HeatMatrix ────────────────────────────────────────────────────────────────

const HeatMatrix = ({ gaps, candidates, selectedId }) => {
  const cell = (val) => {
    if (val >= 70) return { bg: 'rgba(20,184,166,0.65)',  text: '#ccfbf1' };
    if (val >= 50) return { bg: 'rgba(245,158,11,0.40)', text: '#fef3c7' };
    return           { bg: 'rgba(30,41,59,0.90)',        text: '#475569' };
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1">
        <thead>
          <tr>
            <th className="text-left text-slate-500 font-medium pb-2 pr-4 text-xs">Gap Category</th>
            {candidates.map(c => (
              <th key={c.id} className={`pb-2 px-1 text-center text-xs font-semibold ${c.id === selectedId ? 'text-purple-300' : 'text-slate-500'}`}>
                {c.name.split(' ')[0]}
              </th>
            ))}
            <th className="pb-2 px-2 text-center text-xs font-semibold text-slate-600">Board</th>
          </tr>
        </thead>
        <tbody>
          {gaps.map(gap => (
            <tr key={gap.gap_title}>
              <td className="pr-4 py-0.5 text-slate-300 text-xs font-medium whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  {gap.priority === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />}
                  {gap.priority === 'high'     && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />}
                  {gap.priority !== 'critical' && gap.priority !== 'high' &&
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-700 flex-shrink-0" />}
                  <span className="max-w-[210px] truncate">{gap.gap_title}</span>
                </div>
              </td>
              {candidates.map(c => {
                const val = c.expertise[gap.gap_title] || 0;
                const { bg, text } = cell(val);
                return (
                  <td key={c.id} className="py-0.5 px-1 text-center">
                    <div
                      className={`rounded text-xs font-bold py-1 px-1 min-w-[2.5rem] ${c.id === selectedId ? 'ring-1 ring-purple-500/50' : 'opacity-55'}`}
                      style={{ backgroundColor: bg, color: text }}
                    >
                      {val}
                    </div>
                  </td>
                );
              })}
              {/* Board current coverage column */}
              <td className="py-0.5 px-2 text-center">
                <div
                  className="rounded text-xs font-bold py-1 px-1 min-w-[2.5rem] opacity-70"
                  style={{ ...cell(Math.round(gap.current_coverage)) }}
                >
                  {Math.round(gap.current_coverage)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-5 mt-3 text-xs text-slate-600">
        {[{ r: '≥70', bg: 'rgba(20,184,166,0.65)' }, { r: '50–69', bg: 'rgba(245,158,11,0.40)' }, { r: '<50', bg: 'rgba(30,41,59,0.90)' }].map(({ r, bg }) => (
          <div key={r} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: bg }} />
            {r}%
          </div>
        ))}
        <span className="text-slate-700 ml-2">· rightmost column = current board coverage</span>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const TOP_N = 5;

export default function CandidateMatchTab({ projectId }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [candidates, setCandidates]       = useState([]);
  const [selectedId, setSelectedId]       = useState(null);
  const [syncedAt, setSyncedAt]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [error, setError]                 = useState(null);
  const [showAll, setShowAll]             = useState(false);
  const [reviewStatuses, setReviewStatuses] = useState({});

  const setReviewStatus = async (projectCandidateId, status) => {
    setReviewStatuses(prev => ({ ...prev, [projectCandidateId]: status }));
    setCandidates(prev => prev.map(candidate => (
      candidate.pc_id === projectCandidateId ? { ...candidate, status } : candidate
    )));

    try {
      await updateProjectCandidateStatus(projectId, projectCandidateId, status);
    } catch (err) {
      console.error('Candidate status update failed:', err);
      fetchCandidates(false);
    }
  };

  const fetchCandidates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await getProjectCandidates(projectId);
      if (data.success) {
        const mapped = (data.candidates || []).map(item => ({
          id:              item.candidate_id,
          pc_id:           item.id,
          name:            item.name,
          title:           item.title || item.company || 'Board Candidate',
          experience:      item.years_experience ? `${item.years_experience} yrs` : null,
          current_boards:  item.board_count ?? null,
          industries:      item.industries || [],
          status:          item.status,
          expertise:       item.gap_coverage_scores || {},
          match_reasoning: item.match_reasoning || null,
          api_match_score: item.match_score || 0,
        }));
        setCandidates(mapped);
        setReviewStatuses(Object.fromEntries(mapped.map(candidate => [candidate.pc_id, candidate.status || 'sourced'])));
        setSyncedAt(new Date());
        if (mapped.length > 0) setSelectedId(prev => prev ?? mapped[0].id);
      }
    } catch (err) {
      console.error('CandidateMatchTab fetch error:', err);
      if (!isRefresh) setError('Failed to load candidates.');
    } finally {
      if (isRefresh) setRefreshing(false);
    }
  }, [projectId]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/dashboard-data`, { credentials: 'include' }),
          fetchCandidates(false),
        ]);
        setDashboardData(await dashRes.json());
      } catch (err) {
        console.error('CandidateMatchTab dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [projectId, fetchCandidates]);

  // ── Guards ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex gap-2 items-center text-slate-400">
        <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        Loading candidate analysis…
      </div>
    </div>
  );
  if (!dashboardData?.success || !dashboardData.gaps?.length) return (
    <div className="flex items-center justify-center h-64 text-slate-400">No gap data available for this project.</div>
  );
  if (error && candidates.length === 0) return (
    <div className="flex items-center justify-center h-64 text-slate-400">{error}</div>
  );
  if (candidates.length === 0) return (
    <div className="flex items-center justify-center h-64 text-slate-400">No candidates sourced for this project yet.</div>
  );

  // ── Derived state ─────────────────────────────────────────────────────────

  const { gaps } = dashboardData;
  const totalGapWeight = gaps.reduce((s, g) => s + (g.gap_score || 0), 0);

  // Sort by strategic fit score (primary) then api_match_score (tiebreak)
  const sortedCandidates = [...candidates].sort((a, b) => {
    const sa = calcStrategicFit(a, gaps, candidates, totalGapWeight);
    const sb = calcStrategicFit(b, gaps, candidates, totalGapWeight);
    return sb - sa || b.api_match_score - a.api_match_score;
  });

  const visibleCandidates = showAll ? sortedCandidates : sortedCandidates.slice(0, TOP_N);
  const candidate         = candidates.find(c => c.id === selectedId) || sortedCandidates[0];
  const rank              = sortedCandidates.findIndex(c => c.id === candidate.id) + 1;

  // Per-candidate derived values for the detail panel
  const strategicFit   = calcStrategicFit(candidate, gaps, candidates, totalGapWeight);
  const uniqueGaps     = getUniqueGaps(candidate, gaps, candidates);
  const blindSpotGaps  = getBlindSpotGaps(candidate, gaps);
  const redundantGaps  = getRedundantGaps(candidate, gaps);
  const filledGaps     = gaps.filter(g => (candidate.expertise[g.gap_title] || 0) >= 70);
  const redundancyRate = filledGaps.length > 0 ? redundantGaps.length / filledGaps.length : 0;
  const isRedundancyWarning = redundancyRate > 0.6 && filledGaps.length > 1;

  const criticalGaps   = gaps.filter(g => g.priority === 'critical');
  const highGaps       = gaps.filter(g => g.priority === 'high');
  const criticalFilled = criticalGaps.filter(g => (candidate.expertise[g.gap_title] || 0) >= 70).length;
  const highFilled     = highGaps.filter(g => (candidate.expertise[g.gap_title] || 0) >= 70).length;

  const pairings = getComplementaryPairs(candidate, gaps, candidates);

  // Gap bars sorted: blind spots → unique → complements → partial → redundant
  const sortedGapBars = [...gaps].sort((a, b) => {
    const ta = getGapTier(a, candidate.expertise[a.gap_title] || 0).tier;
    const tb = getGapTier(b, candidate.expertise[b.gap_title] || 0).tier;
    if (tb !== ta) return tb - ta;
    return (candidate.expertise[b.gap_title] || 0) - (candidate.expertise[a.gap_title] || 0);
  });

  // Strategic impact rows for "If Hired" section
  // Sorted: blind spots first, then unique, then significant, then incremental
  const ifHiredRows = gaps
    .map(g => {
      const cScore      = candidate.expertise[g.gap_title] || 0;
      const before      = Math.round(g.current_coverage);
      const after       = Math.round(Math.max(g.current_coverage, cScore));
      const improvement = Math.round(Math.max(0, cScore - g.current_coverage));
      const isBlind     = g.current_coverage < 5  && cScore >= 70;
      // isUnique: board barely covers this AND no existing director has it
      const isUnique    = cScore >= 70 && g.current_coverage < 30 && (g.members_with || []).length === 0;
      const priority    = isBlind ? 4 : isUnique ? 3 : improvement >= 20 ? 2 : improvement > 5 ? 1 : 0;
      const impactLabel = isBlind   ? 'Fills Board Blind Spot'
                        : isUnique  ? 'No Director Has This'
                        : improvement >= 20 ? 'Significant Improvement'
                        : 'Incremental Gain';
      const impactBadge = isBlind
        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
        : isUnique
        ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
        : improvement >= 20
        ? 'bg-violet-500/15 border-violet-500/30 text-violet-300'
        : 'bg-slate-700/40 border-slate-600/30 text-slate-500';
      return { ...g, before, after, improvement, priority, impactLabel, impactBadge, isBlind, isUnique };
    })
    .filter(g => g.improvement > 5 || g.isBlind)
    .sort((a, b) => b.priority - a.priority || b.improvement - a.improvement)
    .slice(0, 6);

  const sT = (t, max = 26) => t.length > max ? t.slice(0, max - 1) + '…' : t;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── A: Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">
            TalentVault Shortlist
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 uppercase tracking-wide">
            {candidates.length} · TalentVault Strategic Fit Score
          </span>
        </div>
        <FreshnessIndicator syncedAt={syncedAt} onRefresh={() => fetchCandidates(true)} refreshing={refreshing} />
      </div>

      {/* ── B: Candidate Roster (top 5, expandable) ── */}
      <div>
        <div className={`grid gap-4 ${visibleCandidates.length <= 3 ? 'grid-cols-3' : visibleCandidates.length === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
          {visibleCandidates.map((cand) => {
            const sf         = calcStrategicFit(cand, gaps, candidates, totalGapWeight);
            const isSelected = cand.id === selectedId;
            const r          = sortedCandidates.findIndex(c => c.id === cand.id) + 1;
            const uq         = getUniqueGaps(cand, gaps, candidates).length;
            const bs         = getBlindSpotGaps(cand, gaps).length;
            return (
              <button
                key={cand.id}
                onClick={() => setSelectedId(cand.id)}
                className={`relative text-left rounded-2xl p-4 border transition-all duration-200 ${
                  isSelected
                    ? 'border-purple-500/50 bg-slate-900/80'
                    : 'border-slate-700/40 bg-slate-900/40 hover:border-slate-600/60 hover:bg-slate-900/60'
                }`}
              >
                {isSelected && (
                  <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-600/25 to-teal-500/25 blur-sm -z-10" />
                )}
                {/* Top accent bar — strong selected signal */}
                {isSelected && (
                  <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-violet-500 to-teal-500" />
                )}
                <div className="absolute top-3 left-3.5">
                  <span className="text-xs font-bold text-slate-600">#{r}</span>
                </div>

                <div className="flex justify-center mt-3 mb-2.5">
                  <ScoreRing score={sf} size={72} isSelected={isSelected} />
                </div>

                <div className="text-center">
                  <div className="font-bold text-white text-sm leading-tight">{cand.name}</div>
                  <div className="text-slate-400 text-xs mt-0.5 leading-snug line-clamp-2">{cand.title}</div>

                  {/* Micro-badges */}
                  <div className="flex justify-center gap-1.5 mt-2.5 flex-wrap">
                    {bs > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-red-500/15 border-red-500/30 text-red-300 uppercase">
                        {bs} blind spot{bs > 1 ? 's' : ''}
                      </span>
                    )}
                    {uq > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border bg-teal-500/15 border-teal-500/30 text-teal-300 uppercase">
                        {uq} unique
                      </span>
                    )}
                  </div>
                  {/* Review status */}
                  {(() => {
                    const rs = reviewStatuses[cand.pc_id] || cand.status || 'sourced';
                    const rm = REVIEW_STATUSES[rs];
                    return (
                      <div className="mt-2 flex justify-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${rm.bg} ${rm.text} ${rm.border}`}>
                          {rm.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </button>
            );
          })}
        </div>

        {candidates.length > TOP_N && (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setShowAll(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 border border-slate-700/50 hover:border-slate-600 bg-slate-900/40 rounded-xl px-4 py-2 transition-all"
            >
              {showAll
                ? <><ChevronUp className="w-3.5 h-3.5" /> Show Top {TOP_N}</>
                : <><ChevronDown className="w-3.5 h-3.5" /> View All {candidates.length} Candidates</>}
            </button>
          </div>
        )}
      </div>

      {/* ── C: Candidate Detail Panel ── */}
      <div className="relative">
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-violet-600 to-teal-500 opacity-35 blur-sm pointer-events-none" />
        <div className="relative bg-slate-950/95 border border-white/10 rounded-2xl overflow-hidden">

          {/* Panel header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-800/70">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-white font-bold text-xl">{candidate.name}</h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-violet-500/15 border-violet-500/40 text-violet-300">
                  #{rank} · {strategicFit}% TALENTVAULT FIT SCORE
                </span>
                {blindSpotGaps.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-red-500/15 border-red-500/40 text-red-300">
                    {blindSpotGaps.length} BLIND SPOT{blindSpotGaps.length > 1 ? 'S' : ''} FILLED
                  </span>
                )}
                {uniqueGaps.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-teal-500/15 border-teal-500/40 text-teal-300">
                    {uniqueGaps.length} UNIQUE CAPABILITY{uniqueGaps.length > 1 ? ' AREAS' : ''}
                  </span>
                )}
                {isRedundancyWarning && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/15 border-amber-500/40 text-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    REDUNDANCY RISK
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm">{candidate.title}</p>
            </div>
            {/* Review status selector */}
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">Review Status</span>
              <div className="flex items-center gap-1">
                {Object.entries(REVIEW_STATUSES).map(([key, meta]) => {
                  const isCurrent = (reviewStatuses[candidate.pc_id] || candidate.status || 'sourced') === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setReviewStatus(candidate.pc_id, key)}
                      className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide transition-all ${
                        isCurrent
                          ? `${meta.bg} ${meta.text} ${meta.border} opacity-100`
                          : 'bg-transparent border-slate-700/40 text-slate-600 hover:border-slate-600 hover:text-slate-400'
                      }`}
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4-stat bar */}
          <div className="grid grid-cols-4 divide-x divide-slate-800/70 border-b border-slate-800/70">
            {[
              {
                val: uniqueGaps.length > 0 ? uniqueGaps.length : '—',
                label: 'Unique Capabilities',
                sub: 'Only candidate with this expertise',
                color: uniqueGaps.length > 0 ? 'text-teal-400' : 'text-slate-600',
              },
              {
                val: blindSpotGaps.length > 0 ? blindSpotGaps.length : '—',
                label: 'Blind Spots Covered',
                sub: 'Board currently at 0% coverage',
                color: blindSpotGaps.length > 0 ? 'text-red-400' : 'text-slate-600',
              },
              {
                val: `${criticalFilled}/${criticalGaps.length}`,
                label: 'Critical Gaps Filled',
                sub: `+ ${highFilled}/${highGaps.length} high priority`,
                color: criticalFilled === criticalGaps.length && criticalGaps.length > 0
                  ? 'text-teal-400' : criticalFilled > 0 ? 'text-amber-400' : 'text-rose-400',
              },
              {
                val: isRedundancyWarning
                  ? `${Math.round(redundancyRate * 100)}%`
                  : redundantGaps.length > 0
                  ? `${redundantGaps.length} gap${redundantGaps.length > 1 ? 's' : ''}`
                  : 'Clean',
                label: 'Redundancy w/ Board',
                sub: isRedundancyWarning ? 'High overlap — review carefully' : 'Overlap with existing directors',
                color: isRedundancyWarning ? 'text-amber-400' : redundantGaps.length > 0 ? 'text-slate-400' : 'text-teal-400',
              },
            ].map(({ val, label, sub, color }) => (
              <div key={label} className="px-5 py-3.5 text-center">
                <div className={`text-2xl font-black ${color}`}>{val}</div>
                <div className="text-xs font-semibold text-slate-300 mt-0.5">{label}</div>
                <div className="text-xs text-slate-600 mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* 2-column body */}
          <div className="grid grid-cols-5 divide-x divide-slate-800/70 min-h-[340px]">

            {/* Left 3/5: Strategic Gap Coverage Bars */}
            <div className="col-span-3 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">
                    Board Composition Gap Analysis (BoardReady Method)
                  </div>
                  <div className="text-[10px] text-slate-600 mt-0.5">
                    Candidate score vs. current board coverage · sorted by strategic impact
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2 text-[10px]">
                  {[
                    { label: 'Blind Spot',   color: 'bg-emerald-500/70' },
                    { label: 'Unique',       color: 'bg-teal-500/70'    },
                    { label: 'Incremental',  color: 'bg-amber-500/60'   },
                    { label: 'Redundant',    color: 'bg-rose-500/50'    },
                  ].map(({ label, color }) => (
                    <span key={label} className="flex items-center gap-1 text-slate-600">
                      <span className={`w-2 h-1.5 rounded-sm ${color}`} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3.5">
                {sortedGapBars.map(gap => (
                  <StrategicGapBar
                    key={gap.gap_title}
                    gap={gap}
                    candidateScore={candidate.expertise[gap.gap_title] || 0}
                  />
                ))}
              </div>
            </div>

            {/* Right 2/5: Match Intelligence */}
            <div className="col-span-2 p-6 flex flex-col gap-5">

              {/* Why this score */}
              <div>
                <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">
                  TalentVault Match Intelligence
                </div>
                {candidate.match_reasoning ? (
                  <p className="text-slate-300 text-sm leading-relaxed">{candidate.match_reasoning}</p>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"   style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-slate-500 text-xs animate-pulse">Generating AI insights…</span>
                  </div>
                )}
              </div>

              {/* ── Unique Value ── */}
              {uniqueGaps.length > 0 && (
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-teal-500/60 flex-shrink-0" />
                    Unique Value — What Only {candidate.name.split(' ')[0]} Brings
                  </div>
                  <div className="space-y-1.5">
                    {uniqueGaps.map(g => (
                      <div key={g.gap_title} className="bg-teal-500/5 border border-teal-500/20 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-teal-300 text-xs font-semibold">{sT(g.gap_title, 28)}</span>
                          <span className="text-teal-400 text-xs font-black">{candidate.expertise[g.gap_title] || 0}%</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Brings perspective NO current director has
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Blind Spots Filled ── */}
              {blindSpotGaps.length > 0 && (
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-emerald-500/60 flex-shrink-0" />
                    Board Blind Spot{blindSpotGaps.length > 1 ? 's' : ''} Filled
                  </div>
                  <div className="space-y-1.5">
                    {blindSpotGaps.map(g => (
                      <div key={g.gap_title} className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-300 text-xs font-semibold">{sT(g.gap_title, 24)}</span>
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded border bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                            0% → {candidate.expertise[g.gap_title] || 0}%
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Board lacks this entirely — creates new strategic capability
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Board Dynamics ── */}
              {(() => {
                const firstName        = candidate.name.split(' ')[0];
                const candidateFills   = gaps.filter(g => (candidate.expertise[g.gap_title] || 0) >= 70);
                const newCapabilities  = candidateFills.filter(g => g.current_coverage < 5);
                const enablesNew       = candidateFills.filter(g =>
                  g.current_coverage >= 5 && g.current_coverage < 30 &&
                  (g.members_with || []).length === 0
                );
                const joinsDirectors   = candidateFills.filter(g =>
                  (g.members_with || []).length > 0 && g.current_coverage < 70
                );

                if (!newCapabilities.length && !enablesNew.length && !joinsDirectors.length) return null;

                return (
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-sm bg-indigo-500/60 flex-shrink-0" />
                      Board Dynamics if Hired
                    </div>
                    <div className="space-y-2 text-xs">
                      {newCapabilities.map(g => (
                        <div key={g.gap_title} className="flex items-start gap-2">
                          <span className="text-emerald-400 font-black flex-shrink-0 mt-px">+</span>
                          <span>
                            <span className="text-emerald-300 font-semibold">Creates NEW capability</span>
                            <span className="text-slate-400"> in {sT(g.gap_title, 26)}</span>
                            <span className="text-slate-600"> — board has zero coverage today</span>
                          </span>
                        </div>
                      ))}
                      {enablesNew.map(g => (
                        <div key={g.gap_title} className="flex items-start gap-2">
                          <span className="text-teal-400 font-black flex-shrink-0 mt-px">+</span>
                          <span>
                            <span className="text-teal-300 font-semibold">Enables {sT(g.gap_title, 22)} discussions</span>
                            <span className="text-slate-600"> no current director can lead</span>
                          </span>
                        </div>
                      ))}
                      {joinsDirectors.slice(0, 2).map(g => {
                        const dirs = (g.members_with || []).slice(0, 2);
                        return (
                          <div key={g.gap_title} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-black flex-shrink-0 mt-px">↔</span>
                            <span>
                              <span className="text-slate-300">Joins </span>
                              <span className="text-indigo-300 font-semibold">{dirs.join(' & ')}</span>
                              <span className="text-slate-400"> for {sT(g.gap_title, 22)} strategy</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* ── Redundancy Warning ── */}
              {isRedundancyWarning && (
                <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">Redundancy Warning</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {Math.round(redundancyRate * 100)}% of this candidate's strengths overlap with existing directors.
                    High score but low incremental board value — consider candidates who fill different gaps.
                  </p>
                  {redundantGaps.slice(0, 2).map(g => (
                    <div key={g.gap_title} className="text-[10px] text-amber-600/80 mt-1 flex items-center gap-1.5">
                      <span>·</span>
                      <span>{sT(g.gap_title, 30)}</span>
                      <span className="text-amber-800">— board already {Math.round(g.current_coverage)}% covered</span>
                      {(g.members_with || []).length > 0 && (
                        <span className="text-amber-800">by {g.members_with.slice(0, 1).join(', ')}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {uniqueGaps.length === 0 && blindSpotGaps.length === 0 && !isRedundancyWarning && (
                <div className="text-slate-600 text-xs">Run a pgvector sync to generate strategic analysis.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── D: Strategic Impact ("If Hired") ── */}
      {ifHiredRows.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40">
            <div>
              <h3 className="text-white font-bold text-sm">If Hired: {candidate.name}</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Strategic impact on board capability · blind spots and unique additions prioritised
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end text-xs text-slate-600">
              {[
                { label: 'Creates NEW Capability', badge: 'bg-red-500/15 border-red-500/30 text-red-300' },
                { label: 'Only Candidate',          badge: 'bg-teal-500/15 border-teal-500/30 text-teal-300' },
                { label: 'Significant Improvement', badge: 'bg-violet-500/15 border-violet-500/30 text-violet-300' },
                { label: 'Incremental Gain',        badge: 'bg-slate-700/40 border-slate-600/30 text-slate-500' },
              ].map(({ label, badge }) => (
                <span key={label} className={`px-2 py-0.5 rounded border font-bold uppercase ${badge}`}>{label}</span>
              ))}
            </div>
          </div>

          <div className="p-6 space-y-4">
            {ifHiredRows.map(g => (
              <div key={g.gap_title} className="grid items-center gap-3" style={{ gridTemplateColumns: '1fr 110px 44px 110px auto' }}>

                {/* Gap label + impact badge */}
                <div className="text-right min-w-0">
                  <div className="flex items-center justify-end gap-1.5">
                    {g.priority === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />}
                    {g.priority === 'high'     && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />}
                    <span className="text-slate-400 text-xs font-medium truncate">
                      {g.gap_title.length > 34 ? g.gap_title.slice(0, 32) + '…' : g.gap_title}
                    </span>
                  </div>
                  <div className="mt-0.5 flex justify-end">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${g.impactBadge}`}>
                      {g.impactLabel}
                    </span>
                  </div>
                </div>

                {/* Before */}
                <div className="text-center">
                  <div className="text-base font-black text-slate-500">{g.before}%</div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full bg-slate-600" style={{ width: `${g.before}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">Current</div>
                </div>

                {/* Arrow + delta */}
                <div className="flex flex-col items-center gap-0.5">
                  <ArrowRight className="w-4 h-4 text-teal-600" />
                  <span className="text-[10px] font-bold text-teal-400">+{g.improvement}%</span>
                </div>

                {/* After */}
                <div className="text-center">
                  <div className={`text-base font-black ${g.after >= 70 ? 'text-teal-400' : g.after >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {g.after}%
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden mt-1">
                    <div className="h-full rounded-full"
                      style={{ width: `${g.after}%`, backgroundColor: g.after >= 70 ? '#14b8a6' : g.after >= 50 ? '#f59e0b' : '#f43f5e' }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-600 uppercase tracking-wide mt-0.5">If Hired</div>
                </div>

                {/* Outcome badge */}
                <div className="flex-shrink-0">
                  {g.after >= 70 && g.before < 70 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded border bg-teal-500/15 border-teal-500/30 text-teal-300 uppercase whitespace-nowrap block">
                      Threshold Met
                    </span>
                  )}
                  {g.isBlind && g.after >= 70 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded border bg-red-500/15 border-red-500/30 text-red-300 uppercase whitespace-nowrap block mt-0.5">
                      0% → Capable
                    </span>
                  )}
                  {g.after < 70 && g.improvement > 5 && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded border bg-amber-500/10 border-amber-500/30 text-amber-400 uppercase whitespace-nowrap block">
                      Improved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── E: Cross-Candidate Comparison Matrix ── */}
      <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">Cross-Candidate Matrix</h3>
            <p className="text-slate-500 text-xs mt-0.5">
              {visibleCandidates.length} visible · sorted by strategic fit · rightmost column = current board coverage
            </p>
          </div>
        </div>
        <HeatMatrix gaps={gaps} candidates={visibleCandidates} selectedId={selectedId} />
      </div>

    </div>
  );
}
