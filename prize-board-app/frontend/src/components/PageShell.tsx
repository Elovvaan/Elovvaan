import type { ReactNode } from 'react';

export const PageShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <main className="mx-auto w-full max-w-6xl space-y-4 px-4 py-5">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
    </div>
    {children}
  </main>
);
