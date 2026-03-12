import clsx from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => (
  <button
    className={clsx(
      'rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
      variant === 'primary'
        ? 'bg-brand-600 text-white hover:bg-brand-700'
        : 'border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700',
      className,
    )}
    {...props}
  />
);
