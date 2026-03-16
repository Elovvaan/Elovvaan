import Link from 'next/link';

export function AdminNav() {
  return (
    <nav className="mb-6 flex gap-4">
      <Link href="/boards">Boards</Link>
      <Link href="/boards/new">Create Board</Link>
      <Link href="/users">Users</Link>
    </nav>
  );
}
