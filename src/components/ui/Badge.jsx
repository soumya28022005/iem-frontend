// src/components/ui/Badge.jsx
import { cn } from '../../lib/utils';

export function Badge({ children, color = 'gray', size = 'sm', dot = false, className }) {
  const COLORS = {
    gray:    'bg-gray-400/10    text-gray-400    border-gray-400/20',
    blue:    'bg-blue-400/10    text-blue-400    border-blue-400/20',
    green:   'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
    yellow:  'bg-yellow-400/10  text-yellow-400  border-yellow-400/20',
    red:     'bg-red-400/10     text-red-400     border-red-400/20',
    purple:  'bg-purple-400/10  text-purple-400  border-purple-400/20',
    brand:   'bg-brand-400/10   text-brand-400   border-brand-400/20',
    sky:     'bg-sky-400/10     text-sky-400     border-sky-400/20',
    amber:   'bg-amber-400/10   text-amber-400   border-amber-400/20',
    violet:  'bg-violet-400/10  text-violet-400  border-violet-400/20',
  };
  const SIZES = {
    xs: 'text-2xs px-1.5 py-0.5 gap-1',
    sm: 'text-xs  px-2   py-0.5 gap-1',
    md: 'text-sm  px-2.5 py-1   gap-1.5',
  };
  const DOT_COLORS = {
    gray:'bg-gray-400', blue:'bg-blue-400', green:'bg-emerald-400',
    yellow:'bg-yellow-400', red:'bg-red-400', purple:'bg-purple-400',
    brand:'bg-brand-400', sky:'bg-sky-400', amber:'bg-amber-400', violet:'bg-violet-400',
  };

  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full border',
      COLORS[color] || COLORS.gray,
      SIZES[size],
      className,
    )}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLORS[color])} />}
      {children}
    </span>
  );
}