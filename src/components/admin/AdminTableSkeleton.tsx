export default function AdminTableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="rounded-xl bg-[#151929] border border-white/5 overflow-hidden animate-pulse">
      <div className="border-b border-white/5 p-3 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3 bg-[#2f3043] rounded flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-b border-white/5 last:border-0 p-3 flex gap-4">
          {Array.from({ length: columns }).map((_, c) => (
            <div key={c} className="h-3 bg-[#2f3043]/50 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
