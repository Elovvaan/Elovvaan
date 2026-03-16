export default function RegisterPage() {
  return (
    <form className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <h1 className="text-xl font-semibold">Register</h1>
      <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Username" />
      <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Email" />
      <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2" placeholder="Password" type="password" />
      <button className="w-full rounded-xl bg-cyan-600 py-2">Create account</button>
    </form>
  );
}
