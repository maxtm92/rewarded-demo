'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface OfferWallRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
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

export default function OfferWallsAdmin({ initialWalls }: Props) {
  const router = useRouter();
  const [walls, setWalls] = useState(initialWalls);
  const [editing, setEditing] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    slug: '', name: '', description: '', icon: '💰', iframeUrl: '', redirectUrl: '',
    postbackSecret: '', payoutMultiplier: '1.0', sortOrder: '0',
  });

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
      setForm({ slug: '', name: '', description: '', icon: '💰', iframeUrl: '', redirectUrl: '', postbackSecret: '', payoutMultiplier: '1.0', sortOrder: '0' });
      router.refresh();
    }
  }

  return (
    <div>
      {/* Add Button */}
      <button
        onClick={() => setShowAdd(!showAdd)}
        className="mb-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm transition"
      >
        {showAdd ? 'Cancel' : '+ Add Offerwall'}
      </button>

      {/* Add Form */}
      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 rounded-xl bg-[#151929] border border-white/5 mb-6 grid grid-cols-2 gap-4">
          {(['slug', 'name', 'description', 'icon', 'iframeUrl', 'redirectUrl', 'postbackSecret', 'payoutMultiplier', 'sortOrder'] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-gray-400 mb-1 block capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
              <input
                value={form[field]}
                onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                required={['slug', 'name', 'postbackSecret'].includes(field)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0E1A] border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          ))}
          <div className="col-span-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm">
              Create Offerwall
            </button>
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
              <tr key={wall.id} className="border-b border-white/5 last:border-0">
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
                <td className="p-3 text-center">
                  <button className="text-gray-400 hover:text-white text-xs">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
