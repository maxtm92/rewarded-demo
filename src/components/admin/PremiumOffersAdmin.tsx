'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import ConfirmDialog from './ConfirmDialog';

interface Offer {
  id: string;
  slug: string;
  name: string;
  headline: string;
  description: string;
  payoutCents: number;
  category: string;
  externalUrl: string;
  isActive: boolean;
  icon: string;
  angleId: string | null;
  _count: { completions: number };
}

interface Angle {
  id: string;
  name: string;
  headline: string;
}

const emptyForm = {
  slug: '', name: '', headline: '', description: '', payoutCents: '',
  category: 'auto_insurance', externalUrl: '', icon: '🚗', angleId: '',
};

export default function PremiumOffersAdmin({ initialOffers, angles }: { initialOffers: Offer[]; angles: Angle[] }) {
  const router = useRouter();
  const [offers, setOffers] = useState(initialOffers);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  function handleEdit(offer: Offer) {
    setEditingId(offer.id);
    setShowForm(true);
    setForm({
      slug: offer.slug,
      name: offer.name,
      headline: offer.headline,
      description: offer.description,
      payoutCents: String(offer.payoutCents),
      category: offer.category,
      externalUrl: offer.externalUrl,
      icon: offer.icon,
      angleId: offer.angleId || '',
    });
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      payoutCents: parseInt(form.payoutCents),
      angleId: form.angleId || null,
    };

    const res = await fetch('/api/admin/offers', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingId ? { id: editingId, ...payload } : payload),
    });

    if (res.ok) {
      toast.success(editingId ? 'Offer updated' : 'Offer created');
      handleCancel();
      router.refresh();
    } else {
      toast.error('Failed to save');
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch('/api/admin/offers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success('Offer deleted');
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error(data.error || 'Failed to delete');
      setDeleteId(null);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch('/api/admin/offers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, isActive: !isActive } : o)));
  }

  return (
    <div>
      <button
        onClick={() => showForm ? handleCancel() : setShowForm(true)}
        className="mb-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm transition"
      >
        {showForm ? 'Cancel' : '+ Add Offer'}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-[#151929] border border-white/5 mb-6 grid grid-cols-2 gap-4">
          {(['slug', 'name', 'headline', 'description', 'payoutCents', 'category', 'externalUrl', 'icon'] as const).map((field) => (
            <div key={field} className={field === 'description' ? 'col-span-2' : ''}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required={['slug', 'name', 'headline', 'description', 'payoutCents', 'externalUrl'].includes(field)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0E1A] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          ))}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Marketing Angle</label>
            <select
              value={form.angleId}
              onChange={(e) => setForm((f) => ({ ...f, angleId: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0E1A] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="">None</option>
              {angles.map((a) => (
                <option key={a.id} value={a.id}>{a.name} — {a.headline}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm">
              {editingId ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">Offer</th>
              <th className="text-left p-3 text-gray-400 font-medium">Category</th>
              <th className="text-right p-3 text-gray-400 font-medium">Payout</th>
              <th className="text-center p-3 text-gray-400 font-medium">Completions</th>
              <th className="text-center p-3 text-gray-400 font-medium">Active</th>
              <th className="text-center p-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="border-b border-white/5 last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{offer.icon}</span>
                    <div>
                      <p className="font-medium">{offer.name}</p>
                      <p className="text-gray-500 text-xs">{offer.headline}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-gray-400 capitalize">{offer.category.replace('_', ' ')}</td>
                <td className="p-3 text-right font-medium text-amber-400">{formatCurrency(offer.payoutCents)}</td>
                <td className="p-3 text-center">{offer._count.completions}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleActive(offer.id, offer.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      offer.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {offer.isActive ? 'Active' : 'Off'}
                  </button>
                </td>
                <td className="p-3 text-center">
                  <div className="flex gap-1 justify-center">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(offer.id)}
                      className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs hover:bg-red-500/20 transition"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteId}
        title="Delete Offer"
        description="Are you sure you want to delete this offer? This cannot be undone. If it has completions, deactivate it instead."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
