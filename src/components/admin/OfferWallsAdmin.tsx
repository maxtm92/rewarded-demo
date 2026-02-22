'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import FeaturedWallCard from '@/components/earn/cards/FeaturedWallCard';
import WallCard from '@/components/earn/cards/WallCard';

interface OfferWallRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  icon: string;
  isActive: boolean;
  iframeUrl: string | null;
  redirectUrl: string | null;
  postbackSecret: string;
  payoutMultiplier: number;
  sortOrder: number;
  bonusText: string | null;
  bonusDetail: string | null;
  section: string;
  isFeatured: boolean;
  _count: { postbacks: number };
}

interface Props {
  initialWalls: OfferWallRow[];
}

const emptyForm = {
  slug: '', name: '', description: '', icon: '💰', logoUrl: '', iframeUrl: '', redirectUrl: '',
  postbackSecret: '', payoutMultiplier: '1.0', sortOrder: '0',
  bonusText: '', bonusDetail: '', section: 'games', isFeatured: false,
};

export default function OfferWallsAdmin({ initialWalls }: Props) {
  const router = useRouter();
  const [walls, setWalls] = useState(initialWalls);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function startEdit(wall: OfferWallRow) {
    setShowAdd(false);
    setEditing(wall.id);
    setForm({
      slug: wall.slug,
      name: wall.name,
      description: wall.description || '',
      icon: wall.icon,
      logoUrl: wall.logoUrl || '',
      iframeUrl: wall.iframeUrl || '',
      redirectUrl: wall.redirectUrl || '',
      postbackSecret: wall.postbackSecret,
      payoutMultiplier: String(wall.payoutMultiplier),
      sortOrder: String(wall.sortOrder),
      bonusText: wall.bonusText || '',
      bonusDetail: wall.bonusDetail || '',
      section: wall.section || 'games',
      isFeatured: wall.isFeatured || false,
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(emptyForm);
  }

  function startAdd() {
    setEditing(null);
    setForm(emptyForm);
    setShowAdd(!showAdd);
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch('/api/admin/offerwalls', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) {
      setWalls((prev) => prev.map((w) => (w.id === id ? { ...w, isActive: !isActive } : w)));
      toast.success(`Offerwall ${!isActive ? 'enabled' : 'disabled'}`);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/offerwalls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        payoutMultiplier: parseFloat(form.payoutMultiplier),
        sortOrder: parseInt(form.sortOrder),
        bonusText: form.bonusText || null,
        bonusDetail: form.bonusDetail || null,
      }),
    });
    if (res.ok) {
      toast.success('Offerwall created');
      setShowAdd(false);
      setForm(emptyForm);
      router.refresh();
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const res = await fetch('/api/admin/offerwalls', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editing,
        slug: form.slug,
        name: form.name,
        description: form.description || null,
        icon: form.icon,
        logoUrl: form.logoUrl || null,
        iframeUrl: form.iframeUrl || null,
        redirectUrl: form.redirectUrl || null,
        postbackSecret: form.postbackSecret,
        payoutMultiplier: parseFloat(form.payoutMultiplier),
        sortOrder: parseInt(form.sortOrder),
        bonusText: form.bonusText || null,
        bonusDetail: form.bonusDetail || null,
        section: form.section,
        isFeatured: form.isFeatured,
      }),
    });
    if (res.ok) {
      toast.success('Offerwall updated');
      cancelEdit();
      router.refresh();
    } else {
      toast.error('Failed to update offerwall');
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch('/api/admin/offerwalls', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setWalls((prev) => prev.filter((w) => w.id !== id));
      toast.success('Offerwall deleted');
    } else {
      toast.error('Failed to delete offerwall');
    }
  }

  const isFormOpen = showAdd || editing;
  const formMode = editing ? 'edit' : 'add';

  return (
    <div>
      {/* Add Button */}
      <button
        onClick={startAdd}
        className="mb-4 px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium text-sm transition"
      >
        {showAdd ? 'Cancel' : '+ Add Offerwall'}
      </button>

      {/* Add / Edit Form */}
      {isFormOpen && (
        <form
          onSubmit={formMode === 'edit' ? handleEdit : handleAdd}
          className="p-6 rounded-lg bg-white border border-gray-200 shadow-sm mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {formMode === 'edit' ? `Editing: ${form.name}` : 'New Offerwall'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {(['slug', 'name', 'description', 'icon', 'logoUrl', 'iframeUrl', 'redirectUrl', 'postbackSecret', 'payoutMultiplier', 'sortOrder'] as const).map((field) => (
              <div key={field}>
                <label className="text-xs text-gray-500 mb-1 block capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={['slug', 'name', 'postbackSecret'].includes(field)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}

            {/* Earn Page Fields */}
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bonus Text (e.g. $10)</label>
              <input
                value={form.bonusText}
                onChange={(e) => setForm((f) => ({ ...f, bonusText: e.target.value }))}
                placeholder="$5"
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bonus Detail</label>
              <input
                value={form.bonusDetail}
                onChange={(e) => setForm((f) => ({ ...f, bonusDetail: e.target.value }))}
                placeholder="Must complete one game to claim"
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Section</label>
              <select
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="games">Games</option>
                <option value="surveys">Surveys</option>
              </select>
            </div>
            <div className="flex items-center gap-3 self-end pb-2">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                <span className="ml-2 text-xs text-gray-500">Featured on Earn Page</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium text-sm transition">
              {formMode === 'edit' ? 'Save Changes' : 'Create Offerwall'}
            </button>
            {formMode === 'edit' && (
              <button type="button" onClick={cancelEdit} className="px-6 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 font-medium text-sm text-gray-600 transition">
                Cancel
              </button>
            )}
          </div>

          {/* Live Preview */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Live Preview</p>
            <div className="rounded-2xl bg-[#0f1020] p-6">
              {form.isFeatured ? (
                <FeaturedWallCard
                  name={form.name || 'Offerwall Name'}
                  icon={form.icon || '💰'}
                  logoUrl={form.logoUrl || null}
                  bonusText={form.bonusText || null}
                  bonusDetail={form.bonusDetail || null}
                />
              ) : (
                <div className="max-w-md">
                  <WallCard
                    name={form.name || 'Offerwall Name'}
                    icon={form.icon || '💰'}
                    logoUrl={form.logoUrl || null}
                    bonusText={form.bonusText || null}
                    bonusDetail={form.bonusDetail || null}
                    section={form.section as 'games' | 'surveys'}
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="rounded-lg bg-white border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Icon</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Name</th>
              <th className="text-left p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Section</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Bonus</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Postbacks</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Multiplier</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Status</th>
              <th className="text-center p-3 text-gray-500 text-xs font-medium uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {walls.map((wall) => (
              <tr key={wall.id} className={`border-b border-gray-100 last:border-0 ${editing === wall.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                <td className="p-3 text-xl">{wall.icon}</td>
                <td className="p-3">
                  <p className="font-medium text-gray-900">{wall.name}</p>
                  <p className="text-gray-400 text-xs">{wall.slug}</p>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">{wall.section}</span>
                  {wall.isFeatured && (
                    <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">Featured</span>
                  )}
                </td>
                <td className="p-3 text-center text-gray-600 text-xs">{wall.bonusText || '—'}</td>
                <td className="p-3 text-center text-gray-900">{wall._count.postbacks}</td>
                <td className="p-3 text-center text-gray-900">{wall.payoutMultiplier}x</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleActive(wall.id, wall.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      wall.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {wall.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => startEdit(wall)}
                    className={`text-xs transition ${editing === wall.id ? 'text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wall.id, wall.name)}
                    className="text-xs text-gray-500 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
