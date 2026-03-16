import './globals.css';
import { QueryProvider } from '@/providers/query-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <main className="mx-auto max-w-5xl p-6">{children}</main>
        </QueryProvider>
      </body>
    </html>
  );
}
