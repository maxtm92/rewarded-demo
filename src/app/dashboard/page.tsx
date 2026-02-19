export default function DashboardPage() {
  // TODO: Replace with real user data from database
  const mockUser = {
    username: 'demo_user',
    balance: 4250,
    totalEarned: 12800,
  };

  const mockTransactions = [
    { id: '1', source: 'Freecash', amount: 500, type: 'earn', date: '2026-02-19' },
    { id: '2', source: 'Fluent Survey', amount: 200, type: 'earn', date: '2026-02-18' },
    { id: '3', source: 'PayPal Withdrawal', amount: -5000, type: 'withdraw', date: '2026-02-17' },
    { id: '4', source: 'Auto Insurance', amount: 1500, type: 'earn', date: '2026-02-16' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="p-6 rounded-xl bg-gray-800 border border-gray-700">
            <p className="text-gray-400 text-sm">Current Balance</p>
            <p className="text-3xl font-bold text-emerald-400">{mockUser.balance.toLocaleString()} pts</p>
          </div>
          <div className="p-6 rounded-xl bg-gray-800 border border-gray-700">
            <p className="text-gray-400 text-sm">Total Earned</p>
            <p className="text-3xl font-bold">{mockUser.totalEarned.toLocaleString()} pts</p>
          </div>
          <div className="p-6 rounded-xl bg-gray-800 border border-gray-700">
            <p className="text-gray-400 text-sm">Cash Value</p>
            <p className="text-3xl font-bold">${(mockUser.balance / 1000).toFixed(2)}</p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-xl bg-gray-800 border border-gray-700 overflow-hidden">
          {mockTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 border-b border-gray-700 last:border-0">
              <div>
                <p className="font-medium">{tx.source}</p>
                <p className="text-gray-400 text-sm">{tx.date}</p>
              </div>
              <p className={`font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} pts
              </p>
            </div>
          ))}
        </div>

        <button className="mt-8 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition">
          Withdraw Funds
        </button>
      </div>
    </div>
  );
}
