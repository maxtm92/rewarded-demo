import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const withdrawSchema = z.object({
  method: z.enum(['PAYPAL', 'VENMO', 'GOOGLE_PLAY', 'AMAZON', 'APPLE', 'VISA', 'BANK', 'BTC', 'LTC', 'SOL', 'DOGE']),
  amountCents: z.number().int().min(500),
  destination: z.string().min(1, 'Destination is required'),
});

// POST - Request withdrawal
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data = withdrawSchema.parse(body);

  // Rate limiting: max 3 withdrawals per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.withdrawal.count({
    where: {
      userId: session.user.id,
      createdAt: { gte: oneHourAgo },
    },
  });
  if (recentCount >= 3) {
    return NextResponse.json(
      { error: 'Too many withdrawal requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '3600' } }
    );
  }

  // Atomic withdrawal
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: session.user.id },
      });

      if (user.balanceCents < data.amountCents) {
        throw new Error('Insufficient balance');
      }

      const newBalance = user.balanceCents - data.amountCents;

      // Create withdrawal record
      await tx.withdrawal.create({
        data: {
          userId: session.user.id,
          amountCents: data.amountCents,
          method: data.method,
          destination: data.destination,
          status: 'PENDING',
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: 'WITHDRAWAL',
          amountCents: data.amountCents,
          balanceAfterCents: newBalance,
          source: 'withdrawal',
          description: `${data.method} withdrawal to ${data.destination}`,
          status: 'COMPLETED',
        },
      });

      // Deduct balance
      await tx.user.update({
        where: { id: session.user.id },
        data: { balanceCents: { decrement: data.amountCents } },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Withdrawal failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// GET - Fetch balance and recent transactions
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [user, transactions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: { balanceCents: true, lifetimeCents: true },
    }),
    prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return NextResponse.json({ ...user, transactions });
}
