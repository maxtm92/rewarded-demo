import Link from 'next/link';

export default function BannedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-radial">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-2xl font-bold text-white mb-3">Account Suspended</h1>
        <p className="text-[#a9a9ca] mb-8">
          Your account has been suspended for violating our Terms of Service.
          If you believe this is a mistake, please contact support.
        </p>
        <Link
          href="mailto:support@easytaskcash.com"
          className="inline-block px-6 py-3 rounded-xl bg-[#2f3043] text-white font-medium hover:bg-[#42435a] border border-[#393e56] transition"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
