import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">💰 RewardedDemo</h1>
        <div className="flex gap-4">
          <Link href="/earn" className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
            Earn
          </Link>
          <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition">
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Earn Rewards for <span className="text-emerald-400">Doing What You Love</span>
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Complete surveys, play games, get insurance quotes, and more. 
          Cash out via PayPal, gift cards, or crypto.
        </p>
        <Link
          href="/earn"
          className="inline-block px-8 py-4 text-lg font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 transition"
        >
          Start Earning →
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-20">
          {[
            { icon: '🎮', title: 'Play Games', desc: 'Freecash & Playful offers' },
            { icon: '📋', title: 'Take Surveys', desc: 'Fluent survey wall' },
            { icon: '🚗', title: 'Insurance Quotes', desc: 'High-paying auto offers' },
            { icon: '💸', title: 'Cash Out', desc: 'PayPal, gift cards, crypto' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-xl bg-gray-800/50 border border-gray-700">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
