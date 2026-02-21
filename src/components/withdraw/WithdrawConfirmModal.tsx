'use client';

import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WithdrawConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  methodLabel: string;
  methodIcon?: ReactNode;
  amount: string;
  destination: string;
  processingTime: string;
  loading: boolean;
}

export default function WithdrawConfirmModal({
  open, onConfirm, onCancel, methodLabel, methodIcon, amount, destination, processingTime, loading,
}: WithdrawConfirmModalProps) {

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, loading, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !loading && onCancel()}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-sm rounded-2xl bg-[#1d1d2e] border border-[#393e56] p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white mb-5">Confirm Withdrawal</h3>

            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-[#a9a9ca] text-sm">Method</span>
                <span className="text-white text-sm font-semibold flex items-center gap-2">
                  {methodIcon && <span className="w-5 h-5 inline-block">{methodIcon}</span>}
                  {methodLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a9a9ca] text-sm">Amount</span>
                <span className="text-white text-sm font-bold">{amount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#a9a9ca] text-sm">Destination</span>
                <span className="text-white text-sm font-medium truncate max-w-[180px]">{destination}</span>
              </div>
              <div className="h-px bg-[#393e56]" />
              <div className="flex items-center gap-2 text-xs text-[#787ead]">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {processingTime}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-[#2f3043] text-white text-sm font-medium hover:bg-[#42435a] border border-[#393e56] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black text-sm font-bold transition glow-green-cta disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
