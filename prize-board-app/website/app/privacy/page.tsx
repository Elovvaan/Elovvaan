export default function PrivacyPage() {
  const sections = [
    'Data collected',
    'Device information',
    'Payment processing',
    'Cookies and analytics',
    'Fraud monitoring',
    'Data sharing',
    'User rights'
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-brand-700">Privacy Policy</h1>
        <p className="text-slate-700">
          This policy explains how Swipe2Win collects, uses, and protects personal information in connection with prize
          promotions and free promotion entry workflows.
        </p>
        {/* TODO(legal): Confirm final retention timelines and state-specific privacy rights disclosures. */}
      </header>

      <div className="space-y-4">
        {sections.map((title) => (
          <section key={title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-700">{title}</h2>
            <p className="mt-2 text-slate-700">
              We maintain policies and operational controls related to {title.toLowerCase()} to support secure,
              compliant promotion entry and prize fulfillment operations.
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
