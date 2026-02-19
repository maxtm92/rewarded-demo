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
      className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-lg transition"
    >
      {ctaText} →
    </button>
  );
}
