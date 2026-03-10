export function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg bg-white p-4 shadow">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </article>
  );
}
