import { Card } from '../../components/Card';

export const TermsPage = () => (
  <Card className="space-y-4">
    <h1 className="text-2xl font-bold">Terms of Service</h1>
    <p className="text-slate-300">By using Swipe2Win, you agree to platform rules, payment policies, and fair participation requirements.</p>
    <h2 className="text-xl font-semibold">Rules</h2>
    <ul className="list-disc space-y-2 pl-5 text-slate-300">
      <li>Only verified accounts can purchase entries.</li>
      <li>No fraudulent payment behavior is allowed.</li>
      <li>Winners are chosen according to published draw mechanics.</li>
    </ul>
  </Card>
);
