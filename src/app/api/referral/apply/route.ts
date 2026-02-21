import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { referralCode } = await request.json();
  if (!referralCode || typeof referralCode !== 'string') {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 400 });
  }

  // Check if already referred
  const currentUser = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { referredById: true, referralCode: true },
  });

  if (currentUser.referredById) {
    return NextResponse.json({ error: 'Already referred' }, { status: 409 });
  }

  // No self-referral
  if (currentUser.referralCode === referralCode.toUpperCase()) {
    return NextResponse.json({ error: 'Cannot use your own referral code' }, { status: 400 });
  }

  // Find referrer
  const referrer = await prisma.user.findUnique({
    where: { referralCode: referralCode.toUpperCase() },
    select: { id: true },
  });

  if (!referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { referredById: referrer.id },
  });

  return NextResponse.json({ success: true });
}
