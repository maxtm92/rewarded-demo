'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  decimals?: number;
}

export default function CountUp({
  from = 0,
  to,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 2,
}: CountUpProps) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => `${prefix}${v.toFixed(decimals)}${suffix}`);
  const [displayValue, setDisplayValue] = useState(`${prefix}${from.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => setDisplayValue(`${prefix}${v.toFixed(decimals)}${suffix}`),
    });
    return controls.stop;
  }, [count, to, duration, prefix, suffix, decimals]);

  return (
    <motion.span className={className} initial={{ scale: 1 }} animate={{ scale: [1, 1.1, 1] }} transition={{ delay: duration - 0.3, duration: 0.3 }}>
      {displayValue}
    </motion.span>
  );
}
