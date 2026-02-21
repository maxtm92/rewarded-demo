'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { captureUtmParams } from '@/lib/utm';

const stats = [
  { value: '$12M+', label: 'Paid Out' },
  { value: '2.1M+', label: 'Members' },
  { value: '4.8★', label: 'App Rating' },
];

const features = [
  { icon: '🎮', title: 'Play Games', desc: 'Earn cash playing popular mobile games', color: 'bg-purple-500/10' },
  { icon: '📋', title: 'Take Surveys', desc: 'Share your opinion and get paid instantly', color: 'bg-blue-500/10' },
  { icon: '🚗', title: 'Insurance Quotes', desc: 'Compare rates and earn $50+ per quote', color: 'bg-[#fac401]/10' },
  { icon: '💸', title: 'Cash Out', desc: 'PayPal, gift cards, or crypto — your choice', color: 'bg-[#01d676]/10' },
];

const steps = [
  { num: '1', title: 'Sign Up Free', desc: 'Create your account in seconds with Google, Apple, or email' },
  { num: '2', title: 'Complete Offers', desc: 'Play games, take surveys, and complete high-paying offers' },
  { num: '3', title: 'Get Paid', desc: 'Cash out to PayPal, gift cards, or crypto instantly' },
];

export default function Home() {
  useEffect(() => {
    captureUtmParams();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-radial">
      {/* Nav */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-xl font-bold tracking-tight text-white">Rewarded</span>
        </div>
        <Link
          href="/login"
          className="px-5 py-2.5 rounded-lg bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold text-sm transition"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6">
        <motion.section
          className="py-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#01d676]/10 border border-[#01d676]/30 text-[#01d676] text-sm font-medium mb-8">
            <span>🔥</span> Join 2M+ members earning daily
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white">
            Get Paid for{' '}
            <span className="text-[#01d676]">What You</span>
            <br />
            <span className="text-[#01d676]">Already Do</span>
          </h1>

          <p className="text-lg md:text-xl text-[#a9a9ca] mb-10 max-w-2xl mx-auto">
            Complete surveys, play games, get insurance quotes, and more.
            Earn real cash — withdraw via PayPal, gift cards, or crypto.
          </p>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black transition shadow-lg shadow-[#01d676]/25"
          >
            Start Earning Now
            <span className="text-xl">→</span>
          </Link>

          <p className="text-[#787ead] text-sm mt-4">Free to join • No credit card required</p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-16">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-extrabold text-white">{s.value}</p>
                <p className="text-[#787ead] text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-white mb-4">How You Earn</h2>
          <p className="text-[#a9a9ca] text-center mb-12 max-w-xl mx-auto">
            Multiple ways to earn, one easy platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className="p-6 rounded-2xl bg-[#1d1d2e] border border-[#393e56] hover:border-[#01d676]/50 transition group cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[#a9a9ca] text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-white mb-12">3 Steps to Cash</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 + 0.5 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-full bg-[#01d676] text-black flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-[#787ead] text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 text-center">
          <div className="p-12 rounded-3xl bg-[#1d1d2e] border border-[#393e56]">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start <span className="text-[#01d676]">Earning</span>?
            </h2>
            <p className="text-[#a9a9ca] mb-8 max-w-lg mx-auto">
              Sign up now and get a <span className="text-[#fac401] font-semibold">$5.00 bonus</span> just for completing your profile.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-10 py-4 text-lg font-bold rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black transition shadow-lg shadow-[#01d676]/25"
            >
              Claim Your $5 Bonus
              <span>🎁</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-[#393e56] text-center text-[#787ead] text-sm">
          <p>&copy; 2026 Rewarded. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
