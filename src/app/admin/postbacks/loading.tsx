import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton';

export default function Loading() {
  return (
    <div>
      <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="h-10 w-80 bg-gray-100 rounded-lg mb-4 animate-pulse" />
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
      <AdminTableSkeleton rows={10} columns={7} />
    </div>
  );
}
