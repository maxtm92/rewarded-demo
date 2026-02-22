'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from './ConfirmDialog';

interface Angle {
  id: string;
  slug: string;
  name: string;
  headline: string;
  subheadline: string | null;
  ctaText: string;
  isActive: boolean;
  weight: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

const emptyForm = {
  slug: '', name: '', headline: '', subheadline: '', ctaText: 'Get Started', weight: '1',
};

export default function AnglesAdmin({ initialAngles }: { initialAngles: Angle[] }) {
  const router = useRouter();
  const [angles, setAngles] = useState(initialAngles);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetId, setResetId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function handleEdit(angle: Angle) {
    setEditingId(angle.id);
    setShowForm(true);
    setForm({
      slug: angle.slug,
      name: angle.name,
      headline: angle.headline,
      subheadline: angle.subheadline || '',
      ctaText: angle.ctaText,
      weight: String(angle.weight),
    });
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, weight: parseInt(form.weight) };

    const res = await fetch('/api/admin/angles', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });

    if (res.ok) {
      toast.success(editingId ? 'Angle updated' : 'Angle created');
      handleCancel();
      router.refresh();
    } else {
      toast.error('Failed to save');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch('/api/admin/angles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Angle deleted');
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error(data.error || 'Failed to delete');
      setDeleteId(null);
    }
  }

  async function handleResetStats() {
    if (!resetId) return;
    await fetch('/api/admin/angles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resetId, resetStats: true }),
    });
    toast.success('Stats reset');
    setResetId(null);
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch('/api/admin/angles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setAngles((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a)));
  }

  return (
    <div>
      <button
        onClick={() => showForm ? handleCancel() : setShowForm(true)}
        className="mb-4 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium text-sm transition"
      >
        {showForm ? 'Cancel' : '+ Add Angle'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm mb-6 grid grid-cols-2 gap-4">
          {(['slug', 'name', 'headline', 'subheadline', 'ctaText', 'weight'] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-gray-500 mb-1 block capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required={['slug', 'name', 'headline', 'ctaText'].includes(field)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium text-sm transition">
              {editingId ? 'Update Angle' : 'Create Angle'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Headline</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">CTA</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Weight</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Impressions</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Clicks</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">CTR</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Conv.</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Active</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {angles.map((angle) => {
              const ctr = angle.impressions > 0 ? ((angle.clicks / angle.impressions) * 100).toFixed(1) : '0.0';
              const convRate = angle.clicks > 0 ? ((angle.conversions / angle.clicks) * 100).toFixed(1) : '0.0';
              return (
                <tr key={angle.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900">{angle.headline}</td>
                  <td className="p-3 text-gray-500">{angle.ctaText}</td>
                  <td className="p-3 text-center text-gray-900">{angle.weight}</td>
                  <td className="p-3 text-center text-gray-900">{angle.impressions.toLocaleString()}</td>
                  <td className="p-3 text-center text-gray-900">{angle.clicks.toLocaleString()}</td>
                  <td className="p-3 text-center text-amber-600 font-medium">{ctr}%</td>
                  <td className="p-3 text-center text-emerald-600 font-medium">{convRate}%</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleActive(angle.id, angle.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        angle.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {angle.isActive ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => handleEdit(angle)}
                        className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs hover:bg-blue-100 transition">
                        Edit
                      </button>
                      <button onClick={() => setResetId(angle.id)}
                        className="px-2 py-1 rounded bg-amber-50 text-amber-700 text-xs hover:bg-amber-100 transition">
                        Reset
                      </button>
                      <button onClick={() => setDeleteId(angle.id)}
                        className="px-2 py-1 rounded bg-red-50 text-red-700 text-xs hover:bg-red-100 transition">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Angle"
        description="Are you sure you want to delete this angle? This cannot be undone."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        open={!!resetId}
        title="Reset Stats"
        description="This will zero out impressions, clicks, and conversions for this angle. Useful for restarting A/B tests."
        confirmLabel="Reset Stats"
        confirmVariant="danger"
        onConfirm={handleResetStats}
        onCancel={() => setResetId(null)}
      />
    </div>
  );
}
