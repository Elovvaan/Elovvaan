import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';

export const AdminPaymentLogsPage = () => (
  <PageShell title="Payment Logs" subtitle="Audit Stripe transactions">
    <Card>
      <p className="text-sm">Connect this page to <code>/admin/payments/logs</code> for full history.</p>
    </Card>
  </PageShell>
);
