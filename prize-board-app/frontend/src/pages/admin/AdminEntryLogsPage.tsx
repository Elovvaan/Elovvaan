import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';

export const AdminEntryLogsPage = () => (
  <PageShell title="Entry Logs" subtitle="Track all board entries">
    <Card>
      <p className="text-sm">Connect this page to <code>/admin/entries/logs</code> for operational reporting.</p>
    </Card>
  </PageShell>
);
