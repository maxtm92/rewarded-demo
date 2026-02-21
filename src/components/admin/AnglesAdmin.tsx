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
        className="mb-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm transition"
      >
        {showForm ? 'Cancel' : '+ Add Angle'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-[#151929] border border-white/5 mb-6 grid grid-cols-2 gap-4">
          {(['slug', 'name', 'headline', 'subheadline', 'ctaText', 'weight'] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required={['slug', 'name', 'headline', 'ctaText'].includes(field)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0E1A] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          ))}
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm">
              {editingId ? 'Update Angle' : 'Create Angle'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">Headline</th>
              <th className="text-left p-3 text-gray-400 font-medium">CTA</th>
              <th className="text-center p-3 text-gray-400 font-medium">Weight</th>
              <th className="text-center p-3 text-gray-400 font-medium">Impressions</th>
              <th className="text-center p-3 text-gray-400 font-medium">Clicks</th>
              <th className="text-center p-3 text-gray-400 font-medium">CTR</th>
              <th className="text-center p-3 text-gray-400 font-medium">Conv.</th>
              <th className="text-center p-3 text-gray-400 font-medium">Active</th>
              <th className="text-center p-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {angles.map((angle) => {
              const ctr = angle.impressions > 0 ? ((angle.clicks / angle.impressions) * 100).toFixed(1) : '0.0';
              const convRate = angle.clicks > 0 ? ((angle.conversions / angle.clicks) * 100).toFixed(1) : '0.0';
              return (
                <tr key={angle.id} className="border-b border-white/5 last:border-0">
                  <td className="p-3 font-medium">{angle.headline}</td>
                  <td className="p-3 text-gray-400">{angle.ctaText}</td>
                  <td className="p-3 text-center">{angle.weight}</td>
                  <td className="p-3 text-center">{angle.impressions.toLocaleString()}</td>
                  <td className="p-3 text-center">{angle.clicks.toLocaleString()}</td>
                  <td className="p-3 text-center text-amber-400">{ctr}%</td>
                  <td className="p-3 text-center text-emerald-400">{convRate}%</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => toggleActive(angle.id, angle.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        angle.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {angle.isActive ? 'Active' : 'Off'}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => handleEdit(angle)}
                        className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition">
                        Edit
                      </button>
                      <button onClick={() => setResetId(angle.id)}
                        className="px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20 transition">
                        Reset
                      </button>
                      <button onClick={() => setDeleteId(angle.id)}
                        className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition">
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
