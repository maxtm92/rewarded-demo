'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface EmailSentScreenProps {
  email: string;
  onBack: () => void;
}

export default function EmailSentScreen({ email, onBack }: EmailSentScreenProps) {
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setCanResend(true), 30000);
    return () => clearTimeout(timer);
  }, []);

  async function handleResend() {
    setResending(true);
    try {
      await signIn('resend', { email, callbackUrl: '/survey', redirect: false });
      toast.success('Magic link resent!');
      setCanResend(false);
      setTimeout(() => setCanResend(true), 30000);
    } catch {
      toast.error('Failed to resend. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="text-center py-4"
    >
      {/* Animated envelope */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="w-20 h-20 rounded-2xl bg-[#01d676]/10 border border-[#01d676]/20 flex items-center justify-center mx-auto mb-6"
      >
        <span className="text-4xl">📧</span>
      </motion.div>

      <h2 className="text-xl font-bold text-white mb-2">Check your inbox</h2>
      <p className="text-[#a9a9ca] text-sm mb-1">
        We sent a magic link to
      </p>
      <p className="text-white font-semibold text-sm mb-6">{email}</p>
      <p className="text-[#787ead] text-xs mb-8">
        Click the link in the email to sign in. Check your spam folder if you don&apos;t see it.
      </p>

      <div className="space-y-3">
        {canResend && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleResend}
            disabled={resending}
            className="w-full py-3 rounded-xl bg-[#2f3043] text-white text-sm font-medium hover:bg-[#42435a] border border-[#393e56] transition disabled:opacity-50"
          >
            {resending ? 'Resending...' : 'Resend Magic Link'}
          </motion.button>
        )}
        <button
          onClick={onBack}
          className="w-full py-3 rounded-xl text-[#787ead] hover:text-white text-sm transition"
        >
          Use a different method
        </button>
      </div>
    </motion.div>
  );
}
