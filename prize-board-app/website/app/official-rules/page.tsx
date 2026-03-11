export default function OfficialRulesPage() {
  const sections = [
    {
      title: 'No Purchase Necessary',
      body: 'NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE DOES NOT INCREASE YOUR CHANCES OF WINNING. Participation can occur through free promotion entry methods.'
    },
    {
      title: 'Eligibility',
      body: 'Open to legal residents in eligible jurisdictions who meet published age and account requirements at the time of promotion entry.'
    },
    {
      title: 'Promotion Period',
      body: 'Each prize promotion has a stated start and end time. Entries received outside the listed promotion period are void.'
    },
    {
      title: 'How to Enter',
      body: 'Users may enter a promotion through in-app actions as described on each board detail screen and in the promotion listing.'
    },
    {
      title: 'Free Alternative Method of Entry (AMOE)',
      body: 'A free entry method is available for each promotion. Visit the Free Entry page for instructions and required verification steps.'
    },
    {
      title: 'Entry Limits',
      body: 'Entry limits, if any, are stated per promotion. Attempts to exceed limits using multiple identities, devices, or automated means may result in disqualification.'
    },
    {
      title: 'Winner Selection and Odds',
      body: 'Winners are selected using the method disclosed for each promotion. Odds of winning depend on the number of eligible promotion entries received.'
    },
    {
      title: 'Prize Verification and Delivery',
      body: 'Potential winners must complete identity and eligibility verification. Failure to provide requested information may forfeit prize eligibility.'
    },
    {
      title: 'Disqualification / Fraud Prevention',
      body: 'Sponsor may disqualify entries that violate these rules, platform terms, or anti-fraud protections, including manipulated or automated activity.'
    },
    {
      title: 'Sponsor / Administrator',
      body: 'Swipe2Win is the sponsor and administrator of promotions unless otherwise disclosed in a specific promotion listing.'
    },
    {
      title: 'Disputes / Governing Law',
      body: 'Disputes are subject to the governing law and dispute process described in our Terms. Void where prohibited.'
    }
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-brand-700">Official Sweepstakes Rules</h1>
        <p className="rounded-lg border border-brand-300 bg-brand-50 p-4 text-sm font-bold text-brand-900">
          NO PURCHASE NECESSARY TO ENTER OR WIN. A PURCHASE DOES NOT INCREASE YOUR CHANCES OF WINNING.
        </p>
        <p className="text-sm text-slate-600">Draft summary only. TODO(legal): Confirm jurisdiction-specific rule language and publication dates before launch.</p>
      </header>

      <div className="space-y-4">
        {sections.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-brand-700">{section.title}</h2>
            <p className="mt-2 text-slate-700">{section.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
