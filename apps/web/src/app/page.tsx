import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Swipe2Win</h1>
      <p>Simple prize board platform MVP.</p>
      <div className="flex gap-3">
        <Link className="rounded bg-blue-600 px-4 py-2 text-white" href="/register">Get Started</Link>
        <Link className="rounded border px-4 py-2" href="/boards">View Boards</Link>
      </div>
    </div>
  );
}
