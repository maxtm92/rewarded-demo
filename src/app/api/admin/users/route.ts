import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, action, amountCents, reason } = await request.json();

  if (!userId || !action) {
    return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (action === 'ban') {
    await prisma.user.update({ where: { id: userId }, data: { isBanned: true } });
    return NextResponse.json({ success: true, message: 'User banned' });
  }

  if (action === 'unban') {
    await prisma.user.update({ where: { id: userId }, data: { isBanned: false } });
    return NextResponse.json({ success: true, message: 'User unbanned' });
  }

  if (action === 'adjust') {
    if (!amountCents || typeof amountCents !== 'number' || !reason) {
      return NextResponse.json({ error: 'amountCents (number) and reason (string) required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const newBalance = user.balanceCents + amountCents;

      await tx.transaction.create({
        data: {
          userId,
          type: 'ADJUSTMENT',
          amountCents,
          balanceAfterCents: Math.max(newBalance, 0),
          source: 'admin_adjustment',
          description: `Admin adjustment: ${reason}`,
          status: 'COMPLETED',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          balanceCents: Math.max(newBalance, 0),
          ...(amountCents > 0 ? { lifetimeCents: { increment: amountCents } } : {}),
        },
      });
    });

    return NextResponse.json({ success: true, message: `Adjusted ${amountCents}c` });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
