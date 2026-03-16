export default function WalletPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Wallet</h1>
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm text-slate-400">Balance</p>
        <p className="text-3xl font-bold">$250.00</p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-emerald-600 py-2">Deposit</button>
          <button className="rounded-xl bg-rose-600 py-2">Withdraw</button>
        </div>
      </section>
    </div>
  );
}
