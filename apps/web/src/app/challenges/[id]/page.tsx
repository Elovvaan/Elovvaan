export default function ChallengeDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Challenge: {params.id}</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-300">1v1 challenge screen with accept/decline and result recording hooks.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-emerald-600 py-3">Accept</button>
          <button className="rounded-xl bg-rose-600 py-3">Decline</button>
        </div>
      </section>
    </div>
  );
}
