const testimonials = [
  { name: 'Sarah M.', amount: '$340', text: 'I was skeptical at first, but I earned enough to pay my phone bill in the first week!', duration: '3 months' },
  { name: 'James K.', amount: '$1,200', text: 'The game offers are actually fun. Getting paid to play Dice Dreams was a no-brainer.', duration: '8 months' },
  { name: 'Emily R.', amount: '$580', text: 'Withdrew to PayPal in under 2 hours. This is the real deal.', duration: '5 months' },
  { name: 'Michael T.', amount: '$2,100', text: 'Best rewards site I\'ve tried. The referral program alone made me over $500.', duration: '1 year' },
  { name: 'Jessica L.', amount: '$890', text: 'Easy surveys and quick payouts. I do this while watching TV every night.', duration: '6 months' },
  { name: 'David W.', amount: '$450', text: 'Started with crypto withdrawals at $0.50. Now I withdraw to PayPal weekly.', duration: '4 months' },
];

export default function Testimonials() {
  return (
    <div>
      <h3 className="text-2xl font-bold text-white mb-2 text-center">Trusted by 2.1M+ Members</h3>
      <p className="text-[#787ead] text-sm text-center mb-8">Real reviews from real earners</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials.map((t, i) => (
          <div key={i} className="p-5 rounded-[16px] bg-[#1d1d2e] border border-[#393e56] card-inset">
            {/* Star rating */}
            <div className="flex items-center gap-0.5 mb-3">
              {[...Array(5)].map((_, s) => (
                <span key={s} className="text-[#fac401] text-xs">&#9733;</span>
              ))}
            </div>
            <p className="text-[#a9a9ca] text-sm leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#2f3043] flex items-center justify-center text-xs font-bold text-[#01d676]">
                  {t.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <span className="text-[#01d676] text-[10px]">&#10003; Verified</span>
                  </div>
                  <p className="text-[#787ead] text-[11px]">Member for {t.duration}</p>
                </div>
              </div>
              <span className="text-[#01d676] text-sm font-bold">{t.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
