import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [user, referrals, totalEarned] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { referralCode: true },
    }),
    prisma.user.findMany({
      where: { referredById: session.user.id },
      select: { id: true, name: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.referralEarning.aggregate({
      where: { referrerId: session.user.id },
      _sum: { amountCents: true },
    }),
  ]);

  // Get per-referral earnings
  const referralEarnings = await prisma.referralEarning.groupBy({
    by: ['referredUserId'],
    where: { referrerId: session.user.id },
    _sum: { amountCents: true },
  });

  const earningsMap = new Map(referralEarnings.map(r => [r.referredUserId, r._sum.amountCents ?? 0]));

  const referralList = referrals.map(r => ({
    name: r.name ? `${r.name.split(' ')[0]} ${(r.name.split(' ')[1] || '')[0] || ''}.`.trim() : 'User',
    joinedAt: r.createdAt.toISOString(),
    earnedCents: earningsMap.get(r.id) ?? 0,
  }));

  return NextResponse.json({
    referralCode: user.referralCode,
    referralLink: `${process.env.NEXTAUTH_URL || 'https://easytaskcash.com'}/?ref=${user.referralCode}`,
    totalReferred: referrals.length,
    totalEarnedCents: totalEarned._sum.amountCents ?? 0,
    referrals: referralList,
  });
}
