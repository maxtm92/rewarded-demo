import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  listOffers,
  listAffiliates,
  listPixels,
  createPixel,
} from '@/lib/everflow';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'ADMIN') return null;
  return session;
}

/* ── GET — Dashboard data ─────────────────────────── */

export async function GET() {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!process.env.EVERFLOW_API_KEY) {
    return NextResponse.json({ error: 'EVERFLOW_API_KEY not configured' }, { status: 500 });
  }

  try {
    const [offers, affiliates, pixels, localWalls] = await Promise.all([
      listOffers(),
      listAffiliates(),
      listPixels(),
      prisma.offerWall.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          slug: true,
          name: true,
          isActive: true,
          everflowOfferId: true,
          everflowAffId: true,
          everflowOfferName: true,
          everflowStatus: true,
          everflowPayoutType: true,
          everflowLastSyncAt: true,
        },
      }),
    ]);

    // Compute sync status for each Everflow offer
    const syncedOffers = offers.map((o) => {
      const linkedWall = localWalls.find(
        (w) => w.everflowOfferId === String(o.network_offer_id),
      );
      let syncStatus: 'linked' | 'unlinked' | 'drifted' = 'unlinked';
      if (linkedWall) {
        const isDrifted =
          linkedWall.isActive && (o.offer_status === 'paused' || o.offer_status === 'deleted');
        syncStatus = isDrifted ? 'drifted' : 'linked';
      }
      return {
        ...o,
        syncStatus,
        localWall: linkedWall || null,
      };
    });

    return NextResponse.json({
      offers: syncedOffers,
      affiliates,
      pixels,
      localWalls,
      apiConfigured: true,
    });
  } catch (err) {
    console.error('[Admin Everflow] Failed to fetch data:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch Everflow data' },
      { status: 500 },
    );
  }
}

/* ── POST — Actions ───────────────────────────────── */

export async function POST(request: NextRequest) {
  if (!(await requireAdmin()))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  if (!process.env.EVERFLOW_API_KEY) {
    return NextResponse.json({ error: 'EVERFLOW_API_KEY not configured' }, { status: 500 });
  }

  const body = await request.json();

  switch (body.action) {
    case 'sync-offers':
      return handleSyncOffers();
    case 'configure-postback':
      return handleConfigurePostback(body);
    case 'link-offer':
      return handleLinkOffer(body);
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }
}

/* ── Sync Offers ──────────────────────────────────── */

async function handleSyncOffers() {
  try {
    const offers = await listOffers();
    const localWalls = await prisma.offerWall.findMany({
      where: { everflowOfferId: { not: null } },
    });

    let synced = 0;
    const unmatched: typeof offers = [];
    const drifted: Array<{ wallSlug: string; issue: string }> = [];

    for (const offer of offers) {
      const wall = localWalls.find(
        (w) => w.everflowOfferId === String(offer.network_offer_id),
      );

      if (!wall) {
        unmatched.push(offer);
        continue;
      }

      // Update local wall with Everflow data
      await prisma.offerWall.update({
        where: { id: wall.id },
        data: {
          everflowOfferName: offer.name,
          everflowStatus: offer.offer_status,
          everflowPayoutType: offer.payout_type,
          everflowDestUrl: offer.destination_url,
          everflowLastSyncAt: new Date(),
        },
      });
      synced++;

      // Check for drift
      if (wall.isActive && (offer.offer_status === 'paused' || offer.offer_status === 'deleted')) {
        drifted.push({
          wallSlug: wall.slug,
          issue: `Wall is active locally but Everflow offer is ${offer.offer_status}`,
        });
      }
    }

    return NextResponse.json({ synced, unmatched, drifted });
  } catch (err) {
    console.error('[Admin Everflow] Sync failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Sync failed' },
      { status: 500 },
    );
  }
}

/* ── Configure Postback ───────────────────────────── */

async function handleConfigurePostback(body: { appUrl?: string }) {
  const appUrl = body.appUrl;
  if (!appUrl) {
    return NextResponse.json({ error: 'appUrl is required' }, { status: 400 });
  }

  const secret = process.env.EVERFLOW_POSTBACK_SECRET || '';

  // Check if a pixel with our URL already exists
  const existingPixels = await listPixels();
  const alreadyExists = existingPixels.find((p) =>
    p.postback_url.includes('/api/postback/everflow'),
  );

  if (alreadyExists) {
    return NextResponse.json({
      message: 'Postback pixel already exists',
      pixel: alreadyExists,
      alreadyExists: true,
    });
  }

  // Build postback URL with Everflow macros
  const postbackUrl = [
    `${appUrl}/api/postback/everflow`,
    `?security_token=${secret}`,
    '&sub1={sub1}',
    '&transaction_id={transaction_id}',
    '&payout={payout_amount}',
    '&offer_id={offer_id}',
    '&affiliate_id={affiliate_id}',
  ].join('');

  try {
    const pixel = await createPixel({
      postbackUrl,
      description: 'EasyTaskCash conversion postback',
    });

    return NextResponse.json({ message: 'Postback pixel created', pixel, alreadyExists: false });
  } catch (err) {
    console.error('[Admin Everflow] Create pixel failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create pixel' },
      { status: 500 },
    );
  }
}

/* ── Link Offer to OfferWall ──────────────────────── */

async function handleLinkOffer(body: { everflowOfferId?: number; offerWallId?: string }) {
  const { everflowOfferId, offerWallId } = body;
  if (!everflowOfferId || !offerWallId) {
    return NextResponse.json(
      { error: 'everflowOfferId and offerWallId are required' },
      { status: 400 },
    );
  }

  try {
    const wall = await prisma.offerWall.update({
      where: { id: offerWallId },
      data: { everflowOfferId: String(everflowOfferId) },
    });

    return NextResponse.json({ message: 'Offer linked', wall });
  } catch (err) {
    console.error('[Admin Everflow] Link offer failed:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to link offer' },
      { status: 500 },
    );
  }
}
