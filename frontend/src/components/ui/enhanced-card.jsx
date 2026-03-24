import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function EnhancedCard({
  children,
  className,
  gradient = 'primary',
  delay = 0,
  ...props
}) {
  const gradients = {
    primary: 'from-cyan-500 via-blue-500 to-purple-600',
    success: 'from-emerald-500 to-cyan-600',
    warning: 'from-amber-500 to-orange-600',
    subtle: 'from-slate-600 to-slate-700',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="group relative"
      {...props}
    >
      {/* Animated gradient border glow */}
      <div
        className={cn(
          'absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500',
          `bg-gradient-to-r ${gradients[gradient]}`
        )}
      />

      {/* Card content */}
      <div
        className={cn(
          'relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6',
          'shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-300',
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
