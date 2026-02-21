'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';

export default function AnimatedBalance({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const display = useTransform(motionVal, (v) => v.toFixed(2));
  const prevRef = useRef(0);

  useEffect(() => {
    const duration = prevRef.current === 0 ? 0.8 : 0.5;
    animate(motionVal, value / 100, { duration });
    prevRef.current = value;
  }, [value, motionVal]);

  return <motion.span>{display}</motion.span>;
}
