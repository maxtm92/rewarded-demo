import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import SessionProvider from '@/components/SessionProvider';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Rewarded — Earn Cash for What You Already Do',
  description: 'Complete surveys, play games, get insurance quotes, and more. Cash out via PayPal, gift cards, or crypto.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0A0E1A] text-white`}>
        <SessionProvider>
          {children}
          <Toaster theme="dark" position="top-center" richColors />
        </SessionProvider>
      </body>
    </html>
  );
}
