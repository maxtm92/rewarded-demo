'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { captureUtmParams } from '@/lib/utm';
import ActivityFeed from '@/components/earn/ActivityFeed';
import EarningsCalculator from '@/components/landing/EarningsCalculator';
import Testimonials from '@/components/landing/Testimonials';
import FAQ from '@/components/landing/FAQ';

const features = [
  { icon: '🎮', title: 'Play Games', desc: 'Earn cash playing popular mobile games', payout: 'Up to $2,500/offer', borderColor: 'border-t-purple-500' },
  { icon: '📋', title: 'Take Surveys', desc: 'Share your opinion and get paid instantly', payout: 'Earn $3–$15 each', borderColor: 'border-t-cyan-400' },
  { icon: '🚗', title: 'Insurance Quotes', desc: 'Compare rates and earn $50+ per quote', payout: 'Earn $50+ per quote', borderColor: 'border-t-[#fac401]' },
  { icon: '💸', title: 'Cash Out', desc: 'PayPal, gift cards, or crypto — your choice', payout: 'PayPal, crypto & more', borderColor: 'border-t-[#01d676]' },
];

const steps = [
  { icon: '📝', title: 'Sign Up Free', desc: 'Create your account in seconds with Google, Apple, or email', color: 'bg-[#01d676]/60' },
  { icon: '🎯', title: 'Complete Offers', desc: 'Play games, take surveys, and complete high-paying offers', color: 'bg-[#01d676]/80' },
  { icon: '💰', title: 'Get Paid', desc: 'Cash out to PayPal, gift cards, or crypto instantly', color: 'bg-[#01d676]' },
];

const paymentMethods = ['PayPal', 'Visa', 'Bitcoin', 'Apple Pay', 'Venmo'];

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
          <span className="text-xl font-bold tracking-tight text-white">Easy Task Cash</span>
        </div>
        <Link
          href="/login"
          className="px-5 py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold text-sm transition glow-green-cta"
        >
          Get Started
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-7xl mx-auto px-6">
        <motion.section
          className="py-16 md:py-24 text-center"
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

          <p className="text-lg md:text-xl text-[#a9a9ca] mb-8 max-w-2xl mx-auto">
            Complete surveys, play games, get insurance quotes, and more.
            Earn real cash — withdraw via PayPal, gift cards, or crypto.
          </p>

          {/* Stats pills — above CTA */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { value: '$12M+', label: 'Paid Out' },
              { value: '2.1M+', label: 'Members' },
              { value: '4.8★', label: 'App Rating' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1d1d2e] border border-[#393e56]">
                <span className="text-white font-bold text-sm">{s.value}</span>
                <span className="text-[#787ead] text-xs">{s.label}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-10 py-5 text-lg font-bold rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black transition glow-green-cta"
          >
            Start Earning Now
            <span className="text-xl">→</span>
          </Link>

          <p className="text-[#787ead] text-sm mt-4">Free to join &middot; No credit card required</p>

          {/* Payment method trust icons */}
          <div className="flex justify-center items-center gap-4 mt-6">
            {paymentMethods.map(m => (
              <span key={m} className="text-[#787ead]/60 text-xs font-medium">{m}</span>
            ))}
          </div>

          {/* Activity Feed — social proof in hero */}
          <div className="max-w-md mx-auto mt-8">
            <ActivityFeed />
          </div>
        </motion.section>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#393e56] to-transparent my-4" />

        {/* Features */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-white mb-4">How You Earn</h2>
          <p className="text-[#a9a9ca] text-center mb-12 max-w-xl mx-auto">
            Multiple ways to earn, one easy platform
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }}
                className={`p-5 rounded-[20px] bg-[#1d1d2e] border border-[#393e56] border-t-[3px] ${f.borderColor} hover:border-[#01d676]/50 transition group cursor-pointer card-inset hover-lift`}
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform inline-block">
                  {f.icon}
                </div>
                <h3 className="text-sm md:text-base font-semibold text-white mb-1.5">{f.title}</h3>
                <p className="text-[#a9a9ca] text-xs md:text-sm mb-3">{f.desc}</p>
                <p className="text-[#01d676] text-xs font-semibold">{f.payout}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#393e56] to-transparent my-4" />

        {/* How It Works */}
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">3 Steps to Cash</h2>
          <div className="relative max-w-4xl mx-auto">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-px border-t-2 border-dashed border-[#393e56]" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 + 0.5 }}
                  className="text-center relative"
                >
                  <div className={`w-16 h-16 rounded-full ${step.color} text-black flex items-center justify-center text-2xl font-bold mx-auto mb-4 relative z-10`}>
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-[#787ead] text-sm max-w-[200px] mx-auto">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#393e56] to-transparent my-4" />

        {/* Earnings Calculator */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-white mb-4">See What You Could Earn</h2>
          <p className="text-[#a9a9ca] text-center mb-10 max-w-xl mx-auto">
            Adjust the sliders to estimate your monthly earnings
          </p>
          <div className="max-w-lg mx-auto">
            <EarningsCalculator />
          </div>
        </section>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#393e56] to-transparent my-4" />

        {/* Testimonials */}
        <section className="py-20">
          <Testimonials />
        </section>

        {/* Gradient divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#393e56] to-transparent my-4" />

        {/* FAQ */}
        <section className="py-16">
          <FAQ />
        </section>

        {/* Bottom CTA */}
        <section className="py-20 text-center">
          <div className="p-12 md:p-16 rounded-3xl bg-[#1d1d2e] border border-[#393e56] card-shadow-lg relative overflow-hidden">
            {/* Subtle glow bg */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#01d676]/5 via-transparent to-[#01d676]/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Start <span className="text-[#01d676]">Earning</span>?
              </h2>
              <p className="text-[#a9a9ca] mb-3 max-w-lg mx-auto">
                Sign up now and get a <span className="text-[#fac401] font-semibold">$5.00 bonus</span> just for completing your profile.
              </p>
              <p className="text-[#787ead] text-sm mb-8">Join 847 people who signed up today</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-10 py-5 text-lg font-bold rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black transition glow-green-cta"
              >
                Claim Your $5 Bonus
                <span>🎁</span>
              </Link>
              {/* Payment methods */}
              <div className="flex justify-center items-center gap-4 mt-6">
                {paymentMethods.map(m => (
                  <span key={m} className="text-[#787ead]/60 text-xs font-medium">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-[#393e56] text-center text-[#787ead] text-sm">
          <p>&copy; 2026 Easy Task Cash. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
