import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const eventSchema = z.object({
  event: z.string().min(1).max(50),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data = eventSchema.parse(body);

  await prisma.funnelEvent.create({
    data: {
      userId: session.user.id,
      event: data.event,
      metadata: (data.metadata ?? null) as never,
    },
  });

  return NextResponse.json({ ok: true });
}
