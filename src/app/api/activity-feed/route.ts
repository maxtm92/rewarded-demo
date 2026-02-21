import { NextResponse } from 'next/server';
import { generateActivityItems } from '@/lib/activity-feed';

export async function GET() {
  const items = generateActivityItems(20);

  return NextResponse.json(items, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
