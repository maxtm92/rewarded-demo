'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WithdrawSuccessProps {
  methodLabel: string;
  amount: string;
  processingTime: string;
  onClose: () => void;
  onViewHistory: () => void;
}

export default function WithdrawSuccess({ methodLabel, amount, processingTime, onClose, onViewHistory }: WithdrawSuccessProps) {
  const [progress, setProgress] = useState(100);

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    const duration = 8000;
    const interval = 50;
    const step = (100 * interval) / duration;
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = p - step;
        if (next <= 0) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 250, damping: 22 }}
        className="relative w-full max-w-sm rounded-2xl bg-[#1d1d2e] border border-[#393e56] p-8 shadow-2xl text-center overflow-hidden"
      >
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.15 }}
          className="w-20 h-20 rounded-full bg-[#01d676]/15 border-2 border-[#01d676] flex items-center justify-center mx-auto mb-5"
        >
          <svg className="w-10 h-10 text-[#01d676] animate-checkmark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-2">Withdrawal Submitted!</h3>
        <p className="text-[#a9a9ca] text-sm mb-1">
          <span className="text-white font-bold">{amount}</span> → {methodLabel}
        </p>
        <p className="text-[#787ead] text-xs mb-6">{processingTime}</p>

        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={onViewHistory}
            className="w-full py-3 rounded-xl bg-[#2f3043] text-white text-sm font-medium hover:bg-[#42435a] border border-[#393e56] transition"
          >
            View My Withdrawals
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl text-[#787ead] hover:text-white text-sm transition"
          >
            Make Another Withdrawal
          </button>
        </div>

        {/* Auto-dismiss progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2f3043]">
          <div
            className="h-full bg-[#01d676] transition-all duration-50 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
