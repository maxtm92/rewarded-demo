import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const type = request.nextUrl.searchParams.get('type');

  if (type === 'users') {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, phone: true, name: true,
        balanceCents: true, lifetimeCents: true, role: true, isBanned: true,
        onboardingDone: true, createdAt: true,
      },
    });

    const header = 'id,email,phone,name,balanceCents,lifetimeCents,role,isBanned,onboardingDone,createdAt';
    const rows = users.map((u) =>
      [u.id, u.email || '', u.phone || '', `"${(u.name || '').replace(/"/g, '""')}"`,
       u.balanceCents, u.lifetimeCents, u.role, u.isBanned, u.onboardingDone,
       u.createdAt.toISOString()].join(',')
    );
    const csv = [header, ...rows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=users.csv',
      },
    });
  }

  if (type === 'transactions') {
    const dateRange = request.nextUrl.searchParams.get('dateRange');
    const txType = request.nextUrl.searchParams.get('txType');
    const txStatus = request.nextUrl.searchParams.get('txStatus');

    const where: Record<string, unknown> = {};
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      const start = new Date(now);
      if (dateRange === 'today') {
        start.setHours(0, 0, 0, 0);
      } else if (dateRange === '7d') {
        start.setDate(start.getDate() - 7);
      } else if (dateRange === '30d') {
        start.setDate(start.getDate() - 30);
      }
      where.createdAt = { gte: start };
    }
    if (txType && txType !== 'ALL') where.type = txType;
    if (txStatus && txStatus !== 'ALL') where.status = txStatus;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000,
      select: {
        id: true, userId: true, type: true, amountCents: true,
        balanceAfterCents: true, source: true, description: true,
        status: true, createdAt: true,
      },
    });

    const header = 'id,userId,type,amountCents,balanceAfterCents,source,description,status,createdAt';
    const rows = transactions.map((t) =>
      [t.id, t.userId, t.type, t.amountCents, t.balanceAfterCents,
       t.source || '', `"${(t.description || '').replace(/"/g, '""')}"`,
       t.status, t.createdAt.toISOString()].join(',')
    );
    const csv = [header, ...rows].join('\n');

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=transactions.csv',
      },
    });
  }

  return NextResponse.json({ error: 'Invalid type. Use ?type=users or ?type=transactions' }, { status: 400 });
}
