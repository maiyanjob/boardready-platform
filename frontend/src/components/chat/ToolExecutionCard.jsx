import { motion } from 'framer-motion';
import { Database, Calculator, Search, CheckCircle, TrendingUp } from 'lucide-react';

export default function ToolExecutionCard({ toolCall }) {
  const getIcon = (toolName) => {
    if (toolName.includes('calculate')) return Calculator;
    if (toolName.includes('search')) return Search;
    if (toolName.includes('diversity')) return TrendingUp;
    return Database;
  };

  const getColor = (toolName) => {
    if (toolName.includes('calculate')) return 'cyan';
    if (toolName.includes('search')) return 'purple';
    if (toolName.includes('diversity')) return 'emerald';
    return 'blue';
  };

  const Icon = getIcon(toolCall.name);
  const color = getColor(toolCall.name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-${color}-500/10 border border-${color}-500/30 rounded-lg p-3 mb-3`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-${color}-500/20 rounded-lg`}>
          <Icon className={`h-4 w-4 text-${color}-400`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-semibold text-${color}-300`}>
              {formatToolName(toolCall.name)}
            </span>
            <CheckCircle className={`h-3 w-3 text-${color}-400`} />
          </div>
          <div className="text-xs text-slate-400">
            {formatToolResult(toolCall.result)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function formatToolName(name) {
  return name
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatToolResult(result) {
  if (result.total_members) {
    return `Analyzed ${result.total_members} board members`;
  }
  if (result.candidates) {
    return `Found ${result.candidates.length} matching candidates`;
  }
  if (result.gaps) {
    return `Identified ${result.total_gaps} gaps`;
  }
  return 'Execution complete';
}
