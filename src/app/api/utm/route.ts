import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { utm_source, utm_medium, utm_campaign, utm_term, utm_content, landing_url, referrer } = body;

  if (!utm_source && !utm_medium && !utm_campaign) {
    return NextResponse.json({ error: 'No UTM params' }, { status: 400 });
  }

  // Avoid duplicate captures for same user + source combo
  const existing = await prisma.utmCapture.findFirst({
    where: {
      userId: session.user.id,
      source: utm_source || null,
      medium: utm_medium || null,
      campaign: utm_campaign || null,
    },
  });

  if (existing) {
    return NextResponse.json({ success: true, message: 'Already captured' });
  }

  await prisma.utmCapture.create({
    data: {
      userId: session.user.id,
      source: utm_source || null,
      medium: utm_medium || null,
      campaign: utm_campaign || null,
      term: utm_term || null,
      content: utm_content || null,
      landingUrl: landing_url || null,
      referrer: referrer || null,
    },
  });

  return NextResponse.json({ success: true });
}
