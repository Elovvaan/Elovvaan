export function Swipe2WinLogo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="admin-s2w-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#14b8a6" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="84" height="84" rx="20" fill="url(#admin-s2w-gradient)" />
      <path d="M28 60c10 12 34 12 44-10" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
      <circle cx="36" cy="38" r="5" fill="#fff" />
      <circle cx="64" cy="38" r="5" fill="#fff" />
    </svg>
  );
}
