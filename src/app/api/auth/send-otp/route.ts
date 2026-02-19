import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  if (!phone) {
    return NextResponse.json({ error: 'Phone required' }, { status: 400 });
  }

  // In development, skip Twilio and just accept any phone
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.json({ success: true, message: 'Use code 000000 in dev mode' });
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({ To: phone, Channel: 'sms' }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send code' }, { status: 500 });
  }
}
