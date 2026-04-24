// src/components/chat/SourceCard.jsx
import { ExternalLink, Clock } from 'lucide-react';
import { cn, getSourceMeta, timeAgo, truncate } from '../../lib/utils';

export default function SourceCard({ source, index, compact = false }) {
  const meta = getSourceMeta(source.source);

  if (compact) {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded-md border font-mono',
        meta.bg, meta.border, meta.color,
      )}>
        <span>{meta.icon}</span>
        [{index}]
      </span>
    );
  }

  return (
    <div className={cn(
      'flex items-start gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150',
      'hover:bg-white/3 cursor-default',
      meta.bg, meta.border,
    )}>
      {/* Index */}
      <span className={cn('font-mono text-xs font-semibold flex-shrink-0 mt-0.5', meta.color)}>
        [{index}]
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn('text-xs font-medium', meta.color)}>
            {meta.icon} {meta.label}
          </span>
          {source.senderName && (
            <span className="text-2xs text-gray-500">from {source.senderName}</span>
          )}
          {source.fileName && (
            <span className="text-2xs text-gray-500 font-mono truncate max-w-[160px]">
              {source.fileName}
            </span>
          )}
          {source.timestamp && (
            <span className="text-2xs text-gray-600 flex items-center gap-0.5 ml-auto">
              <Clock size={10} />
              {timeAgo(source.timestamp)}
            </span>
          )}
        </div>

        {source.excerpt && (
          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
            {source.excerpt}
          </p>
        )}

        {typeof source.score === 'number' && (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1 bg-surface-700 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', meta.color.replace('text-', 'bg-'))}
                style={{ width: `${Math.min(source.score * 100, 100)}%`, opacity: 0.6 }}
              />
            </div>
            <span className="text-2xs text-gray-600 font-mono">
              {(source.score * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}