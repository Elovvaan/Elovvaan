import { PageHero } from '@/components/page-hero';

const steps = [
  'Create your Swipe2Win profile and choose your first game mode.',
  'Complete swipe missions to earn entries and XP.',
  'Watch your ranking move on the live prize boards.',
  'Enter sweepstakes draws and claim rewards in-app.'
];

export default function HowItWorksPage() {
  return (
    <div>
      <PageHero title="How It Works" subtitle="A simple loop: swipe, score, rank, and redeem." />
      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={step} className="rounded-xl border border-slate-200 p-5">
            <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
              {i + 1}
            </span>
            <span className="text-slate-700">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
