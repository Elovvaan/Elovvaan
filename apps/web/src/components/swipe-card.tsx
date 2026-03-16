export function SwipeCard({
  title,
  subtitle,
  cta,
  score,
  onAction,
}: {
  title: string;
  subtitle: string;
  cta: string;
  score?: number;
  onAction?: (action: 'SWIPE_LEFT' | 'JOIN' | 'SAVE' | 'SHARE') => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-lg">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-wider text-cyan-400">{cta}</p>
        {typeof score === 'number' ? (
          <span className="rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-200">Rec {score.toFixed(1)}</span>
        ) : null}
      </div>
      <h3 className="mt-2 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-300">{subtitle}</p>
      <div className="mt-5 grid grid-cols-4 gap-2 text-xs">
        <button onClick={() => onAction?.('SWIPE_LEFT')} className="rounded-lg bg-slate-800 py-2">
          Skip
        </button>
        <button onClick={() => onAction?.('JOIN')} className="rounded-lg bg-emerald-600 py-2">
          Join
        </button>
        <button onClick={() => onAction?.('SAVE')} className="rounded-lg bg-amber-600 py-2">
          Save
        </button>
        <button onClick={() => onAction?.('SHARE')} className="rounded-lg bg-indigo-600 py-2">
          Share
        </button>
      </div>
    </article>
  );
}
