import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';

export const PaymentConfirmationPage = () => {
  const [params] = useSearchParams();

  return (
    <PageShell title="Payment Confirmation" subtitle="Stripe transaction status">
      <Card>
        <p className="text-sm">Board ID: <strong>{params.get('boardId')}</strong></p>
        <p className="text-sm">Payment Intent: <strong>{params.get('paymentIntentId')}</strong></p>
        <p className="text-sm break-all">Client Secret: <strong>{params.get('clientSecret')}</strong></p>
        <p className="mt-3 text-xs text-emerald-700">If this payment is successful, your entries will show in your dashboard.</p>
      </Card>
    </PageShell>
  );
};
