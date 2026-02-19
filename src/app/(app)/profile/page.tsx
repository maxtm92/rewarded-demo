import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/utils';
import SignOutButton from '@/components/auth/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    include: { surveyResponse: true },
  });

  const completionItems = [
    { label: 'Account created', done: true },
    { label: 'Email verified', done: !!user.emailVerified },
    { label: 'Profile survey', done: user.onboardingDone },
    { label: 'First offer completed', done: user.lifetimeCents > (user.onboardingDone ? 500 : 0) },
    { label: 'Phone verified', done: !!user.phone },
  ];

  const completedCount = completionItems.filter((i) => i.done).length;
  const completionPercent = Math.round((completedCount / completionItems.length) * 100);

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {/* User Info */}
      <div className="p-6 rounded-2xl bg-[#151929] border border-white/5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-2xl font-bold">
            {(user.name || user.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user.name || 'User'}</p>
            <p className="text-gray-400 text-sm">{user.email || user.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
          <div>
            <p className="text-gray-400 text-xs">Balance</p>
            <p className="font-semibold text-emerald-400">{formatCurrency(user.balanceCents)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Lifetime</p>
            <p className="font-semibold">{formatCurrency(user.lifetimeCents)}</p>
          </div>
        </div>
      </div>

      {/* Profile Completion */}
      <div className="p-6 rounded-2xl bg-[#151929] border border-white/5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Profile Completion</h2>
          <span className="text-sm text-emerald-400 font-semibold">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="space-y-3">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className={`text-sm ${item.done ? 'text-emerald-400' : 'text-gray-600'}`}>
                {item.done ? '✓' : '○'}
              </span>
              <span className={`text-sm ${item.done ? 'text-gray-300' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Survey Answers */}
      {user.surveyResponse && (
        <div className="p-6 rounded-2xl bg-[#151929] border border-white/5 mb-6">
          <h2 className="font-semibold mb-4">Survey Data</h2>
          <div className="space-y-2 text-sm">
            {user.surveyResponse.ageRange && (
              <div className="flex justify-between">
                <span className="text-gray-400">Age</span>
                <span>{user.surveyResponse.ageRange}</span>
              </div>
            )}
            {user.surveyResponse.gender && (
              <div className="flex justify-between">
                <span className="text-gray-400">Gender</span>
                <span className="capitalize">{user.surveyResponse.gender}</span>
              </div>
            )}
            {user.surveyResponse.interests.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-400">Interests</span>
                <span className="capitalize">{user.surveyResponse.interests.join(', ')}</span>
              </div>
            )}
            {user.surveyResponse.country && (
              <div className="flex justify-between">
                <span className="text-gray-400">Country</span>
                <span>{user.surveyResponse.country}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <SignOutButton />
    </div>
  );
}
