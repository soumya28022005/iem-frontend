// src/components/ui/Button.jsx
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

const VARIANTS = {
  primary:   'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm',
  secondary: 'bg-surface-800 hover:bg-surface-700 text-gray-200 border border-white/10',
  ghost:     'hover:bg-white/5 text-gray-400 hover:text-gray-100',
  danger:    'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/25',
  success:   'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/25',
};

const SIZES = {
  xs: 'h-6  px-2   text-xs  gap-1   rounded-lg',
  sm: 'h-7  px-3   text-xs  gap-1.5 rounded-xl',
  md: 'h-9  px-4   text-sm  gap-2   rounded-xl',
  lg: 'h-11 px-5   text-sm  gap-2   rounded-2xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconRight: IconRight,
  className,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'active:scale-[0.97]',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'sm' : 'xs'} />
      ) : Icon ? (
        <Icon size={size === 'xs' || size === 'sm' ? 12 : 15} />
      ) : null}
      {children}
      {IconRight && !loading && <IconRight size={size === 'xs' || size === 'sm' ? 12 : 15} />}
    </button>
  );
}