import { PageHero } from '@/components/page-hero';

export default function DownloadPage() {
  return (
    <div>
      <PageHero
        title="Download Swipe2Win"
        subtitle="Available on iOS and Android. Join the leaderboard in minutes."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <a href="#" className="rounded-xl border border-slate-200 p-6 hover:border-brand-300 hover:bg-brand-50">
          <p className="text-sm uppercase tracking-wide text-slate-500">iOS</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-700">Download on the App Store</h2>
        </a>
        <a href="#" className="rounded-xl border border-slate-200 p-6 hover:border-brand-300 hover:bg-brand-50">
          <p className="text-sm uppercase tracking-wide text-slate-500">Android</p>
          <h2 className="mt-2 text-2xl font-bold text-brand-700">Get it on Google Play</h2>
        </a>
      </div>
    </div>
  );
}
