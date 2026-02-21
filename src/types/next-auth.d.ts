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
      currentStreak: number;
      lastLoginDate: string | null;
      referralCode: string | null;
      isBanned: boolean;
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
    currentStreak?: number;
    lastLoginDate?: string | null;
    referralCode?: string | null;
    isBanned?: boolean;
  }
}
