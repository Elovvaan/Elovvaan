import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';

export const ReferralPage = () => (
  <PageShell title="Referral Program" subtitle="Invite friends and get bonus entries">
    <Card>
      <p className="text-sm">Your referral link:</p>
      <p className="mt-2 rounded-lg bg-slate-100 p-2 text-xs">https://swipe2win.app/r/your-code</p>
    </Card>
  </PageShell>
);
