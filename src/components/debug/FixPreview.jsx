// src/components/debug/FixPreview.jsx
import { useState } from 'react';
import { GitPullRequest, ChevronDown, ChevronUp, FileCode, ExternalLink, Copy, Check } from 'lucide-react';
import { cn, copyToClipboard, timeAgo } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import SourceCard from '../chat/SourceCard';

export default function FixPreview({ fix, onCreatePR, loading = false }) {
  const [expanded, setExpanded] = useState(true);
  const [activeFile, setActiveFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const files = Array.isArray(fix.files_changed)
    ? fix.files_changed
    : (typeof fix.files_changed === 'string'
        ? (() => { try { return JSON.parse(fix.files_changed); } catch { return []; } })()
        : []);

  const sources = Array.isArray(fix.sources_used)
    ? fix.sources_used
    : (typeof fix.sources_used === 'string'
        ? (() => { try { return JSON.parse(fix.sources_used); } catch { return []; } })()
        : []);

  const confidenceColor = {
    high:   'green',
    medium: 'yellow',
    low:    'red',
  }[fix.confidence] || 'gray';

  async function handleCopy() {
    const content = files[activeFile]?.after || '';
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-surface-900 border border-emerald-500/20 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/3 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <GitPullRequest size={13} className="text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-200">AI Fix Suggestion</span>
            {fix.confidence && (
              <Badge color={confidenceColor} size="xs">
                {fix.confidence} confidence
              </Badge>
            )}
            {fix.created_at && (
              <span className="text-2xs text-gray-600 ml-auto">{timeAgo(fix.created_at)}</span>
            )}
          </div>
        </div>
        {expanded
          ? <ChevronUp size={14} className="text-gray-600" />
          : <ChevronDown size={14} className="text-gray-600" />}
      </div>

      {expanded && (
        <div className="border-t border-white/8 divide-y divide-white/5">
          {/* Explanation */}
          {fix.explanation && (
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-gray-400 mb-1">Explanation</p>
              <p className="text-sm text-gray-300 leading-relaxed">{fix.explanation}</p>
            </div>
          )}

          {/* Files changed */}
          {files.length > 0 && (
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-400">Files Changed</p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-2xs text-gray-600 hover:text-gray-400 transition-colors"
                >
                  {copied ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* File tabs */}
              {files.length > 1 && (
                <div className="flex gap-1 flex-wrap">
                  {files.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveFile(i)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1 text-2xs rounded-lg border transition-all',
                        activeFile === i
                          ? 'bg-brand-600/20 border-brand-500/40 text-brand-300'
                          : 'bg-surface-800 border-white/8 text-gray-500 hover:text-gray-300',
                      )}
                    >
                      <FileCode size={10} />
                      {f.path?.split('/').pop() || `File ${i + 1}`}
                    </button>
                  ))}
                </div>
              )}

              {/* Code viewer */}
              {files[activeFile] && (
                <div className="rounded-xl bg-surface-950 border border-white/5 overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
                    <FileCode size={12} className="text-gray-600" />
                    <code className="text-2xs text-gray-500 font-mono">
                      {files[activeFile].path}
                    </code>
                  </div>
                  <pre className="p-3 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed max-h-64">
                    {files[activeFile].after}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Sources */}
          {sources.length > 0 && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-medium text-gray-400">Knowledge Sources Used</p>
              <div className="space-y-1.5">
                {sources.slice(0, 3).map((s, i) => (
                  <SourceCard key={i} source={s} index={i + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-4 py-3 flex items-center gap-2">
            {!fix.pr_url ? (
              <Button
                size="sm"
                variant="success"
                icon={GitPullRequest}
                loading={loading}
                onClick={() => onCreatePR?.(fix.id)}
              >
                Create Draft PR
              </Button>
            ) : (
              <a
                href={fix.pr_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-emerald-400
                           bg-emerald-400/10 border border-emerald-400/20 rounded-xl
                           hover:bg-emerald-400/15 transition-colors"
              >
                <ExternalLink size={12} />
                View PR #{fix.pr_number}
              </a>
            )}
            <span className="text-2xs text-gray-600">
              PRs are always created as drafts — never auto-merged
            </span>
          </div>
        </div>
      )}
    </div>
  );
}