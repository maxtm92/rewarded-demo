import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return null;
  }
  return session;
}

// GET - List all offerwalls
export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const walls = await prisma.offerWall.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { postbacks: true } } },
  });
  return NextResponse.json(walls);
}

// POST - Create offerwall
export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const wall = await prisma.offerWall.create({
    data: {
      slug: body.slug,
      name: body.name,
      description: body.description || null,
      icon: body.icon || '💰',
      logoUrl: body.logoUrl || null,
      iframeUrl: body.iframeUrl || null,
      redirectUrl: body.redirectUrl || null,
      postbackSecret: body.postbackSecret,
      payoutMultiplier: body.payoutMultiplier ?? 1.0,
      sortOrder: body.sortOrder ?? 0,
      bonusText: body.bonusText || null,
      bonusDetail: body.bonusDetail || null,
      section: body.section || 'games',
      isFeatured: body.isFeatured ?? false,
    },
  });
  return NextResponse.json(wall);
}

// PATCH - Update offerwall
export async function PATCH(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { id, ...data } = body;

  // Ensure only one featured wall at a time
  if (data.isFeatured === true) {
    await prisma.offerWall.updateMany({
      where: { isFeatured: true, id: { not: id } },
      data: { isFeatured: false },
    });
  }

  const wall = await prisma.offerWall.update({
    where: { id },
    data,
  });
  return NextResponse.json(wall);
}

// DELETE - Delete offerwall
export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await request.json();
  await prisma.offerWall.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
