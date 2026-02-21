'use client';

import { useState, useCallback } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';
import SignupSocialProof from '@/components/login/SignupSocialProof';
import BonusCountdown from '@/components/login/BonusCountdown';
import OtpInput from '@/components/login/OtpInput';
import EmailSentScreen from '@/components/login/EmailSentScreen';

type Tab = 'email' | 'phone';

function formatPhoneNumber(value: string): string {
  const hasPlus = value.startsWith('+');
  const digits = value.replace(/\D/g, '');
  if (digits.length === 0) return hasPlus ? '+' : '';

  // US format
  const d = digits.startsWith('1') ? digits : ((!hasPlus && digits.length <= 10) ? '1' + digits : digits);
  if (d.startsWith('1')) {
    if (d.length <= 1) return '+1';
    if (d.length <= 4) return `+1 (${d.slice(1)}`;
    if (d.length <= 7) return `+1 (${d.slice(1, 4)}) ${d.slice(4)}`;
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 11)}`;
  }
  return `+${digits}`;
}

function stripPhone(formatted: string): string {
  return '+' + formatted.replace(/\D/g, '');
}

function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
  return null;
}

function Spinner({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [marketingOptIn, setMarketingOptIn] = useState(true);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    const error = validateEmail(email);
    if (error) { setEmailError(error); return; }
    setLoading(true);
    setLoadingProvider('email');
    try {
      await signIn('resend', { email, callbackUrl: '/survey', redirect: false });
      setEmailSent(true);
    } catch {
      toast.error('Failed to send magic link. Please try again.');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }

  async function handleSendCode() {
    const stripped = stripPhone(phone);
    if (stripped.replace(/\D/g, '').length < 10) {
      setPhoneError('Please enter a valid phone number');
      return;
    }
    setLoading(true);
    setLoadingProvider('phone');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: stripped }),
      });
      if (res.ok) {
        setCodeSent(true);
        setPhoneError(null);
      } else {
        const data = await res.json().catch(() => ({}));
        setPhoneError(data.error || 'Failed to send code. Please try again.');
      }
    } catch {
      setPhoneError('Network error. Please try again.');
    } finally {
      setLoading(false);
      setLoadingProvider(null);
    }
  }

  const handleOtpComplete = useCallback(async (fullCode: string) => {
    setLoading(true);
    setLoadingProvider('phone');
    setOtpError(null);
    const res = await signIn('phone', { phone: stripPhone(phone), code: fullCode, redirect: false });
    if (res?.error) {
      setOtpError('Invalid code. Please try again.');
      setCode('');
      setLoading(false);
      setLoadingProvider(null);
    } else if (res?.ok) {
      window.location.href = '/survey';
    }
  }, [phone]);

  function handleOAuthClick(provider: 'google' | 'apple') {
    setLoadingProvider(provider);
    signIn(provider, { callbackUrl: '/survey' });
  }

  return (
    <div className="min-h-screen signup-bg relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-[10%] w-[400px] h-[400px] rounded-full bg-[#01d676]/[0.04] blur-3xl animate-float-orb" />
        <div className="absolute bottom-1/4 right-[10%] w-[350px] h-[350px] rounded-full bg-[#fac401]/[0.03] blur-3xl animate-float-orb" style={{ animationDelay: '7s' }} />
        <div className="absolute top-[60%] left-[50%] w-[300px] h-[300px] rounded-full bg-indigo-500/[0.03] blur-3xl animate-float-orb" style={{ animationDelay: '14s' }} />
      </div>

      <div className="relative min-h-screen flex items-center justify-center px-4 py-10 lg:py-0">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* LEFT COLUMN — Social proof (desktop only) */}
          <div className="hidden lg:block">
            <SignupSocialProof />
          </div>

          {/* RIGHT COLUMN — Form */}
          <motion.div
            className="w-full max-w-md mx-auto lg:mx-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Bonus countdown */}
            <BonusCountdown className="mb-4" />

            {/* Mobile-only compact social proof */}
            <div className="lg:hidden mb-5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">💰</span>
                  <span className="text-lg font-bold text-white">Easy Task Cash</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[#fac401] text-xs">★★★★★</span>
                  <span className="text-[#787ead] text-xs">4.8</span>
                </div>
              </div>
            </div>

            {/* Card */}
            <div className="bg-[#1d1d2e]/90 backdrop-blur-xl rounded-[24px] border border-[#393e56]/60 p-8 md:p-10 card-inset relative overflow-hidden">
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#01d676]/[0.03] to-transparent pointer-events-none rounded-[24px]" />

              <div className="relative">
                <AnimatePresence mode="wait">
                  {emailSent ? (
                    <EmailSentScreen
                      key="email-sent"
                      email={email}
                      onBack={() => setEmailSent(false)}
                    />
                  ) : (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      {/* Header */}
                      <div className="text-center mb-6">
                        {/* Show logo on desktop (mobile has it above card) */}
                        <Link href="/" className="hidden lg:inline-flex items-center gap-2 mb-4">
                          <span className="text-3xl">💰</span>
                          <span className="text-xl font-bold text-white">Easy Task Cash</span>
                        </Link>
                        <h1 className="text-xl font-bold text-white mb-1">Create Your Account</h1>
                        <p className="text-[#a9a9ca] text-sm">
                          Sign up and get a <span className="text-[#fac401] font-semibold">$5.00 bonus</span>
                        </p>
                      </div>

                      {/* Social OAuth */}
                      <div className="space-y-2.5 mb-5">
                        <button
                          onClick={() => handleOAuthClick('google')}
                          disabled={!!loadingProvider}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[#2f3043] text-white font-semibold text-sm hover:bg-[#42435a] border border-[#393e56] transition active:scale-[0.98] disabled:opacity-60"
                        >
                          {loadingProvider === 'google' ? (
                            <><Spinner /> Connecting...</>
                          ) : (
                            <>
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              Continue with Google
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleOAuthClick('apple')}
                          disabled={!!loadingProvider}
                          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-black text-white font-semibold text-sm border border-[#393e56] hover:bg-gray-900 transition active:scale-[0.98] disabled:opacity-60"
                        >
                          {loadingProvider === 'apple' ? (
                            <><Spinner /> Connecting...</>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                              </svg>
                              Continue with Apple
                            </>
                          )}
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-4 my-5">
                        <div className="flex-1 h-px bg-[#393e56]" />
                        <span className="text-[#787ead] text-xs">or</span>
                        <div className="flex-1 h-px bg-[#393e56]" />
                      </div>

                      {/* Tab Selector */}
                      <div className="flex bg-[#2f3043] rounded-lg p-1 mb-5">
                        {(['email', 'phone'] as const).map((t) => (
                          <button
                            key={t}
                            onClick={() => { setTab(t); setEmailError(null); setPhoneError(null); setOtpError(null); }}
                            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
                              tab === t ? 'bg-[#01d676] text-black' : 'text-[#787ead] hover:text-white'
                            }`}
                          >
                            {t === 'email' ? 'Email' : 'Phone'}
                          </button>
                        ))}
                      </div>

                      {/* Forms */}
                      <AnimatePresence mode="wait">
                        {tab === 'email' && (
                          <motion.form
                            key="email-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onSubmit={handleEmailSignIn}
                            className="space-y-3"
                          >
                            <div>
                              <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setEmailError(null); }}
                                onBlur={() => { if (email) setEmailError(validateEmail(email)); }}
                                placeholder="Enter your email"
                                required
                                className={`w-full px-4 py-3 rounded-xl bg-[#2f3043] border text-white text-sm placeholder-[#787ead] focus:outline-none transition ${
                                  emailError ? 'border-red-500' : 'border-[#393e56] focus:border-[#01d676]'
                                }`}
                              />
                              {emailError && (
                                <motion.p
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-red-400 text-xs mt-1.5 ml-1"
                                >
                                  {emailError}
                                </motion.p>
                              )}
                            </div>
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold text-sm transition disabled:opacity-50 glow-green-cta flex items-center justify-center gap-2"
                            >
                              {loadingProvider === 'email' ? <><Spinner /> Sending...</> : 'Send Magic Link'}
                            </button>
                          </motion.form>
                        )}

                        {tab === 'phone' && (
                          <motion.div
                            key="phone-form"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="space-y-3"
                          >
                            <div>
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => { setPhone(formatPhoneNumber(e.target.value)); setPhoneError(null); }}
                                placeholder="+1 (555) 123-4567"
                                className={`w-full px-4 py-3 rounded-xl bg-[#2f3043] border text-white text-sm placeholder-[#787ead] focus:outline-none transition ${
                                  phoneError ? 'border-red-500' : 'border-[#393e56] focus:border-[#01d676]'
                                }`}
                              />
                              {phoneError && (
                                <motion.p
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-red-400 text-xs mt-1.5 ml-1"
                                >
                                  {phoneError}
                                </motion.p>
                              )}
                            </div>

                            {codeSent && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2"
                              >
                                <p className="text-[#a9a9ca] text-xs text-center">Enter the 6-digit code sent to your phone</p>
                                <OtpInput
                                  value={code}
                                  onChange={(v) => { setCode(v); setOtpError(null); }}
                                  onComplete={handleOtpComplete}
                                  disabled={loading}
                                  error={otpError}
                                />
                              </motion.div>
                            )}

                            {!codeSent ? (
                              <button
                                type="button"
                                onClick={handleSendCode}
                                disabled={loading || !phone}
                                className="w-full py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold text-sm transition disabled:opacity-50 glow-green-cta flex items-center justify-center gap-2"
                              >
                                {loadingProvider === 'phone' ? <><Spinner /> Sending...</> : 'Send Code'}
                              </button>
                            ) : (
                              <div className="flex items-center justify-center gap-2 text-xs">
                                {loading && (
                                  <span className="flex items-center gap-1.5 text-[#01d676]">
                                    <Spinner className="w-3 h-3" /> Verifying...
                                  </span>
                                )}
                                {!loading && (
                                  <button
                                    type="button"
                                    onClick={() => { setCodeSent(false); setCode(''); setOtpError(null); }}
                                    className="text-[#787ead] hover:text-white transition"
                                  >
                                    Change number
                                  </button>
                                )}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Marketing Opt-in */}
                      <label className="flex items-start gap-3 mt-5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={marketingOptIn}
                          onChange={(e) => setMarketingOptIn(e.target.checked)}
                          className="mt-0.5 w-4 h-4 rounded border-[#393e56] text-[#01d676] focus:ring-[#01d676] bg-[#2f3043]"
                        />
                        <span className="text-[#787ead] text-xs leading-relaxed">
                          I agree to receive promotional emails and offers. You can unsubscribe at any time.
                        </span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Below card */}
            <p className="text-center text-[#787ead] text-xs mt-4">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>

            {/* Demo button */}
            {process.env.NEXT_PUBLIC_DEMO_MODE === 'true' && (
              <button
                onClick={async () => {
                  setLoadingProvider('demo');
                  const res = await signIn('demo', { demo: '1', redirect: false });
                  if (res?.ok) {
                    window.location.href = '/survey';
                  } else {
                    setLoadingProvider(null);
                  }
                }}
                disabled={!!loadingProvider}
                className="w-full mt-3 py-3 rounded-xl border border-dashed border-[#fac401]/50 text-[#fac401] text-sm font-medium hover:bg-[#fac401]/10 transition disabled:opacity-50"
              >
                {loadingProvider === 'demo' ? 'Signing in...' : 'Skip Sign Up (Demo Admin)'}
              </button>
            )}
          </motion.div>

          {/* Mobile social proof below card */}
          <div className="lg:hidden">
            <SignupSocialProof />
          </div>

        </div>
      </div>
    </div>
  );
}
