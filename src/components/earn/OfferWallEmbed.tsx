'use client';

interface Props {
  name: string;
  iframeUrl: string | null;
  redirectUrl: string | null;
}

export default function OfferWallEmbed({ name, iframeUrl, redirectUrl }: Props) {
  if (iframeUrl) {
    return (
      <div className="rounded-2xl overflow-hidden border border-[#393e56] bg-[#1d1d2e]">
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
      <div className="text-center py-16 rounded-2xl bg-[#1d1d2e] border border-[#393e56]">
        <span className="text-5xl mb-4 block">{name === 'Auto Insurance' ? '🚗' : '🔗'}</span>
        <h2 className="text-xl font-semibold text-white mb-3">Complete offers on {name}</h2>
        <p className="text-[#a9a9ca] mb-8 max-w-md mx-auto">
          You&apos;ll be redirected to {name}. Your earnings will be credited to your Rewarded balance automatically.
        </p>
        <a
          href={redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-[#01d676] hover:bg-[#01ff97] text-black font-semibold transition"
        >
          Open {name} →
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-16 rounded-2xl bg-[#1d1d2e] border border-[#393e56]">
      <span className="text-5xl mb-4 block">🔧</span>
      <p className="text-[#a9a9ca]">This offerwall is being configured. Check back soon!</p>
    </div>
  );
}
