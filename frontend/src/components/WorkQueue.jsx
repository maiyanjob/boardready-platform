import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, FileText, Users, Database, Network,
  CheckCircle2, ChevronRight, Clock, Loader2
} from 'lucide-react';
import { getProjectWorkQueue } from '../lib/api';

const CATEGORY_META = {
  docs: { icon: FileText, iconClass: 'text-amber-400', iconBgClass: 'bg-amber-500/10', actionClass: 'text-amber-400 hover:text-amber-300', label: 'Documents' },
  board: { icon: Database, iconClass: 'text-red-400', iconBgClass: 'bg-red-500/10', actionClass: 'text-red-400 hover:text-red-300', label: 'Board Data' },
  candidates: { icon: Users, iconClass: 'text-violet-400', iconBgClass: 'bg-violet-500/10', actionClass: 'text-violet-400 hover:text-violet-300', label: 'Candidates' },
  matches: { icon: CheckCircle2, iconClass: 'text-cyan-400', iconBgClass: 'bg-cyan-500/10', actionClass: 'text-cyan-400 hover:text-cyan-300', label: 'Matches' },
  relationships: { icon: Network, iconClass: 'text-pink-400', iconBgClass: 'bg-pink-500/10', actionClass: 'text-pink-400 hover:text-pink-300', label: 'Relationships' },
};

const PRIORITY_META = {
  high: { label: 'High', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/25' },
  medium: { label: 'Medium', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/25' },
  low: { label: 'Low', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/25' },
};

export default function WorkQueue({ projectId, compact = false }) {
  const [dismissed, setDismissed] = useState(new Set());
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadQueue = async () => {
      if (!projectId) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data } = await getProjectWorkQueue(projectId);
        if (active) {
          setItems(data.items || []);
        }
      } catch (error) {
        console.error('WorkQueue fetch error:', error);
        if (active) {
          setItems([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadQueue();
    return () => {
      active = false;
    };
  }, [projectId]);

  const visibleItems = useMemo(() => items.filter(item => !dismissed.has(item.id)), [dismissed, items]);
  const filtered = filter === 'all' ? visibleItems : visibleItems.filter(item => item.priority === filter);
  const highCount = visibleItems.filter(item => item.priority === 'high').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Needs Attention
              {highCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/25 text-red-400 text-[10px] font-black">
                  {highCount} urgent
                </span>
              )}
            </h3>
            {!compact && (
              <p className="text-xs text-slate-500">{filtered.length} items pending action</p>
            )}
          </div>
        </div>

        {!compact && (
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 border border-white/8 rounded-lg">
            {['all', 'high', 'medium', 'low'].map(option => (
              <button
                key={option}
                onClick={() => setFilter(option)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  filter === option ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading workflow queue…</span>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {filtered.slice(0, compact ? 3 : undefined).map((item, index) => {
            const cat = CATEGORY_META[item.category] || CATEGORY_META.docs;
            const pri = PRIORITY_META[item.priority] || PRIORITY_META.medium;
            const CatIcon = cat.icon;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                className="group relative"
              >
                <div className="relative bg-slate-900/80 backdrop-blur-sm border border-white/8 rounded-xl p-4 hover:border-white/15 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`flex-shrink-0 p-1.5 rounded-lg ${cat.iconBgClass}`}>
                      <CatIcon className={`h-3.5 w-3.5 ${cat.iconClass}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-white leading-snug">{item.title}</span>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wide ${pri.bg} ${pri.text} ${pri.border}`}>
                          {pri.label}
                        </span>
                      </div>

                      {!compact && (
                        <p className="text-xs text-slate-400 leading-relaxed mb-2">{item.detail}</p>
                      )}

                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-1 text-slate-600">
                          <Clock className="h-3 w-3" />
                          <span className="text-[10px] font-medium">{item.age} old</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDismissed(prev => new Set([...prev, item.id]))}
                            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                          >
                            Dismiss
                          </button>
                          <button className={`flex items-center gap-1 text-xs font-semibold transition-colors ${cat.actionClass}`}>
                            {item.action}
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500/50" />
          <p className="text-sm font-semibold text-slate-400">All clear — nothing needs attention</p>
        </div>
      )}

      {!loading && compact && visibleItems.length > 3 && (
        <p className="text-xs text-slate-500 text-center">
          +{visibleItems.length - 3} more items
        </p>
      )}
    </div>
  );
}
