import Link from 'next/link';

export function ComplianceNotice() {
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/70 px-4 py-3 text-sm text-brand-900">
      <p className="font-semibold">NO PURCHASE NECESSARY. Free entry available. See Official Rules.</p>
      <div className="mt-2 flex flex-wrap gap-4 font-medium">
        <Link href="/free-entry" className="underline decoration-brand-400 underline-offset-2 hover:text-brand-700">
          Free Entry
        </Link>
        <Link href="/official-rules" className="underline decoration-brand-400 underline-offset-2 hover:text-brand-700">
          Official Rules
        </Link>
      </div>
    </div>
  );
}
