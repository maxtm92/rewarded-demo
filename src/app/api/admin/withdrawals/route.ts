import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, status } = await request.json();

  await prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUniqueOrThrow({ where: { id } });

    if (withdrawal.status !== 'PENDING') {
      throw new Error('Withdrawal is not pending');
    }

    await tx.withdrawal.update({
      where: { id },
      data: { status },
    });

    // If rejected, refund the user
    if (status === 'REJECTED') {
      const user = await tx.user.findUniqueOrThrow({ where: { id: withdrawal.userId } });
      const newBalance = user.balanceCents + withdrawal.amountCents;

      await tx.transaction.create({
        data: {
          userId: withdrawal.userId,
          type: 'ADJUSTMENT',
          amountCents: withdrawal.amountCents,
          balanceAfterCents: newBalance,
          source: 'withdrawal_refund',
          description: `Withdrawal rejected — refunded`,
          status: 'COMPLETED',
        },
      });

      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { balanceCents: { increment: withdrawal.amountCents } },
      });
    }
  });

  return NextResponse.json({ success: true });
}
