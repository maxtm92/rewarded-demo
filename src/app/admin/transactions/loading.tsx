import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton';

export default function TransactionsLoading() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-40 bg-[#2f3043] rounded animate-pulse" />
        <div className="h-8 w-24 bg-[#2f3043] rounded-lg animate-pulse" />
      </div>
      <div className="h-10 w-full max-w-md bg-[#2f3043] rounded-lg mb-4 animate-pulse" />
      <div className="flex gap-4 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-1">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="h-7 w-16 bg-[#2f3043] rounded-lg animate-pulse" />
            ))}
          </div>
        ))}
      </div>
      <AdminTableSkeleton rows={10} columns={7} />
    </div>
  );
}
