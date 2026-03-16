export function SwipeCard({ title, subtitle, cta }: { title: string; subtitle: string; cta: string }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
      <p className="text-xs uppercase tracking-wider text-cyan-400">{cta}</p>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
      <div className="mt-5 grid grid-cols-4 gap-2 text-xs">
        <button className="rounded-lg bg-slate-800 py-2">Skip</button>
        <button className="rounded-lg bg-emerald-600 py-2">Join</button>
        <button className="rounded-lg bg-amber-600 py-2">Save</button>
        <button className="rounded-lg bg-indigo-600 py-2">Share</button>
      </div>
    </article>
  );
}
