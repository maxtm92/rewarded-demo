import EverflowDashboard from '@/components/admin/EverflowDashboard';

export const dynamic = 'force-dynamic';

export default function EverflowPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Everflow Integration</h1>
      </div>
      <EverflowDashboard />
    </div>
  );
}
