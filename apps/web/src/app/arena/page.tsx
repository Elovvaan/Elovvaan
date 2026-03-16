const section = ['Featured', 'Live now', 'Open challenges', 'Trending boards', 'Recommended for you'];

export default function ArenaPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Arena Directory</h1>
      <input className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Search arenas" />
      <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
        {['FPS', 'Sports', 'Entry < $10', 'High Prize', 'Live'].map((chip) => (
          <span key={chip} className="rounded-full border border-slate-700 px-3 py-1">{chip}</span>
        ))}
      </div>
      {section.map((s) => (
        <section key={s} className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="font-semibold">{s}</h2>
          <p className="mt-2 text-sm text-slate-400">Discovery list placeholder wired for backend feed/recommendations.</p>
        </section>
      ))}
    </div>
  );
}
