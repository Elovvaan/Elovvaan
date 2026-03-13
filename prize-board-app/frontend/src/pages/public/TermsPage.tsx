import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';

export const TermsPage = () => (
  <PageShell title="Terms & Rules" subtitle="Play fair, win transparent.">
    <Card>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
        <li>Entries are final after payment confirmation.</li>
        <li>Winners are drawn based on board rules and timestamped logs.</li>
        <li>Fraudulent activity leads to account suspension.</li>
      </ul>
    </Card>
  </PageShell>
);
