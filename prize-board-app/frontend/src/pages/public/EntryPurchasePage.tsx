import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { PageShell } from '../../components/PageShell';
import { paymentService } from '../../services/paymentService';

export const EntryPurchasePage = () => {
  const { boardId = '' } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await paymentService.createIntent({ boardId, quantity });
      const paymentIntentId = String(response.paymentIntentId ?? response.id ?? 'unknown');
      const clientSecret = String(response.clientSecret ?? '');
      navigate(`/payment-confirmation?boardId=${boardId}&paymentIntentId=${paymentIntentId}&clientSecret=${encodeURIComponent(clientSecret)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Entry Purchase" subtitle="Secure checkout with Stripe">
      <Card>
        <label className="mb-2 block text-sm font-medium">Number of entries</label>
        <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full rounded-lg border px-3 py-2" />
        <div className="mt-4">
          <Button onClick={handleCheckout} disabled={loading}>{loading ? 'Creating payment...' : 'Proceed to Payment'}</Button>
        </div>
      </Card>
    </PageShell>
  );
};
