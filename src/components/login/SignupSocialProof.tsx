'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggerList, StaggerItem } from '@/components/animations/StaggerList';

const testimonials = [
  { name: 'Sarah M.', amount: '$340', text: 'I earned enough to pay my phone bill in the first week!' },
  { name: 'James K.', amount: '$1,200', text: 'Getting paid to play Dice Dreams was a no-brainer.' },
  { name: 'Emily R.', amount: '$580', text: 'Withdrew to PayPal in under 2 hours. The real deal.' },
  { name: 'Michael T.', amount: '$2,100', text: 'The referral program alone made me over $500.' },
];

const valueProps = [
  'Instant $5.00 signup bonus',
  'Earn $5–$50+ per offer',
  'Cash out via PayPal, crypto, gift cards',
  'Join 2M+ members worldwide',
];

export default function SignupSocialProof() {
  const [signupCount, setSignupCount] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // Initialize on client only to avoid hydration mismatch
  useEffect(() => {
    setSignupCount(Math.floor(Math.random() * 200) + 247);
  }, []);

  // Increment signup counter randomly
  useEffect(() => {
    function tick() {
      const delay = (Math.random() * 5 + 3) * 1000; // 3-8 seconds
      const timer = setTimeout(() => {
        setSignupCount((c) => c + Math.floor(Math.random() * 3) + 1);
        tick();
      }, delay);
      return timer;
    }
    const timer = tick();
    return () => clearTimeout(timer);
  }, []);

  // Rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = testimonials[testimonialIndex];

  return (
    <StaggerList className="space-y-8">
      {/* Headline */}
      <StaggerItem>
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">💰</span>
            <span className="text-2xl font-bold text-white">Easy Task Cash</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3">
            Get Paid for{' '}
            <span className="text-[#01d676]">What You Already Do</span>
          </h1>
          <p className="text-[#a9a9ca] text-lg">
            Complete surveys, play games, and earn real cash.
          </p>
        </div>
      </StaggerItem>

      {/* Live signup counter */}
      <StaggerItem>
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01d676] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#01d676]" />
          </span>
          <span className="text-[#a9a9ca] text-sm">
            <span className="text-white font-semibold">{signupCount.toLocaleString()}</span> people signed up today
          </span>
        </div>
      </StaggerItem>

      {/* Value props */}
      <StaggerItem>
        <div className="space-y-3">
          {valueProps.map((prop) => (
            <div key={prop} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#01d676]/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-[#01d676]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white text-sm">{prop}</span>
            </div>
          ))}
        </div>
      </StaggerItem>

      {/* Rotating testimonial */}
      <StaggerItem>
        <div className="p-5 rounded-2xl bg-[#1d1d2e]/60 border border-[#393e56]/50 min-h-[120px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-[#2f3043] flex items-center justify-center text-sm font-bold text-[#01d676]">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{t.name}</p>
                  <p className="text-[#01d676] text-xs font-bold">Earned {t.amount}</p>
                </div>
              </div>
              <p className="text-[#a9a9ca] text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </StaggerItem>

      {/* Star rating + payout stat */}
      <StaggerItem>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-[#fac401]">★★★★★</span>
            <span className="text-[#a9a9ca]">4.8 from 12K+ reviews</span>
          </div>
          <span className="text-[#393e56]">|</span>
          <span className="text-[#a9a9ca]"><span className="text-[#01d676] font-semibold">$12M+</span> paid out</span>
        </div>
      </StaggerItem>

      {/* Payment methods + trust */}
      <StaggerItem>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-[#787ead] text-xs">
            <span className="px-2 py-1 rounded bg-[#2f3043] border border-[#393e56]">PayPal</span>
            <span className="px-2 py-1 rounded bg-[#2f3043] border border-[#393e56]">Visa</span>
            <span className="px-2 py-1 rounded bg-[#2f3043] border border-[#393e56]">Bitcoin</span>
            <span className="px-2 py-1 rounded bg-[#2f3043] border border-[#393e56]">Gift Cards</span>
          </div>
          <div className="flex items-center gap-4 text-[#787ead] text-xs">
            <span className="flex items-center gap-1">🔒 256-bit SSL</span>
            <span className="flex items-center gap-1">✓ No credit card required</span>
          </div>
        </div>
      </StaggerItem>
    </StaggerList>
  );
}
