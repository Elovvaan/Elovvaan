type PageHeroProps = {
  title: string;
  subtitle: string;
};

export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="mb-10 rounded-2xl border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-slate-100 p-8 shadow-glow">
      <h1 className="text-3xl font-extrabold text-slate-900 md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-3xl text-base text-slate-700 md:text-lg">{subtitle}</p>
    </section>
  );
}
