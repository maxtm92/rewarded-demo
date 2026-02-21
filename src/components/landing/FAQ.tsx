'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: 'How does Easy Task Cash work?',
    a: 'Sign up for free, complete simple tasks like playing games, taking surveys, or getting insurance quotes, and earn real cash. Withdraw to PayPal, crypto, gift cards, and more.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes! Easy Task Cash is 100% free to use. You never pay anything. Our advertisers pay us when you complete offers, and we share that revenue with you.',
  },
  {
    q: 'How much can I earn?',
    a: 'Earnings vary based on the offers you complete. Some game offers pay up to $2,500. Most users earn $20-$50 per week with casual usage.',
  },
  {
    q: 'How do I withdraw my earnings?',
    a: 'You can withdraw via PayPal ($5 minimum), cryptocurrency ($0.50 minimum), Amazon gift cards, Venmo, and more. Most withdrawals are processed within 24 hours.',
  },
  {
    q: 'How does the referral program work?',
    a: 'Share your unique referral link with friends. When they sign up and earn, you automatically receive 10% of their earnings. Forever. There\'s no limit to how much you can earn from referrals.',
  },
  {
    q: 'Is my information safe?',
    a: 'We use industry-standard encryption and never share your personal data with third parties without consent. Your earnings and withdrawals are tracked securely.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h3>
      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              className={`rounded-xl border overflow-hidden transition-colors ${
                isOpen ? 'bg-[#252539] border-[#01d676]/30' : 'bg-[#1d1d2e] border-[#393e56]'
              }`}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="flex items-center justify-between w-full p-4 text-left text-white font-medium text-sm hover:bg-[#252539] transition"
              >
                {faq.q}
                <svg
                  className={`w-4 h-4 text-[#787ead] ml-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 text-[#a9a9ca] text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
