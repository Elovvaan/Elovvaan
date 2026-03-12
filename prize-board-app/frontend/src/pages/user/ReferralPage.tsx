import { useEffect, useState } from 'react';
import { Card } from '../../components/Card';
import { userService } from '../../services/userService';

export const ReferralPage = () => {
  const [referralLink, setReferralLink] = useState('');
  const [xpRewards, setXpRewards] = useState<string[]>([]);

  useEffect(() => {
    userService.referrals().then((d) => {
      setReferralLink(d.referralLink);
      setXpRewards(d.xpRewards);
    });
  }, []);

  return (
    <Card>
      <h1 className="text-2xl font-bold">Referral Program</h1>
      <p className="mt-3 break-all rounded-lg bg-slate-800 p-3 text-sm">{referralLink}</p>
      <ul className="mt-4 list-disc pl-5 text-slate-300">{xpRewards.map((reward) => <li key={reward}>{reward}</li>)}</ul>
    </Card>
  );
};
