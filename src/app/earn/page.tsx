import { offerWalls } from '@/lib/offer-walls';

export default function EarnPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Earn Points</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offerWalls.filter(w => w.active).map((wall) => (
            <div
              key={wall.id}
              className="p-6 rounded-xl bg-gray-800 border border-gray-700 hover:border-emerald-500 transition cursor-pointer"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{wall.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold">{wall.name}</h2>
                  <p className="text-gray-400 text-sm">{wall.description}</p>
                </div>
              </div>
              <button className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-semibold transition">
                Start Earning
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
