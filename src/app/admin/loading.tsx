import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton';

export default function AdminLoading() {
  return (
    <div>
      <div className="h-8 w-48 bg-[#2f3043] rounded mb-6 animate-pulse" />

      <div className="flex gap-2 mb-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-16 bg-[#2f3043] rounded-lg animate-pulse" />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-[#151929] border border-white/5 animate-pulse">
            <div className="h-3 w-20 bg-[#2f3043] rounded mb-3" />
            <div className="h-6 w-24 bg-[#2f3043] rounded" />
          </div>
        ))}
      </div>

      <div className="h-6 w-40 bg-[#2f3043] rounded mb-4 animate-pulse" />
      <AdminTableSkeleton rows={5} columns={5} />
    </div>
  );
}
