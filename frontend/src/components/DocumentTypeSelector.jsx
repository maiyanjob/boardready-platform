import { useState } from 'react';
import { FileDown, Loader, CheckCircle, FileText, Users, Target, Award, Briefcase, ChevronDown, Brain, Shield, TrendingUp, Network } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const DOCUMENT_TYPES = [
  {
    id: 'board_analysis',
    name: 'Board Analysis Report',
    description: 'Comprehensive board composition and diversity analysis',
    icon: FileText,
    color: 'cyan',
    category: 'Standard Reports'
  },
  {
    id: 'executive_brief',
    name: 'Executive Brief',
    description: '1-page summary for managing directors',
    icon: Briefcase,
    color: 'blue',
    category: 'Standard Reports'
  },
  {
    id: 'diversity_scorecard',
    name: 'Diversity Scorecard',
    description: 'Metrics-focused diversity performance report',
    icon: Award,
    color: 'emerald',
    category: 'Standard Reports'
  },
  {
    id: 'gap_summary',
    name: 'Gap Analysis Summary',
    description: 'Strategic gaps and priorities overview',
    icon: Target,
    color: 'amber',
    category: 'Standard Reports'
  },
  {
    id: 'candidate_dossier',
    name: 'Candidate Dossier',
    description: 'Detailed profiles of recommended candidates',
    icon: Users,
    color: 'purple',
    category: 'Standard Reports'
  },
  {
    id: 'ai_readiness',
    name: 'AI Readiness Scorecard',
    description: 'Audit board\'s collective AI/ML oversight capability (2026 Trend)',
    icon: Brain,
    color: 'violet',
    category: 'Power Suite',
    badge: 'NEW'
  },
  {
    id: 'activist_defense',
    name: 'Activist Defense Audit',
    description: 'Vulnerability analysis for proxy fight prevention',
    icon: Shield,
    color: 'red',
    category: 'Power Suite',
    badge: 'HOT'
  },
  {
    id: 'strategic_alignment',
    name: 'Strategic Alignment Matrix',
    description: 'Maps company goals to board skills (Goal-to-Skill Bridge)',
    icon: TrendingUp,
    color: 'indigo',
    category: 'Power Suite',
    badge: 'VC'
  },
  {
    id: 'interlock_map',
    name: 'Interlock & Influence Map',
    description: 'Network analysis showing board member connections',
    icon: Network,
    color: 'pink',
    category: 'Power Suite',
    badge: 'ALPHA'
  }
];

export default function DocumentTypeSelector({ projectId, clientName }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedType, setSelectedType] = useState(DOCUMENT_TYPES[0]);

  const handleDownload = async (docType) => {
    setLoading(true);
    setSuccess(false);
    setIsOpen(false);

    try {
      const response = await axios.post(
        `http://localhost:5000/api/projects/${projectId}/generate-report`,
        { type: docType.id },
        {
          withCredentials: true,
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${clientName.replace(/ /g, '_')}_${docType.id}_${new Date().toISOString().split('T')[0]}.docx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      setSelectedType(docType);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [...new Set(DOCUMENT_TYPES.map(d => d.category))];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => !loading && setIsOpen(!isOpen)}
        disabled={loading}
        className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 ${
          success
            ? 'bg-emerald-500 text-white'
            : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:shadow-lg hover:shadow-cyan-500/50'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-5 w-5" />
            <span>Downloaded!</span>
          </>
        ) : (
          <>
            <FileDown className="h-5 w-5" />
            <span>Download Report</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-[420px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-slate-700 bg-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Select Document Type</p>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {categories.map(category => (
                <div key={category}>
                  <div className="px-4 py-2 bg-slate-850 border-b border-slate-800">
                    <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">{category}</p>
                  </div>
                  {DOCUMENT_TYPES.filter(d => d.category === category).map((docType) => {
                    const Icon = docType.icon;
                    return (
                      <button
                        key={docType.id}
                        onClick={() => handleDownload(docType)}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-800 transition-colors border-b border-slate-800/50 last:border-0"
                      >
                        <div className={`p-2 rounded-lg bg-${docType.color}-500/10 flex-shrink-0`}>
                          <Icon className={`h-5 w-5 text-${docType.color}-400`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-sm">{docType.name}</span>
                            {docType.badge && (
                              <span className={`px-1.5 py-0.5 text-[10px] font-black rounded ${
                                docType.badge === 'NEW' ? 'bg-emerald-500/20 text-emerald-400' :
                                docType.badge === 'HOT' ? 'bg-red-500/20 text-red-400' :
                                docType.badge === 'VC' ? 'bg-indigo-500/20 text-indigo-400' :
                                'bg-pink-500/20 text-pink-400'
                              }`}>
                                {docType.badge}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{docType.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
