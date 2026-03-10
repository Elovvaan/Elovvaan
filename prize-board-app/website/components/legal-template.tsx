import { PageHero } from './page-hero';

type LegalTemplateProps = {
  title: string;
  intro: string;
  bullets: string[];
};

export function LegalTemplate({ title, intro, bullets }: LegalTemplateProps) {
  return (
    <div>
      <PageHero title={title} subtitle={intro} />
      <ul className="list-disc space-y-3 pl-6 text-slate-700">
        {bullets.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
    </div>
  );
}
