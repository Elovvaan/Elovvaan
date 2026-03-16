export default function ProfilePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="font-semibold">@demoPlayer</p>
        <p className="mt-2 text-sm text-slate-400">Wins 24 • Losses 11 • Earnings $460 • Favorite FPS</p>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-400">
        AI insights placeholder: skill score trend, challenge acceptance rate, rivalry detection.
      </section>
    </div>
  );
}
