import Link from 'next/link';

export default function FreeEntryPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-brand-700">Free Entry</h1>
        <p className="text-slate-700">
          Purchase is optional. You can submit a free promotion entry for eligible prize promotions at any time during
          the listed promotion period.
        </p>
        {/* TODO(legal): Validate final AMOE submission windows and required disclosures per jurisdiction. */}
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-brand-700">How to submit a free entry</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-slate-700">
          <li>Find the Board ID for the active prize promotion you want to enter.</li>
          <li>Complete the AMOE form below with accurate contact details.</li>
          <li>Agree to the Official Rules and submit your request.</li>
          <li>Watch for a confirmation email if additional verification is needed.</li>
        </ol>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-brand-700">Eligibility requirements</h2>
        <p className="mt-2 text-slate-700">
          Free promotion entry requests must come from eligible users in eligible jurisdictions and be received before
          the promotion closes.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-brand-700">Entry verification process</h2>
        <p className="mt-2 text-slate-700">
          We may request identity and eligibility verification to prevent fraud and enforce one-person entry limits.
          Incomplete, duplicate, or ineligible submissions may be rejected.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-brand-700">Free Entry Form</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Name
            <input type="text" name="name" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Your full name" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Email
            <input type="email" name="email" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="you@example.com" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
            Board ID
            <input type="text" name="boardId" className="rounded-lg border border-slate-300 px-3 py-2" placeholder="e.g., CITY-2026-03" />
          </label>
          <label className="md:col-span-2 flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" name="agreeRules" className="mt-1" />
            <span>
              I agree to the{' '}
              <Link href="/official-rules" className="font-semibold text-brand-700 underline underline-offset-2">
                Official Rules
              </Link>
              .
            </span>
          </label>
          <button type="submit" className="md:col-span-2 w-fit rounded-lg bg-brand-600 px-5 py-2 font-semibold text-white hover:bg-brand-700">
            Submit Free Entry
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">TODO: Wire form submission to AMOE endpoint after legal and compliance review.</p>
      </section>

      <p className="text-sm text-slate-700">
        See full terms in the{' '}
        <Link href="/official-rules" className="font-semibold text-brand-700 underline underline-offset-2">
          Official Rules
        </Link>
        .
      </p>
    </div>
  );
}
