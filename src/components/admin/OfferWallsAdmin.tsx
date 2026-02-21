'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
  _count: { postbacks: number };
}

interface Props {
  initialWalls: OfferWallRow[];
}

const emptyForm = {
  slug: '', name: '', description: '', icon: '💰', logoUrl: '', iframeUrl: '', redirectUrl: '',
  postbackSecret: '', payoutMultiplier: '1.0', sortOrder: '0',
};

const formFields = ['slug', 'name', 'description', 'icon', 'logoUrl', 'iframeUrl', 'redirectUrl', 'postbackSecret', 'payoutMultiplier', 'sortOrder'] as const;
const requiredFields = ['slug', 'name', 'postbackSecret'];

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
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setWalls((prev) => prev.map((w) => (w.id === editing ? { ...w, ...updated } : w)));
      toast.success('Offerwall updated');
      cancelEdit();
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
        className="mb-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm transition"
      >
        {showAdd ? 'Cancel' : '+ Add Offerwall'}
      </button>

      {/* Add / Edit Form */}
      {isFormOpen && (
        <form
          onSubmit={formMode === 'edit' ? handleEdit : handleAdd}
          className="p-6 rounded-xl bg-[#151929] border border-white/5 mb-6"
        >
          <h3 className="text-sm font-semibold text-gray-300 mb-4">
            {formMode === 'edit' ? `Editing: ${form.name}` : 'New Offerwall'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {formFields.map((field) => (
              <div key={field}>
                <label className="text-xs text-gray-400 mb-1 block capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                <input
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={requiredFields.includes(field)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0E1A] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm">
              {formMode === 'edit' ? 'Save Changes' : 'Create Offerwall'}
            </button>
            {formMode === 'edit' && (
              <button type="button" onClick={cancelEdit} className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 font-medium text-sm text-gray-400">
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      {/* Table */}
      <div className="rounded-xl bg-[#151929] border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left p-3 text-gray-400 font-medium">Icon</th>
              <th className="text-left p-3 text-gray-400 font-medium">Name</th>
              <th className="text-left p-3 text-gray-400 font-medium">Slug</th>
              <th className="text-center p-3 text-gray-400 font-medium">Postbacks</th>
              <th className="text-center p-3 text-gray-400 font-medium">Multiplier</th>
              <th className="text-center p-3 text-gray-400 font-medium">Active</th>
              <th className="text-center p-3 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {walls.map((wall) => (
              <tr key={wall.id} className={`border-b border-white/5 last:border-0 ${editing === wall.id ? 'bg-emerald-500/5' : ''}`}>
                <td className="p-3 text-xl">{wall.icon}</td>
                <td className="p-3 font-medium">{wall.name}</td>
                <td className="p-3 text-gray-400">{wall.slug}</td>
                <td className="p-3 text-center">{wall._count.postbacks}</td>
                <td className="p-3 text-center">{wall.payoutMultiplier}x</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => toggleActive(wall.id, wall.isActive)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      wall.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {wall.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-3 text-center space-x-2">
                  <button
                    onClick={() => startEdit(wall)}
                    className={`text-xs ${editing === wall.id ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(wall.id, wall.name)}
                    className="text-xs text-gray-400 hover:text-red-400"
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
