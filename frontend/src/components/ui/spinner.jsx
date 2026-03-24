export function Spinner({ size = 'md', label }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 gap-4">
      <div className="relative">
        <div className={`${sizes[size]} border-4 border-blue-500/20 rounded-full`} />
        <div
          className={`absolute inset-0 ${sizes[size]} border-4 border-transparent border-t-cyan-400 border-r-blue-500 rounded-full animate-spin`}
        />
      </div>
      {label && <p className="text-sm font-medium text-slate-400">{label}</p>}
    </div>
  );
}
