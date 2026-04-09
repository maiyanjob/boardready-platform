import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import BoardMatrix from '../components/BoardMatrix';
import ChatInterface from '../components/ChatInterface';
import BoardIntelligenceDashboard from '../components/BoardIntelligenceDashboard';
import CandidateMatchTab from '../components/CandidateMatchTab';
import GapSeverityTimeline from '../components/GapSeverityTimeline';
import RelationshipGraph from '../components/RelationshipGraph';
import WorkQueue from '../components/WorkQueue';
import {
  ArrowLeft, Users, AlertCircle, TrendingUp,
  Calendar, Table, MessageSquare, BarChart3, Network,
  FileDown, Activity, LayoutDashboard, ClipboardList,
  ChevronRight, FileText, Brain, Play, CheckCircle2,
  XCircle, Loader2, Clock, ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import {
  generateProjectReport,
  getProject,
  getProjectDeliverables,
  updateProjectDeliverableStatus,
  runBoardHealthAssessment,
  getWorkflowRun,
  getLatestWorkflowRun,
} from '../lib/api';

const TABS = [
  { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
  { id: 'board',          label: 'Board',           icon: Table },
  { id: 'gaps',           label: 'Gaps',            icon: AlertCircle },
  { id: 'candidates',     label: 'Candidates',      icon: Users },
  { id: 'relationships',  label: 'Relationships',   icon: Network },
  { id: 'documents',      label: 'Documents',       icon: FileText },
  { id: 'activity',       label: 'Activity',        icon: ClipboardList },
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // ── Workflow state ──────────────────────────────────────────────────────────
  const [workflowRun, setWorkflowRun] = useState(null);
  const [workflowLaunching, setWorkflowLaunching] = useState(false);
  const pollingRef = React.useRef(null);

  // Load latest existing run on mount
  useEffect(() => {
    getLatestWorkflowRun(projectId)
      .then(({ data }) => { if (data) setWorkflowRun(data); })
      .catch(() => {});
  }, [projectId]);

  // Poll while run is active
  useEffect(() => {
    const isActive = workflowRun?.status === 'running' || workflowRun?.status === 'pending';
    if (isActive && !pollingRef.current) {
      pollingRef.current = setInterval(async () => {
        try {
          const { data } = await getWorkflowRun(workflowRun.id);
          setWorkflowRun(data);
          if (data.status !== 'running' && data.status !== 'pending') {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        } catch {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }, 2000);
    }
    if (!isActive && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [workflowRun?.id, workflowRun?.status]);

  const handleRunAssessment = async () => {
    setWorkflowLaunching(true);
    try {
      const { data } = await runBoardHealthAssessment(projectId);
      // Immediately fetch the full run object so we have the steps array
      const { data: fullRun } = await getWorkflowRun(data.run_id);
      setWorkflowRun(fullRun);
    } catch (err) {
      console.error('Failed to start workflow:', err);
    } finally {
      setWorkflowLaunching(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await getProject(projectId);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-800 rounded-xl w-1/3" />
            <div className="h-96 bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen bg-slate-950">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-300">Project not found</h2>
          </div>
        </div>
      </div>
    );
  }

  const criticalGaps = project.gaps.filter(g => g.priority === 'critical').length;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top bar ─────────────────────────────────────────────────── */}
        <div className="border-b border-white/8 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
          <div className="px-8 pt-6 pb-0">
            <Link
              to="/projects"
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-200 transition-colors mb-4 text-sm font-medium"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Projects
            </Link>

            <div className="flex items-end justify-between mb-0">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black tracking-tight">
                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {project.client_name}
                    </span>
                  </h1>
                  {project.company_ticker && (
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 rounded-lg tracking-wider">
                      {project.company_ticker}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg border bg-emerald-500/10 text-emerald-400 border-emerald-500/25 uppercase tracking-wide">
                    {project.status}
                  </span>
                  {criticalGaps > 0 && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-lg border bg-red-500/10 text-red-400 border-red-500/25">
                      <AlertCircle className="h-3 w-3" />
                      {criticalGaps} critical gap{criticalGaps > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400">{project.board_name}</p>
              </div>

              {/* Quick stats + Run Assessment CTA */}
              <div className="flex items-center gap-6 pb-1">
                <QuickStat label="Members" value={project.board_members.length} color="blue" />
                <QuickStat label="Gaps" value={project.gaps.length} color="amber" />
                <QuickStat label="Candidates" value={project.candidates.length} color="emerald" />
                <QuickStat
                  label="Target"
                  value={project.target_completion_date
                    ? new Date(project.target_completion_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : '—'}
                  color="violet"
                />
                <div className="border-l border-white/10 pl-6">
                  <RunAssessmentButton
                    run={workflowRun}
                    launching={workflowLaunching}
                    onClick={handleRunAssessment}
                  />
                </div>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-0.5 mt-5 -mb-px">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold transition-all border-b-2 ${
                      isActive
                        ? 'border-indigo-500 text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {tab.id === 'activity' && (
                      <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[9px] font-black border border-amber-500/25">
                        3
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tab content ─────────────────────────────────────────────── */}
        <div className="flex-1 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >

              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Workflow progress panel — shown whenever a run exists */}
                  {workflowRun && (
                    <WorkflowPanel
                      run={workflowRun}
                      clientName={project.client_name}
                    />
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <BoardIntelligenceDashboard projectId={projectId} />
                    </div>
                    <div className="bg-slate-900/80 border border-white/8 rounded-2xl p-5">
                      <WorkQueue projectId={projectId} compact />
                    </div>
                  </div>

                  {/* AI Assistant inline on overview */}
                  <div className="bg-slate-900/80 border border-white/8 rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8">
                      <MessageSquare className="h-4 w-4 text-indigo-400" />
                      <span className="text-sm font-semibold text-white">AI Assistant</span>
                      <span className="text-xs text-slate-500">Ask about gaps, candidates, or strategy</span>
                    </div>
                    <ChatInterface projectId={projectId} />
                  </div>
                </div>
              )}

              {/* Board */}
              {activeTab === 'board' && (
                <BoardMatrix boardMembers={project.board_members} />
              )}

              {/* Gaps */}
              {activeTab === 'gaps' && (
                <div className="space-y-6">
                  <GapSeverityTimeline
                    projectId={project.id}
                    setActiveTab={setActiveTab}
                  />
                  <GapList gaps={project.gaps} />
                </div>
              )}

              {/* Candidates */}
              {activeTab === 'candidates' && (
                <CandidateMatchTab projectId={project.id} />
              )}

              {/* Relationships */}
              {activeTab === 'relationships' && (
                <RelationshipGraph projectId={project.id} />
              )}

              {/* Documents */}
              {activeTab === 'documents' && (
                <DocumentsPanel projectId={projectId} clientName={project.client_name} />
              )}

              {/* Activity */}
              {activeTab === 'activity' && (
                <div className="max-w-3xl">
                  <WorkQueue projectId={projectId} />
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function QuickStat({ label, value, color }) {
  const colors = {
    blue:   'text-blue-400',
    amber:  'text-amber-400',
    emerald:'text-emerald-400',
    violet: 'text-violet-400',
  };
  return (
    <div className="text-right">
      <div className={`text-xl font-black tracking-tight ${colors[color]}`}>{value}</div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
    </div>
  );
}

function GapList({ gaps }) {
  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-400 border-red-500/30',
      high:     'bg-amber-500/10 text-amber-400 border-amber-500/30',
      medium:   'bg-blue-500/10 text-blue-400 border-blue-500/30',
      low:      'bg-slate-500/10 text-slate-400 border-slate-500/30'
    };
    return colors[priority] || colors.medium;
  };

  const getGlowColor = (priority) => {
    if (priority === 'critical') return 'bg-gradient-to-r from-red-500 to-orange-600 opacity-40';
    if (priority === 'high')     return 'bg-gradient-to-r from-amber-500 to-yellow-600 opacity-40';
    return 'bg-gradient-to-r from-blue-500 to-cyan-600 opacity-30';
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">All Gaps</h3>
      {gaps.map((gap, index) => (
        <motion.div
          key={gap.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="relative group"
        >
          <div className={`absolute -inset-[1px] rounded-2xl blur-sm ${getGlowColor(gap.priority)}`} />
          <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-base font-bold text-white">{gap.title}</h3>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getPriorityColor(gap.priority)}`}>
                    {gap.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-300">{gap.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

const DOC_TYPES = [
  { id: 'board_analysis',    name: 'Board Analysis Report',       icon: BarChart3,   category: 'Standard', badge: null,    description: 'Comprehensive board composition and diversity analysis' },
  { id: 'executive_brief',   name: 'Executive Brief',             icon: FileText,    category: 'Standard', badge: null,    description: '1-page summary for managing directors' },
  { id: 'diversity_scorecard',name:'Diversity Scorecard',         icon: Users,       category: 'Standard', badge: null,    description: 'Metrics-focused diversity performance report' },
  { id: 'gap_summary',       name: 'Gap Analysis Summary',        icon: AlertCircle, category: 'Standard', badge: null,    description: 'Strategic gaps and priorities overview' },
  { id: 'candidate_dossier', name: 'Candidate Dossier',           icon: Users,       category: 'Standard', badge: null,    description: 'Detailed profiles of recommended candidates' },
  { id: 'ai_readiness',      name: 'AI Readiness Scorecard',      icon: Brain,       category: 'Power Suite', badge: 'NEW', description: "Audit board's collective AI/ML oversight capability" },
  { id: 'activist_defense',  name: 'Activist Defense Audit',      icon: AlertCircle, category: 'Power Suite', badge: 'HOT', description: 'Vulnerability analysis for proxy fight prevention' },
  { id: 'strategic_alignment',name:'Strategic Alignment Matrix',  icon: TrendingUp,  category: 'Power Suite', badge: 'VC',  description: 'Maps company goals to board skills' },
  { id: 'interlock_map',     name: 'Interlock & Influence Map',   icon: Network,     category: 'Power Suite', badge: 'ALPHA',description:'Network analysis showing board member connections' },
];

const DOC_STATUSES = {
  draft:         { label: 'Draft',        bg: 'bg-slate-500/10',  text: 'text-slate-400',  border: 'border-slate-500/25' },
  under_review:  { label: 'Under Review', bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/25' },
  approved:      { label: 'Approved',     bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/25' },
  sent:          { label: 'Sent',         bg: 'bg-blue-500/10',   text: 'text-blue-400',   border: 'border-blue-500/25' },
  stale:         { label: 'Stale',        bg: 'bg-red-500/10',    text: 'text-red-400',    border: 'border-red-500/25' },
};

const BADGE_COLORS = {
  NEW:   'bg-emerald-500/15 text-emerald-400',
  HOT:   'bg-red-500/15 text-red-400',
  VC:    'bg-indigo-500/15 text-indigo-400',
  ALPHA: 'bg-pink-500/15 text-pink-400',
};

function DocumentsPanel({ projectId, clientName }) {
  const [generating, setGenerating] = useState(null);
  const [docStatuses, setDocStatuses] = useState({});
  const categories = [...new Set(DOC_TYPES.map(d => d.category))];

  useEffect(() => {
    let active = true;

    const loadDeliverables = async () => {
      try {
        const { data } = await getProjectDeliverables(projectId);
        if (!active) return;
        const nextStatuses = {};
        (data.deliverables || []).forEach(deliverable => {
          nextStatuses[deliverable.template_used] = {
            status: deliverable.workflow_status,
            deliverableId: deliverable.id,
          };
        });
        setDocStatuses(nextStatuses);
      } catch (error) {
        console.error('Failed to fetch deliverables:', error);
      }
    };

    loadDeliverables();
    return () => {
      active = false;
    };
  }, [projectId]);

  const handleGenerate = async (doc) => {
    setGenerating(doc.id);
    try {
      const response = await generateProjectReport(
        projectId,
        { type: doc.id },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${clientName.replace(/ /g, '_')}_${doc.id}_${new Date().toISOString().split('T')[0]}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      const { data } = await getProjectDeliverables(projectId);
      const generated = (data.deliverables || []).find(deliverable => deliverable.template_used === doc.id);
      setDocStatuses(prev => ({
        ...prev,
        [doc.id]: {
          status: generated?.workflow_status || 'draft',
          deliverableId: generated?.id,
        }
      }));
    } catch (err) {
      console.error('Generate failed:', err);
    } finally {
      setGenerating(null);
    }
  };

  const handleStatusChange = async (docId, status) => {
    const deliverableMeta = docStatuses[docId];
    if (!deliverableMeta?.deliverableId) return;

    setDocStatuses(prev => ({
      ...prev,
      [docId]: {
        ...prev[docId],
        status,
      }
    }));

    try {
      await updateProjectDeliverableStatus(projectId, deliverableMeta.deliverableId, status);
    } catch (error) {
      console.error('Deliverable status update failed:', error);
    }
  };

  return (
    <div className="space-y-8">
      {categories.map(cat => (
        <div key={cat}>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">{cat}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {DOC_TYPES.filter(d => d.category === cat).map(doc => {
              const Icon = doc.icon;
              const status = docStatuses[doc.id]?.status;
              const statusMeta = status ? DOC_STATUSES[status] : null;
              const isGenerating = generating === doc.id;

              return (
                <div
                  key={doc.id}
                  className="group relative bg-slate-900/80 border border-white/8 rounded-xl p-4 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-slate-800">
                      <Icon className="h-4 w-4 text-slate-300" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {doc.badge && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${BADGE_COLORS[doc.badge]}`}>
                          {doc.badge}
                        </span>
                      )}
                      {statusMeta && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}>
                          {statusMeta.label}
                        </span>
                      )}
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">{doc.name}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{doc.description}</p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGenerate(doc)}
                      disabled={isGenerating}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <><span className="h-3 w-3 border border-white/50 border-t-white rounded-full animate-spin" />Generating…</>
                      ) : (
                        <><FileDown className="h-3 w-3" />Generate</>
                      )}
                    </button>
                    {status && (
                      <select
                        value={status}
                        onChange={e => handleStatusChange(doc.id, e.target.value)}
                        className="px-2 py-1.5 rounded-lg bg-slate-800 border border-white/8 text-xs text-slate-300 focus:outline-none"
                      >
                        {Object.entries(DOC_STATUSES).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Workflow UI Components ─────────────────────────────────────────────────────

function RunAssessmentButton({ run, launching, onClick }) {
  const isActive = run?.status === 'running' || run?.status === 'pending';
  const isComplete = run?.status === 'complete';
  const isFailed = run?.status === 'failed';

  if (launching || isActive) {
    return (
      <button
        disabled
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/50 border border-indigo-500/30 text-white text-sm font-semibold cursor-not-allowed"
      >
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        {launching ? 'Launching…' : 'Running Assessment…'}
      </button>
    );
  }

  if (isComplete) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold hover:bg-emerald-600/30 transition-colors"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        Re-run Assessment
      </button>
    );
  }

  if (isFailed) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-600/30 transition-colors"
      >
        <XCircle className="h-3.5 w-3.5" />
        Retry Assessment
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
    >
      <Zap className="h-3.5 w-3.5" />
      Run Board Health Assessment
    </button>
  );
}

const STEP_LABELS = {
  build_context:      'Loading Project Data',
  compute_bri:        'Computing BRI Score',
  match_candidates:   'Matching Candidates',
  generate_documents: 'Generating Documents',
  assemble_results:   'Assembling Results',
};

function WorkflowPanel({ run, clientName }) {
  const [collapsed, setCollapsed] = useState(false);

  const isActive = run.status === 'running' || run.status === 'pending';
  const isComplete = run.status === 'complete';
  const isFailed = run.status === 'failed';

  const elapsedSec = run.started_at
    ? Math.round(
        (new Date(run.completed_at || new Date()).getTime() -
          new Date(run.started_at).getTime()) /
          1000
      )
    : 0;

  const artifactCount = (run.output_artifacts || []).length;
  const artifactNames = (run.output_artifacts || []).map(p =>
    p.split('/').pop()?.replace('.docx', '').replace(/_/g, ' ')
  );

  const statusColor = isComplete
    ? 'from-emerald-500/20 to-cyan-500/10 border-emerald-500/25'
    : isFailed
    ? 'from-red-500/20 to-rose-500/10 border-red-500/25'
    : 'from-indigo-500/20 to-purple-500/10 border-indigo-500/25';

  const statusLabel = isComplete ? 'Complete' : isFailed ? 'Failed' : 'Running';
  const statusTextColor = isComplete ? 'text-emerald-400' : isFailed ? 'text-red-400' : 'text-indigo-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-gradient-to-r ${statusColor} border rounded-2xl overflow-hidden`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <div className="flex items-center gap-3">
          {isActive && <Loader2 className="h-4 w-4 text-indigo-400 animate-spin flex-shrink-0" />}
          {isComplete && <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />}
          {isFailed && <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />}
          <span className="text-sm font-bold text-white">Board Health Assessment</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${statusTextColor}`}>
            {statusLabel}
          </span>
          {elapsedSec > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {elapsedSec}s
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          {/* Step checklist */}
          <div className="grid grid-cols-5 gap-2">
            {(run.steps || []).map(step => {
              const isDone = step.status === 'complete';
              const isRunning = step.status === 'running';
              const hasFailed = step.status === 'failed';
              return (
                <div
                  key={step.name}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-colors ${
                    isDone
                      ? 'bg-emerald-500/10 border-emerald-500/20'
                      : isRunning
                      ? 'bg-indigo-500/10 border-indigo-500/30 animate-pulse'
                      : hasFailed
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-white/3 border-white/8'
                  }`}
                >
                  {isDone && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                  {isRunning && <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin" />}
                  {hasFailed && <XCircle className="h-3.5 w-3.5 text-red-400" />}
                  {step.status === 'pending' && (
                    <div className="h-3.5 w-3.5 rounded-full border border-slate-600" />
                  )}
                  <span className={`text-[10px] font-semibold text-center leading-tight ${
                    isDone ? 'text-emerald-300' : isRunning ? 'text-indigo-300' : hasFailed ? 'text-red-300' : 'text-slate-500'
                  }`}>
                    {STEP_LABELS[step.name] || step.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Results summary — shown on completion */}
          {isComplete && (
            <div className="border-t border-white/8 pt-4">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <ResultStat
                  label="BoardReady Index"
                  value={run.bri_score != null ? `${run.bri_score.toFixed(1)}` : '—'}
                  sub="/ 100"
                  highlight
                />
                <ResultStat
                  label="Gaps Analysed"
                  value={run.gap_count ?? '—'}
                />
                <ResultStat
                  label="Candidate Matches"
                  value={run.match_count ?? '—'}
                />
              </div>

              {artifactCount > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    {artifactCount} Document{artifactCount !== 1 ? 's' : ''} Generated
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {artifactNames.map(name => (
                      <span
                        key={name}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-slate-800 border border-white/8 text-slate-300 rounded-lg capitalize"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Use the Documents tab to download individual reports.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error detail — shown on failure */}
          {isFailed && run.error && (
            <div className="border-t border-white/8 pt-4">
              <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Error</p>
              <p className="text-xs text-red-300 font-mono bg-red-500/5 border border-red-500/15 rounded-lg px-3 py-2">
                {run.error}
              </p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ResultStat({ label, value, sub, highlight }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 text-center">
      <div className={`text-2xl font-black tracking-tight ${highlight ? 'bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent' : 'text-white'}`}>
        {value}
        {sub && <span className="text-sm font-normal text-slate-500 ml-0.5">{sub}</span>}
      </div>
      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">{label}</div>
    </div>
  );
}

function calculateGenderPercentage(members) {
  if (!members || members.length === 0) return 0;
  const female = members.filter(m =>
    m.matrix_data?.demographics?.gender === 'Female'
  ).length;
  return Math.round((female / members.length) * 100);
}

function calculateRacialDiversity(members) {
  if (!members || members.length === 0) return 0;
  const diverse = members.filter(m =>
    m.matrix_data?.demographics?.race_ethnicity !== 'Caucasian'
  ).length;
  return Math.round((diverse / members.length) * 100);
}
