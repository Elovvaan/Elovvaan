import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <header className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Swipe2Win</h1>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs">Phase 1–2</span>
        </div>
        <p className="text-sm text-slate-400">Foundation rebuild complete: auth, profile, wallet, boards, and join flow.</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">Get started</h2>
        <div className="mt-3 grid gap-2 text-sm">
          <Link href="/auth/register" className="rounded-xl border border-slate-700 px-3 py-2">
            Create account
          </Link>
          <Link href="/auth/login" className="rounded-xl border border-slate-700 px-3 py-2">
            Sign in
          </Link>
          <Link href="/boards" className="rounded-xl border border-slate-700 px-3 py-2">
            Browse boards
          </Link>
        </div>
      </section>
    </div>
  );
}
