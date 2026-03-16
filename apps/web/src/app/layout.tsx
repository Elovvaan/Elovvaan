import './globals.css';
import { QueryProvider } from '@/providers/query-provider';
import { BottomNav } from '@/components/bottom-nav';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <QueryProvider>
          <main className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-4">{children}</main>
          <BottomNav />
        </QueryProvider>
      </body>
    </html>
  );
}
