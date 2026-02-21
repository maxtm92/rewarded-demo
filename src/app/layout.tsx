import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import SessionProvider from '@/components/SessionProvider';
import { Toaster } from 'sonner';
import './globals.css';

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Rewarded — Earn Cash for What You Already Do',
  description: 'Complete surveys, play games, get insurance quotes, and more. Cash out via PayPal, gift cards, or crypto.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased bg-[#141523] text-[#f0f6ff]`}>
        <SessionProvider>
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
