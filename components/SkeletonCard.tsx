export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-[24px] border border-slate-800 bg-slate-900/80 p-4">
      <div className="h-4 w-3/4 rounded-full bg-slate-800" />
      <div className="mt-3 h-3 w-1/2 rounded-full bg-slate-800" />
      <div className="mt-5 space-y-2">
        <div className="h-3 rounded-full bg-slate-800" />
        <div className="h-3 w-5/6 rounded-full bg-slate-800" />
        <div className="h-3 w-4/6 rounded-full bg-slate-800" />
      </div>
    </div>
  );
}
