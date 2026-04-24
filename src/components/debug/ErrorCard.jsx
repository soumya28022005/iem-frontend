// src/components/debug/ErrorCard.jsx
import { useState } from 'react';
import { ChevronDown, ChevronUp, Bug, Zap, FileCode, Clock } from 'lucide-react';
import { cn, getStatusMeta, timeAgo } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export default function ErrorCard({ error, onFix, onDismiss, loading = false }) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatusMeta(error.status);

  const statusColorMap = {
    open:       'red',
    fixing:     'yellow',
    fixed:      'blue',
    pr_created: 'green',
    dismissed:  'gray',
  };

  return (
    <div className={cn(
      'bg-surface-900 border rounded-2xl overflow-hidden transition-all duration-150',
      error.status === 'open' ? 'border-red-500/20' : 'border-white/8',
    )}>
      {/* Header row */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <Bug size={14} className={cn(
          error.status === 'open' ? 'text-red-400' : 'text-gray-500',
        )} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-200 truncate">
              {error.error_type || 'UnknownError'}
            </span>
            <Badge color={statusColorMap[error.status] || 'gray'} size="xs" dot>
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-gray-500 truncate mt-0.5">
            {error.error_message}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {error.created_at && (
            <span className="text-2xs text-gray-600 hidden sm:flex items-center gap-1">
              <Clock size={10} />
              {timeAgo(error.created_at)}
            </span>
          )}
          {expanded
            ? <ChevronUp size={14} className="text-gray-600" />
            : <ChevronDown size={14} className="text-gray-600" />}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-white/8 px-4 py-3 space-y-3 animate-slide-down">
          {/* File + line */}
          {error.file_path && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FileCode size={12} />
              <code className="text-gray-400 font-mono">{error.file_path}</code>
              {error.line_number && (
                <span className="text-gray-600">line {error.line_number}</span>
              )}
            </div>
          )}

          {/* Stack trace */}
          {error.stack_trace && (
            <pre className="text-2xs text-gray-500 bg-surface-950 border border-white/5
                            rounded-xl p-3 overflow-x-auto font-mono leading-relaxed max-h-40">
              {error.stack_trace.slice(0, 800)}
              {error.stack_trace.length > 800 && '\n…truncated'}
            </pre>
          )}

          {/* Actions */}
          {error.status === 'open' && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                size="sm"
                variant="primary"
                icon={Zap}
                loading={loading}
                onClick={() => onFix?.(error.id)}
              >
                Generate AI Fix
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss?.(error.id)}
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}