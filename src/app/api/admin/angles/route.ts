import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const angles = await prisma.marketingAngle.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(angles);
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await request.json();
  const angle = await prisma.marketingAngle.create({
    data: {
      slug: body.slug,
      name: body.name,
      headline: body.headline,
      subheadline: body.subheadline || null,
      ctaText: body.ctaText,
      weight: body.weight ?? 1,
    },
  });
  return NextResponse.json(angle);
}

export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { id, ...data } = await request.json();
  const angle = await prisma.marketingAngle.update({ where: { id }, data });
  return NextResponse.json(angle);
}
