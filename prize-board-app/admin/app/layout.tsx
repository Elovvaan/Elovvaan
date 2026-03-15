import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Swipe2Win Admin',
  description: 'Operational dashboard for Swipe2Win prize board management.',
  icons: {
    icon: '/favicon.svg'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
