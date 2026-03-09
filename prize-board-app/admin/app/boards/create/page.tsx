export default function CreateBoardPage() {
  return (
    <main className="space-y-4 rounded-lg bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">Create Board</h1>
      <p className="text-sm text-slate-500">Board creation UI for prize configuration, spot caps, and entry pricing.</p>
      <form className="grid gap-4 md:grid-cols-2">
        <label className="text-sm">Board title<input className="mt-1 w-full rounded border p-2" placeholder="Luxury Vacation Raffle" /></label>
        <label className="text-sm">Prize name<input className="mt-1 w-full rounded border p-2" placeholder="7-night Maldives Trip" /></label>
        <label className="text-sm">Entry price<input className="mt-1 w-full rounded border p-2" placeholder="25" /></label>
        <label className="text-sm">Total spots<input className="mt-1 w-full rounded border p-2" placeholder="100" /></label>
        <button className="rounded bg-indigo-600 px-4 py-2 text-white md:col-span-2" type="button">Save board</button>
      </form>
    </main>
  );
}
