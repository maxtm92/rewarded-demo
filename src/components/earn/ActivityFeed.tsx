'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'withdrawal' | 'earning';
  name: string;
  amount: string;
  source: string;
  timeAgo: string;
}

export default function ActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/activity-feed')
      .then(r => r.json())
      .then(setItems)
      .catch(() => {});
  }, []);

  const rotate = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % Math.max(items.length, 1));
  }, [items.length]);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(rotate, 4000);
    return () => clearInterval(interval);
  }, [items.length, rotate]);

  if (items.length === 0) return null;

  const current = items[currentIndex];
  if (!current) return null;

  return (
    <div className="rounded-xl bg-[#1d1d2e]/80 border border-[#393e56] px-4 py-2.5 overflow-hidden">
      <div className="flex items-center gap-2">
        {/* Live dot */}
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01d676] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01d676]" />
        </span>

        <AnimatePresence mode="wait">
          <motion.p
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="text-sm text-[#a9a9ca] truncate"
          >
            <span className="text-white font-medium">{current.name}</span>
            {current.type === 'withdrawal' ? ' just withdrew ' : ' earned '}
            <span className="text-[#01d676] font-semibold">{current.amount}</span>
            {current.type === 'withdrawal' ? ' to ' : ' from '}
            <span className="text-white">{current.source}</span>
            <span className="text-[#787ead] ml-2">{current.timeAgo}</span>
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
