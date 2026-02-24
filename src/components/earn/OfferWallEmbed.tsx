'use client';

interface Props {
  name: string;
  slug: string;
  iframeUrl: string | null;
  redirectUrl: string | null;
}

export default function OfferWallEmbed({ name, slug, iframeUrl, redirectUrl }: Props) {
  async function trackClick() {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'offer_click', metadata: { wall: slug } }),
      });
    } catch {}
  }

  if (iframeUrl) {
    return (
      <div className="rounded-[20px] overflow-hidden border border-[#393e56] bg-[#1d1d2e] card-shadow">
        <iframe
          src={iframeUrl}
          className="w-full min-h-[600px] md:min-h-[800px]"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          title={`${name} Offers`}
        />
      </div>
    );
  }

  if (redirectUrl) {
    return (
      <div className="text-center py-16 rounded-[20px] bg-[#1d1d2e] border border-[#393e56] card-shadow">
        <span className="text-5xl mb-4 block">🎮</span>
        <h2 className="text-xl font-semibold text-white mb-3">Complete offers on {name}</h2>
        <p className="text-[#a9a9ca] mb-4 max-w-md mx-auto">
          You&apos;ll be redirected to {name}. Complete at least 1 offer to earn <span className="text-[#01d676] font-bold">$10</span>.
        </p>
        <p className="text-[#787ead] text-sm mb-8 max-w-md mx-auto">
          Your earnings will be credited to your balance automatically.
        </p>
        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackClick}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold transition glow-green-cta"
        >
          Open {name} →
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-16 rounded-[20px] bg-[#1d1d2e] border border-[#393e56] card-shadow">
      <span className="text-5xl mb-4 block">🔧</span>
      <p className="text-[#a9a9ca]">This offerwall is being configured. Check back soon!</p>
    </div>
  );
}
