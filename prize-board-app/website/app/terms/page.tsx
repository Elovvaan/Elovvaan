export default function TermsPage() {
  const sections = [
    'Platform overview',
    'Eligibility',
    'User accounts',
    'Creator promotions',
    'Prize verification',
    'Payments',
    'Fraud and abuse',
    'Dispute resolution',
    'Liability limitations',
    'Contact information'
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-brand-700">Terms of Service</h1>
        <p className="text-slate-700">These terms govern access to Swipe2Win promotional experiences and related services.</p>
        {/* TODO(legal): Replace placeholder legal text with approved long-form contract language before production launch. */}
      </header>

      <div className="space-y-4">
        {sections.map((title) => (
          <section key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-700">{title}</h2>
            <p className="mt-2 text-slate-700">
              Swipe2Win provides promotional sweepstakes participation tools, entry tracking, and prize promotion
              administration features. This section summarizes how {title.toLowerCase()} is handled on the platform.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
