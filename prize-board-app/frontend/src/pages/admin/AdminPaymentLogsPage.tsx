import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { paymentService } from '../../services/paymentService';

export const AdminPaymentLogsPage = () => {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    paymentService.getPaymentLogs().then((d) => setLogs(d as Record<string, unknown>[]));
  }, []);

  return (
    <Card>
      <h1 className="text-2xl font-bold">Payment Logs</h1>
      <pre className="mt-3 overflow-x-auto text-xs text-slate-300">{JSON.stringify(logs, null, 2)}</pre>
    </Card>
  );
};
