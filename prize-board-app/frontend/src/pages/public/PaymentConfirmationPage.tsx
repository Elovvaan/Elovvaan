import { useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';

export const PaymentConfirmationPage = () => {
  const [params] = useSearchParams();

  return (
    <Card className="mx-auto max-w-xl text-center">
      <h1 className="text-2xl font-bold">Stripe Test Payment Confirmation</h1>
      <p className="mt-3 text-slate-300">Your payment intent has been created in test mode. Confirm in your Stripe test checkout flow.</p>
      <div className="mt-6 rounded-xl bg-slate-800 p-4 text-left text-sm text-slate-300">
        <p>Payment ID: {params.get('paymentId')}</p>
        <p>Client Secret: {params.get('clientSecret')}</p>
      </div>
    </Card>
  );
};
