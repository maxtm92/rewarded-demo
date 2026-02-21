'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EarningsCalculator() {
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const weeklyEarnings = Math.round(hoursPerDay * daysPerWeek * 8);
  const monthlyEarnings = Math.round(hoursPerDay * daysPerWeek * 4.33 * 8);

  return (
    <div className="p-8 rounded-[20px] bg-[#1d1d2e] border border-[#393e56] card-inset">
      <div className="space-y-6 max-w-md mx-auto">
        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[#a9a9ca] text-sm">Hours per day</label>
            <span className="text-white font-bold">{hoursPerDay}h</span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            value={hoursPerDay}
            onChange={e => setHoursPerDay(Number(e.target.value))}
            className="landing-range w-full"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="text-[#a9a9ca] text-sm">Days per week</label>
            <span className="text-white font-bold">{daysPerWeek} days</span>
          </div>
          <input
            type="range"
            min={1}
            max={7}
            value={daysPerWeek}
            onChange={e => setDaysPerWeek(Number(e.target.value))}
            className="landing-range w-full"
          />
        </div>

        <div className="text-center p-6 rounded-xl bg-[#01d676]/10 border border-[#01d676]/20">
          <p className="text-[#a9a9ca] text-sm mb-1">Estimated Monthly Earnings</p>
          <motion.p
            key={monthlyEarnings}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="text-4xl font-extrabold text-[#01d676]"
          >
            ${monthlyEarnings}
          </motion.p>
          <p className="text-[#787ead] text-xs mt-2">~${weeklyEarnings}/week &middot; Based on typical active member data</p>
        </div>
      </div>
    </div>
  );
}
