import Link from 'next/link';

export default function Home() {
  return (
    <main className="space-y-3">
      <h1 className="text-2xl font-bold">Swipe2Win Admin</h1>
      <p className="text-sm text-slate-600">Notifications service, payment flow operations, winners and board management.</p>
      <div className="space-x-4">
        <Link href="/login">Login</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/boards">Boards</Link>
        <Link href="/boards/create">Create board</Link>
        <Link href="/winners">Winners</Link>
      </div>
    </main>
  );
}
