import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Resend from 'next-auth/providers/resend';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { generateReferralCode } from './referral';
import { sendWelcomeEmail } from './email';

// Only include providers whose env vars are configured
const providers = [
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [Google({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET })]
    : []),
  ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
    ? [Apple({ clientId: process.env.APPLE_CLIENT_ID, clientSecret: process.env.APPLE_CLIENT_SECRET })]
    : []),
  ...(process.env.RESEND_API_KEY
    ? [Resend({ apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM || 'noreply@easytaskcash.com' })]
    : []),
  ...(process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    ? [Credentials({
        id: 'demo',
        name: 'Demo',
        credentials: {
          demo: { label: 'Demo', type: 'hidden' },
        },
        async authorize() {
          const user = await prisma.user.upsert({
            where: { email: 'demo@easytaskcash.com' },
            update: { role: 'ADMIN' },
            create: {
              email: 'demo@easytaskcash.com',
              name: 'Demo Admin',
              role: 'ADMIN',
              onboardingDone: false,
            },
          });
          return { id: user.id, name: user.name, email: user.email, image: user.image };
        },
      })]
    : []),
    Credentials({
      id: 'phone',
      name: 'Phone',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        code: { label: 'Verification Code', type: 'text' },
      },
      async authorize(credentials) {
        const phone = credentials?.phone as string;
        const code = credentials?.code as string;
        if (!phone || !code) return null;

        // Verify OTP via Twilio Verify (or skip in dev)
        const isValid = await verifyOTP(phone, code);
        if (!isValid) return null;

        // Find or create user by phone
        let user = await prisma.user.findUnique({ where: { phone } });
        if (!user) {
          user = await prisma.user.create({ data: { phone } });
        }
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    Credentials({
      id: 'email-password',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Auto-generate referral code on first login
        try {
          const dbUser = await prisma.user.findUnique({ where: { id: user.id as string } });
          if (dbUser && !dbUser.referralCode) {
            const code = generateReferralCode(user.id as string);
            await prisma.user.update({
              where: { id: user.id as string },
              data: { referralCode: code },
            });
            // Send welcome email on first login
            if (dbUser.email) {
              sendWelcomeEmail(dbUser.email, dbUser.name).catch(() => {});
            }
          }
        } catch {}
      }
      // Refresh user data from DB
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            balanceCents: true, onboardingDone: true, role: true, profileComplete: true,
            currentStreak: true, lastLoginDate: true, referralCode: true, isBanned: true,
          },
        });
        if (dbUser) {
          token.balanceCents = dbUser.balanceCents;
          token.onboardingDone = dbUser.onboardingDone;
          token.role = dbUser.role;
          token.profileComplete = dbUser.profileComplete;
          token.currentStreak = dbUser.currentStreak;
          token.lastLoginDate = dbUser.lastLoginDate?.toISOString() ?? null;
          token.referralCode = dbUser.referralCode;
          token.isBanned = dbUser.isBanned;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.balanceCents = token.balanceCents as number;
        session.user.onboardingDone = token.onboardingDone as boolean;
        session.user.role = token.role as string;
        session.user.profileComplete = token.profileComplete as boolean;
        session.user.currentStreak = (token.currentStreak as number) ?? 0;
        session.user.lastLoginDate = (token.lastLoginDate as string | null) ?? null;
        session.user.referralCode = (token.referralCode as string | null) ?? null;
        session.user.isBanned = (token.isBanned as boolean) ?? false;
      }
      return session;
    },
  },
});

async function verifyOTP(phone: string, code: string): Promise<boolean> {
  // In development, accept "000000" as valid code
  if (process.env.NODE_ENV === 'development' && code === '000000') return true;

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID!;

    const res = await fetch(
      `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationChecks`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
        },
        body: new URLSearchParams({ To: phone, Code: code }),
      }
    );
    const data = await res.json();
    return data.status === 'approved';
  } catch {
    return false;
  }
}
