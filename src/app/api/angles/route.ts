import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Track click on marketing angle
export async function POST(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const action = request.nextUrl.searchParams.get('action');

  if (!id || action !== 'click') {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
  }

  await prisma.marketingAngle.update({
    where: { id },
    data: { clicks: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
