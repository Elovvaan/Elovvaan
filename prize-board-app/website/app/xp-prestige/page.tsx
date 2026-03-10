import { PageHero } from '@/components/page-hero';

export default function XpPrestigePage() {
  return (
    <div>
      <PageHero
        title="XP + Prestige"
        subtitle="Your activity earns XP. Your consistency earns prestige. Higher tiers unlock better rewards and limited boards."
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-brand-50 text-slate-700">
            <tr>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">XP Needed</th>
              <th className="px-4 py-3">Benefits</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Bronze', '0 - 2,999', 'Starter rewards and beginner board access'],
              ['Silver', '3,000 - 9,999', 'Entry multipliers and weekly booster packs'],
              ['Gold', '10,000 - 24,999', 'Priority board entry and premium drops'],
              ['Prestige', '25,000+', 'Exclusive events, VIP support, and elite boards']
            ].map(([tier, xp, benefits]) => (
              <tr key={tier} className="border-t border-slate-200">
                <td className="px-4 py-3 font-semibold text-brand-700">{tier}</td>
                <td className="px-4 py-3">{xp}</td>
                <td className="px-4 py-3">{benefits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
