const feed = [
  { at: '09:42', event: 'board_update', detail: 'Luxury Vacation Raffle reached 84/100 spots.' },
  { at: '09:40', event: 'entry_added', detail: 'New paid entry from user #9f1a.' },
  { at: '09:31', event: 'winner_selected', detail: 'Gaming Setup Giveaway winner published.' }
];

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ['Active Boards', '8'],
          ['Entries Today', '142'],
          ['Payments Settled', '$6,130'],
          ['Push Delivered', '97.8%']
        ].map(([label, value]) => (
          <article key={label} className="rounded-lg bg-white p-4 shadow">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-lg bg-white p-4 shadow">
        <h2 className="text-lg font-semibold">Real-time Gateway Feed</h2>
        <p className="text-sm text-slate-500">Socket events from the notifications gateway.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {feed.map((item) => (
            <li key={`${item.at}-${item.event}`} className="rounded border border-slate-200 p-2">
              <span className="mr-2 font-mono text-slate-500">{item.at}</span>
              <span className="mr-2 rounded bg-indigo-100 px-2 py-0.5 text-indigo-700">{item.event}</span>
              <span>{item.detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
