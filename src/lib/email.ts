import { Resend } from 'resend';

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}
const FROM = 'Easy Task Cash <noreply@easytaskcash.com>';

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function sendWelcomeEmail(to: string, name: string | null): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: 'Welcome to Easy Task Cash — Your $5 bonus is waiting!',
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#141523;color:#f0f6ff;">
          <h1 style="color:#01d676;">Welcome${name ? `, ${name}` : ''}!</h1>
          <p>You've joined 2M+ members earning real cash daily.</p>
          <p>Complete your profile to claim your <strong style="color:#fac401;">$5.00 welcome bonus</strong>.</p>
          <a href="https://easytaskcash.com/survey"
             style="display:inline-block;padding:14px 28px;background:#01d676;color:#000;font-weight:bold;border-radius:12px;text-decoration:none;margin:16px 0;">
            Claim My $5 Bonus
          </a>
          <p style="color:#787ead;font-size:12px;margin-top:32px;">
            Easy Task Cash &middot; You're receiving this because you signed up.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] sendWelcomeEmail failed:', err);
  }
}

export async function sendEarningCreditedEmail(
  to: string,
  name: string | null,
  amountCents: number,
  offerName: string
): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: `You earned ${fmt(amountCents)}!`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#141523;color:#f0f6ff;">
          <h1 style="color:#01d676;">Earning Credited!</h1>
          <p>Hi${name ? ` ${name}` : ''},</p>
          <p><strong style="color:#01d676;font-size:24px;">${fmt(amountCents)}</strong> has been added to your balance.</p>
          <p style="color:#a9a9ca;">From: ${offerName}</p>
          <a href="https://easytaskcash.com/dashboard"
             style="display:inline-block;padding:14px 28px;background:#01d676;color:#000;font-weight:bold;border-radius:12px;text-decoration:none;margin:16px 0;">
            View My Balance
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] sendEarningCreditedEmail failed:', err);
  }
}

export async function sendWithdrawalStatusEmail(
  to: string,
  name: string | null,
  amountCents: number,
  status: 'COMPLETED' | 'REJECTED',
  method: string,
  rejectionReason?: string
): Promise<void> {
  const approved = status === 'COMPLETED';
  try {
    await getResend().emails.send({
      from: FROM,
      to,
      subject: approved
        ? `Your ${fmt(amountCents)} withdrawal has been approved!`
        : `Your ${fmt(amountCents)} withdrawal was not approved`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#141523;color:#f0f6ff;">
          <h1 style="color:${approved ? '#01d676' : '#ef4444'};">
            Withdrawal ${approved ? 'Approved' : 'Rejected'}
          </h1>
          <p>Hi${name ? ` ${name}` : ''},</p>
          ${approved
            ? `<p>Your <strong>${fmt(amountCents)}</strong> ${method.replace('_', ' ')} withdrawal is on its way.</p>`
            : `<p>Your <strong>${fmt(amountCents)}</strong> withdrawal was not approved. Your balance has been refunded.</p>
               ${rejectionReason ? `<p style="color:#a9a9ca;"><strong>Reason:</strong> ${rejectionReason}</p>` : ''}`
          }
          <a href="https://easytaskcash.com/${approved ? 'dashboard' : 'withdraw'}"
             style="display:inline-block;padding:14px 28px;background:#01d676;color:#000;font-weight:bold;border-radius:12px;text-decoration:none;margin:16px 0;">
            ${approved ? 'View Status' : 'Try Again'}
          </a>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Email] sendWithdrawalStatusEmail failed:', err);
  }
}
