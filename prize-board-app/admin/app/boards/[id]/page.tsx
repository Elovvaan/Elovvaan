export default function BoardDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Board Detail: {params.id}</h1>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded bg-white p-4 shadow">
          <h2 className="font-semibold">Entry Flow</h2>
          <p className="text-sm text-slate-600">Checkout intent, payment confirmation, and slot reservation in one timeline.</p>
        </article>
        <article className="rounded bg-white p-4 shadow">
          <h2 className="font-semibold">Real-time Updates</h2>
          <p className="text-sm text-slate-600">Live counters wired to WebSocket gateway events for board updates and winners.</p>
        </article>
        <article className="rounded bg-white p-4 shadow">
          <h2 className="font-semibold">Push Notifications</h2>
          <p className="text-sm text-slate-600">Admin-triggered alerts: board almost full, winner selected, payout completed.</p>
        </article>
      </section>
    </main>
  );
}
