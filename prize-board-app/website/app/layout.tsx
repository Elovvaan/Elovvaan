import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Swipe2Win | Official Site',
  description: 'Swipe. Level up. Win real rewards with Swipe2Win.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-5 py-10">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
