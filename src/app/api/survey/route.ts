import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const surveySchema = z.object({
  ageRange: z.string().optional(),
  gender: z.string().optional(),
  interests: z.array(z.string()).default([]),
  income: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
});

const SIGNUP_BONUS_CENTS = 500; // $5.00

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data = surveySchema.parse(body);

  // Atomic: create survey + credit bonus + mark onboarding done
  await prisma.$transaction(async (tx) => {
    // Check if already completed
    const existing = await tx.surveyResponse.findUnique({
      where: { userId: session.user.id },
    });
    if (existing?.bonusCredited) {
      throw new Error('Survey already completed');
    }

    // Create or update survey response
    await tx.surveyResponse.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        ...data,
        completedAt: new Date(),
        bonusCredited: true,
      },
      update: {
        ...data,
        completedAt: new Date(),
        bonusCredited: true,
      },
    });

    // Get current balance for the transaction record
    const user = await tx.user.findUniqueOrThrow({ where: { id: session.user.id } });
    const newBalance = user.balanceCents + SIGNUP_BONUS_CENTS;

    // Credit signup bonus
    await tx.transaction.create({
      data: {
        userId: session.user.id,
        type: 'BONUS',
        amountCents: SIGNUP_BONUS_CENTS,
        balanceAfterCents: newBalance,
        source: 'signup_bonus',
        description: 'Welcome bonus for completing your profile',
        status: 'COMPLETED',
      },
    });

    // Update user balance and onboarding status
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        balanceCents: { increment: SIGNUP_BONUS_CENTS },
        lifetimeCents: { increment: SIGNUP_BONUS_CENTS },
        onboardingDone: true,
      },
    });
  });

  return NextResponse.json({ success: true, bonusCents: SIGNUP_BONUS_CENTS });
}
