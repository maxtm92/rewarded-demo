import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendWithdrawalStatusEmail } from '@/lib/email';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, status, rejectionReason } = await request.json();

  const result = await prisma.$transaction(async (tx) => {
    const withdrawal = await tx.withdrawal.findUniqueOrThrow({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'PROCESSING') {
      throw new Error('Withdrawal cannot be updated');
    }

    const updateData: Record<string, unknown> = { status };
    const now = new Date();

    if (status === 'PROCESSING') {
      updateData.processedAt = now;
      // Estimate completion: PayPal=2h, Crypto=15m, Gift Card=24h
      const estimateMs: Record<string, number> = { PAYPAL: 2 * 3600000, CRYPTO: 900000, GIFT_CARD: 86400000 };
      updateData.estimatedCompletionAt = new Date(now.getTime() + (estimateMs[withdrawal.method] || 86400000));
    } else if (status === 'COMPLETED') {
      updateData.completedAt = now;
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = now;
      if (rejectionReason) updateData.rejectionReason = rejectionReason;
    }

    await tx.withdrawal.update({
      where: { id },
      data: updateData,
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
          description: `Withdrawal rejected${rejectionReason ? ` — ${rejectionReason}` : ''} — refunded`,
          status: 'COMPLETED',
        },
      });

      await tx.user.update({
        where: { id: withdrawal.userId },
        data: { balanceCents: { increment: withdrawal.amountCents } },
      });
    }

    return withdrawal;
  });

  // Send email notification (fire-and-forget)
  if ((status === 'COMPLETED' || status === 'REJECTED') && result.user.email) {
    sendWithdrawalStatusEmail(
      result.user.email,
      result.user.name,
      result.amountCents,
      status,
      result.method,
      status === 'REJECTED' ? rejectionReason : undefined
    ).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
