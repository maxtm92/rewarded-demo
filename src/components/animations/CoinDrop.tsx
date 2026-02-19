'use client';

import { motion } from 'framer-motion';

interface CoinDropProps {
  count?: number;
  onComplete?: () => void;
}

export default function CoinDrop({ count = 12, onComplete }: CoinDropProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const left = 10 + Math.random() * 80;
        const delay = Math.random() * 0.6;
        const size = 24 + Math.random() * 24;
        const rotation = Math.random() * 720 - 360;

        return (
          <motion.div
            key={i}
            className="absolute text-yellow-400"
            style={{ left: `${left}%`, top: -60, fontSize: size }}
            initial={{ y: -60, opacity: 1, rotate: 0 }}
            animate={{
              y: [null, window?.innerHeight ? window.innerHeight + 100 : 900],
              rotate: rotation,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 1.4 + Math.random() * 0.6,
              delay,
              ease: 'easeIn',
            }}
            onAnimationComplete={i === 0 ? onComplete : undefined}
          >
            🪙
          </motion.div>
        );
      })}
    </div>
  );
}
