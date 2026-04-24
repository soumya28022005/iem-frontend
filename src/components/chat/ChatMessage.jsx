// src/components/chat/ChatMessage.jsx
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { cn, copyToClipboard, timeAgo } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';
import SourceCard from './SourceCard';

export default function ChatMessage({ message }) {
  const { role, content, sources = [], ts, streaming } = message;
  const isAssistant = role === 'assistant';
  const [showSources, setShowSources] = useState(true);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={cn('flex gap-3 group animate-fade-in', !isAssistant && 'flex-row-reverse')}>
      {/* Avatar */}
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
        isAssistant
          ? 'bg-brand-600 ring-1 ring-brand-500/40'
          : 'bg-surface-700 ring-1 ring-white/10',
      )}>
        {isAssistant
          ? <Bot size={14} className="text-white" />
          : <User size={14} className="text-gray-300" />}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[85%] space-y-2', !isAssistant && 'items-end flex flex-col')}>
        <div className={cn(
          'px-4 py-3 rounded-2xl text-sm leading-relaxed',
          isAssistant
            ? 'bg-surface-800 border border-white/8 text-gray-100 rounded-tl-sm'
            : 'bg-brand-600 text-white rounded-tr-sm',
        )}>
          {/* Streaming cursor */}
          {streaming && !content && (
            <div className="flex items-center gap-2 text-gray-400">
              <Spinner size="xs" className="text-brand-400" />
              <span className="text-xs">Searching knowledge base…</span>
            </div>
          )}

          {/* Markdown content */}
          {content && (
            <ReactMarkdown
              className={cn('prose prose-sm max-w-none', isAssistant ? 'prose-invert' : 'prose-white')}
              components={{
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code className="px-1 py-0.5 bg-black/30 rounded text-xs font-mono text-brand-300" {...props}>
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-surface-950 border border-white/8 rounded-xl p-3 overflow-x-auto my-2">
                      <code className="text-xs font-mono text-gray-200">{children}</code>
                    </pre>
                  );
                },
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 mb-2">{children}</ol>,
                h2: ({ children }) => <h2 className="text-sm font-semibold text-gray-100 mt-3 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-semibold text-gray-200 mt-2 mb-1">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold text-gray-100">{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-brand-500/50 pl-3 text-gray-400 italic my-2">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}

          {/* Streaming blink */}
          {streaming && content && (
            <span className="inline-block w-0.5 h-3.5 bg-brand-400 ml-0.5 animate-blink" />
          )}
        </div>

        {/* Actions + timestamp */}
        {isAssistant && content && !streaming && (
          <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-2xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {ts && (
              <span className="text-2xs text-gray-700">{timeAgo(ts)}</span>
            )}
          </div>
        )}

        {/* Sources */}
        {isAssistant && sources.length > 0 && (
          <div className="w-full space-y-1.5">
            <button
              onClick={() => setShowSources(v => !v)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showSources ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {sources.length} source{sources.length !== 1 ? 's' : ''} used
            </button>
            {showSources && (
              <div className="space-y-1.5 animate-slide-up">
                {sources.map((s, i) => (
                  <SourceCard key={s.id || i} source={s} index={i + 1} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}