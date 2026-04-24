// src/components/debug/PRCard.jsx
import { GitPullRequest, ExternalLink, FileCode, Clock } from 'lucide-react';
import { cn, timeAgo, truncate } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export default function PRCard({ pr }) {
  const files = (() => {
    try { return JSON.parse(pr.files_changed || '[]'); } catch { return []; }
  })();

  return (
    <div className="bg-surface-900 border border-white/8 rounded-2xl p-4 hover:border-white/15 transition-colors">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20
                        flex items-center justify-center flex-shrink-0">
          <GitPullRequest size={15} className="text-emerald-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-200">
                  PR #{pr.pr_number}
                </span>
                <Badge color="purple" size="xs">
                  {pr.error_type || 'Fix'}
                </Badge>
                <Badge color="gray" size="xs">draft</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                {truncate(pr.explanation, 140)}
              </p>
            </div>

            <a
              href={pr.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300
                         transition-colors flex-shrink-0 mt-0.5"
            >
              <ExternalLink size={12} />
              View
            </a>
          </div>

          {/* Error snippet */}
          {pr.error_message && (
            <div className="px-2.5 py-1.5 bg-red-400/5 border border-red-400/15 rounded-lg">
              <p className="text-2xs text-red-400/80 font-mono truncate">{pr.error_message}</p>
            </div>
          )}

          {/* Files + meta */}
          <div className="flex items-center gap-3 flex-wrap">
            {files.length > 0 && (
              <div className="flex items-center gap-1 text-2xs text-gray-600">
                <FileCode size={10} />
                {files.length} file{files.length !== 1 ? 's' : ''} changed
              </div>
            )}
            {pr.repo_full_name && (
              <span className="text-2xs text-gray-600 font-mono">{pr.repo_full_name}</span>
            )}
            {pr.created_at && (
              <span className="flex items-center gap-1 text-2xs text-gray-700 ml-auto">
                <Clock size={10} />
                {timeAgo(pr.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}