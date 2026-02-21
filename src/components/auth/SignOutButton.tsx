'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="w-full py-3.5 rounded-xl border border-[#ff4757]/30 text-[#ff4757] hover:bg-[#ff4757]/10 hover:scale-[1.01] transition-all text-sm font-medium"
    >
      Sign Out
    </button>
  );
}
