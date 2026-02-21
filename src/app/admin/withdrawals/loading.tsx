import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton';

export default function WithdrawalsLoading() {
  return (
    <div>
      <div className="h-8 w-40 bg-[#2f3043] rounded mb-6 animate-pulse" />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-20 bg-[#2f3043] rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="h-10 w-full max-w-md bg-[#2f3043] rounded-lg mb-4 animate-pulse" />
      <AdminTableSkeleton rows={10} columns={7} />
    </div>
  );
}
