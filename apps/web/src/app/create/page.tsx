export default function CreatePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Create</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">Create Challenge</h2>
        <p className="text-sm text-slate-400">Guided flow scaffold for public/direct call-out challenge creation.</p>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">Create Board</h2>
        <p className="text-sm text-slate-400">Configure category, entry fee, spot count, and prize splits.</p>
      </section>
    </div>
  );
}
