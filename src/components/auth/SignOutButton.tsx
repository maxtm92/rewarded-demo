'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition text-sm font-medium"
    >
      Sign Out
    </button>
  );
}
