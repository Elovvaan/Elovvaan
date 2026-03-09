import Link from 'next/link';

export default function Home() {
  return (
    <main className="space-y-3">
      <h1 className="text-2xl font-bold">Prize Board Admin</h1>
      <div className="space-x-4">
        <Link href="/login">Login</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/boards">Boards</Link>
        <Link href="/winners">Winners</Link>
      </div>
    </main>
  );
}
