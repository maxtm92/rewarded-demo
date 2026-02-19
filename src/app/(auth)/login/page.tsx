'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

type Tab = 'social' | 'email' | 'phone';

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('social');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const router = useRouter();

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn('resend', { email, callbackUrl: '/onboarding/survey' });
    setLoading(false);
  }

  async function handleSendCode() {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) setCodeSent(true);
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn('phone', { phone, code, callbackUrl: '/onboarding/survey' });
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-radial">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <span className="text-3xl">💰</span>
            <span className="text-2xl font-bold">Rewarded</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create Your Account</h1>
          <p className="text-gray-400">
            Sign up and get a <span className="text-amber-400 font-semibold">$5.00 bonus</span>
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#151929] rounded-2xl border border-white/5 p-8">
          {/* Social Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => signIn('google', { callbackUrl: '/onboarding/survey' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => signIn('apple', { callbackUrl: '/onboarding/survey' })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black text-white font-semibold border border-white/10 hover:bg-gray-900 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#0A0E1A] rounded-lg p-1 mb-6">
            {(['email', 'phone'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                  tab === t ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'email' ? 'Email' : 'Phone'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleEmailSignIn}
                className="space-y-4"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0E1A] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition disabled:opacity-50"
                >
                  {loading ? 'Sending link...' : 'Send Magic Link'}
                </button>
              </motion.form>
            )}

            {tab === 'phone' && (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handlePhoneSignIn}
                className="space-y-4"
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0A0E1A] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                />
                {codeSent && (
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#0A0E1A] border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition text-center tracking-widest text-lg"
                  />
                )}
                {!codeSent ? (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={loading || !phone}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold transition disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {/* Marketing Opt-in */}
          <label className="flex items-start gap-3 mt-6 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 text-emerald-600 focus:ring-emerald-500 bg-gray-800"
            />
            <span className="text-gray-400 text-xs leading-relaxed">
              I agree to receive promotional emails and offers. You can unsubscribe at any time.
            </span>
          </label>
        </div>

        {/* Demo / Skip Button */}
        <button
          onClick={async () => {
            setLoading(true);
            const res = await signIn('demo', { demo: '1', redirect: false });
            if (res?.ok) {
              window.location.href = '/onboarding/survey';
            } else {
              console.error('Demo sign-in failed:', res?.error);
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full mt-4 py-3 rounded-xl border border-dashed border-amber-500/40 text-amber-400 text-sm font-medium hover:bg-amber-500/10 transition disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Skip Sign Up (Demo Admin)'}
        </button>

        <p className="text-center text-gray-500 text-xs mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
