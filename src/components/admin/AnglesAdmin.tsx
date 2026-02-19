'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

export default function AnglesAdmin({ initialAngles }: { initialAngles: Angle[] }) {
  const router = useRouter();
  const [angles, setAngles] = useState(initialAngles);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    slug: '', name: '', headline: '', subheadline: '', ctaText: 'Get Started', weight: '1',
  });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/angles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, weight: parseInt(form.weight) }),
    });
    if (res.ok) {
      toast.success('Angle created');
      setShowAdd(false);
      setForm({ slug: '', name: '', headline: '', subheadline: '', ctaText: 'Get Started', weight: '1' });
      router.refresh();
    }
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
        onClick={() => setShowAdd(!showAdd)}
        className="mb-4 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-medium text-sm transition"
      >
        {showAdd ? 'Cancel' : '+ Add Angle'}
      </button>

      {showAdd && (
        <form onSubmit={handleAdd} className="p-6 rounded-xl bg-[#151929] border border-white/5 mb-6 grid grid-cols-2 gap-4">
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
              Create Angle
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
