import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Apple from 'next-auth/providers/apple';
import Resend from 'next-auth/providers/resend';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM || 'noreply@rewarded.com',
    }),
    Credentials({
      id: 'demo',
      name: 'Demo',
      credentials: {
        demo: { label: 'Demo', type: 'hidden' },
      },
      async authorize() {
        // Upsert a demo admin user for testing
        const user = await prisma.user.upsert({
          where: { email: 'demo@rewarded.com' },
          update: { role: 'ADMIN' },
          create: {
            email: 'demo@rewarded.com',
            name: 'Demo Admin',
            role: 'ADMIN',
            onboardingDone: false,
          },
        });
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
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
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Refresh user data from DB
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { balanceCents: true, onboardingDone: true, role: true, profileComplete: true },
        });
        if (dbUser) {
          token.balanceCents = dbUser.balanceCents;
          token.onboardingDone = dbUser.onboardingDone;
          token.role = dbUser.role;
          token.profileComplete = dbUser.profileComplete;
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
