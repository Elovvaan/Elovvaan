import type { ReactNode } from 'react';

export const Card = ({ children }: { children: ReactNode }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">{children}</section>
);
