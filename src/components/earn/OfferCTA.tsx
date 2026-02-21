'use client';

interface Props {
  offerId: string;
  externalUrl: string;
  ctaText: string;
  angleId?: string | null;
}

export default function OfferCTA({ offerId, externalUrl, ctaText, angleId }: Props) {
  async function handleClick() {
    // Track click
    if (angleId) {
      fetch(`/api/angles?id=${angleId}&action=click`, { method: 'POST' }).catch(() => {});
    }
    // Open external URL
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <button
      onClick={handleClick}
      className="w-full py-5 rounded-xl bg-[#fac401] hover:bg-[#ffbc11] text-black font-bold text-lg transition glow-gold-cta"
    >
      {ctaText} →
    </button>
  );
}
