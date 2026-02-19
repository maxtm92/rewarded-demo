'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CoinDrop from '@/components/animations/CoinDrop';
import ConfettiBurst from '@/components/animations/ConfettiBurst';
import CountUp from '@/components/animations/CountUp';

export default function WelcomePage() {
  const router = useRouter();
  const [showAnimations, setShowAnimations] = useState(false);

  useEffect(() => {
    // Trigger animations after mount
    const timer = setTimeout(() => setShowAnimations(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="text-center py-12">
      {showAnimations && (
        <>
          <CoinDrop count={15} />
          <ConfettiBurst />
        </>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.3, stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-8 glow-gold"
      >
        <span className="text-5xl">🎉</span>
      </motion.div>

      <motion.h1
        className="text-3xl font-extrabold mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Bonus Unlocked!
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8"
      >
        <div className="text-5xl font-extrabold text-emerald-400 text-glow-green mb-2">
          <CountUp from={0} to={5} prefix="$" decimals={2} duration={1.5} />
        </div>
        <p className="text-gray-400">has been added to your balance</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-4"
      >
        <button
          onClick={() => router.push('/earn')}
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-lg transition animate-pulse-glow"
        >
          Start Earning Now →
        </button>

        <p className="text-gray-500 text-sm">
          Complete offers to earn more and cash out anytime
        </p>
      </motion.div>
    </div>
  );
}
