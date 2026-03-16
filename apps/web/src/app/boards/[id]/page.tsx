export default function BoardDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Board: {params.id}</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-300">Provably fair winner picker structure is scaffolded in backend service layer.</p>
        <button className="mt-4 w-full rounded-xl bg-emerald-600 py-3 font-semibold">Join Board</button>
      </section>
    </div>
  );
}
