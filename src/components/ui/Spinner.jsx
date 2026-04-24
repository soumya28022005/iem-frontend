// src/components/ui/Spinner.jsx
import { cn } from '../../lib/utils';

const SIZES = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6', xl: 'w-8 h-8' };

export function Spinner({ size = 'md', className }) {
  return (
    <svg
      className={cn('animate-spin text-current', SIZES[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" className="text-brand-400" />
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    </div>
  );
}