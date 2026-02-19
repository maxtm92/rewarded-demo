import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const offer = await prisma.premiumOffer.create({
    data: {
      slug: body.slug,
      name: body.name,
      headline: body.headline,
      description: body.description,
      payoutCents: body.payoutCents,
      category: body.category,
      externalUrl: body.externalUrl,
      icon: body.icon || '💰',
      angleId: body.angleId || null,
    },
  });
  return NextResponse.json(offer);
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, ...data } = await request.json();
  const offer = await prisma.premiumOffer.update({ where: { id }, data });
  return NextResponse.json(offer);
}
