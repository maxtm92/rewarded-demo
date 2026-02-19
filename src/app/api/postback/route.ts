import { NextRequest, NextResponse } from 'next/server';

// Generic postback handler for offer wall callbacks
// Each offer wall sends a server-to-server callback when a user completes an offer
// This endpoint validates the callback and credits the user

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const userId = params.get('user_id');
  const amount = params.get('amount');
  const offerId = params.get('offer_id');
  const source = params.get('source'); // freecash, playful, auto-insurance, fluent
  const signature = params.get('sig');

  if (!userId || !amount || !source) {
    return NextResponse.json({ error: 'Missing required params' }, { status: 400 });
  }

  // TODO: Validate signature per offer wall
  // TODO: Check for duplicate postbacks (idempotency)
  // TODO: Credit user balance in database
  // TODO: Log transaction

  console.log(`[Postback] User ${userId} earned ${amount} points from ${source} (offer: ${offerId})`);

  return NextResponse.json({ status: 'ok' });
}
