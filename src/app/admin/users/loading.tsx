import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton';

export default function UsersLoading() {
  return (
    <div>
      <div className="h-8 w-32 bg-[#2f3043] rounded mb-6 animate-pulse" />
      <div className="h-10 w-full max-w-md bg-[#2f3043] rounded-lg mb-4 animate-pulse" />
      <AdminTableSkeleton rows={10} columns={6} />
    </div>
  );
}
