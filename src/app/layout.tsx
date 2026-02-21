import type { Metadata } from 'next';
import Script from 'next/script';
import { Poppins } from 'next/font/google';
import SessionProvider from '@/components/SessionProvider';
import UtmSync from '@/components/UtmSync';
import { Toaster } from 'sonner';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Easy Task Cash — Earn Cash for What You Already Do',
  description: 'Complete surveys, play games, get insurance quotes, and more. Cash out via PayPal, gift cards, or crypto.',
  openGraph: {
    title: 'Easy Task Cash — Earn Cash for What You Already Do',
    description: 'Join 2M+ members earning real cash daily. Complete surveys, play games, and cash out via PayPal, gift cards, or crypto.',
    type: 'website',
    siteName: 'Easy Task Cash',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Easy Task Cash — Earn Cash for What You Already Do',
    description: 'Join 2M+ members earning real cash daily. Complete surveys, play games, and cash out via PayPal, gift cards, or crypto.',
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased bg-[#141523] text-[#f0f6ff]`}>
        <SessionProvider>
          <UtmSync />
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </SessionProvider>

        {/* GA4 */}
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}

        {/* Facebook Pixel */}
        {FB_PIXEL_ID && (
          <Script id="fb-pixel-init" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${FB_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
      </body>
    </html>
  );
}
