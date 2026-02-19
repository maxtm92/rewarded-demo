'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiBurstProps {
  trigger?: boolean;
}

export default function ConfettiBurst({ trigger = true }: ConfettiBurstProps) {
  useEffect(() => {
    if (!trigger) return;

    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#10b981', '#fbbf24', '#f59e0b', '#34d399'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#10b981', '#fbbf24', '#f59e0b', '#34d399'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [trigger]);

  return null;
}
