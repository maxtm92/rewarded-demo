import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      balanceCents: number;
      onboardingDone: boolean;
      role: string;
      profileComplete: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    balanceCents?: number;
    onboardingDone?: boolean;
    role?: string;
    profileComplete?: boolean;
  }
}
