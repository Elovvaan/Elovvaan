import { LegalTemplate } from '@/components/legal-template';

export default function SweepstakesRulesPage() {
  return (
    <LegalTemplate
      title="Sweepstakes Rules"
      intro="Official rules explain eligibility, entry windows, draw timing, and prize fulfillment terms."
      bullets={[
        'No purchase is necessary to enter or win.',
        'Odds depend on total eligible entries received.',
        'Winners are selected randomly and notified through verified channels.'
      ]}
    />
  );
}
