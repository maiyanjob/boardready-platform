import { motion, AnimatePresence } from 'framer-motion';
import { Loader, CheckCircle, Database, Search, Calculator } from 'lucide-react';

export default function ThinkingSteps({ steps, isComplete }) {
  
  const getIcon = (step) => {
    if (step.includes('search')) return Search;
    if (step.includes('calculate')) return Calculator;
    if (step.includes('database')) return Database;
    return Loader;
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Loader className="h-4 w-4 text-cyan-400 animate-spin" />
        <span className="text-sm font-semibold text-cyan-400">AI Agent Working...</span>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {steps.map((step, index) => {
            const Icon = getIcon(step);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 text-sm"
              >
                <Icon className="h-3 w-3 text-blue-400" />
                <span className="text-slate-300">{step}</span>
                {isComplete && <CheckCircle className="h-3 w-3 text-emerald-400 ml-auto" />}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
