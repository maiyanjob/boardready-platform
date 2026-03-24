export function SkeletonLoader({ count = 3 }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="h-8 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl animate-shimmer" />
          <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl animate-shimmer" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-6 animate-pulse">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-16 w-16 rounded-xl bg-slate-800 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-800 rounded-lg w-2/3" />
          <div className="h-4 bg-slate-800 rounded-lg w-1/2" />
          <div className="h-4 bg-slate-800 rounded-lg w-1/3" />
        </div>
        <div className="h-9 w-24 bg-slate-800 rounded-xl" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-slate-800 rounded-lg" />
        <div className="h-4 bg-slate-800 rounded-lg w-5/6" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-7 w-24 bg-slate-800 rounded-lg" />
        <div className="h-7 w-24 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
