// src/components/chat/ChatInput.jsx
import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const SUGGESTIONS = [
  'What did we decide about the auth system last week?',
  'Show me how the payment service works',
  'What errors have been most common in production?',
  'Summarize our deployment process',
];

export default function ChatInput({ onSend, disabled = false, showSuggestions = false }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
  }, [value]);

  function handleSend() {
    const q = value.trim();
    if (!q || disabled) return;
    onSend(q);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="space-y-3">
      {/* Suggestion chips — show only when chat is empty */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 animate-fade-in">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setValue(s); textareaRef.current?.focus(); }}
              className="px-3 py-1.5 text-xs text-gray-400 bg-surface-800 border border-white/8
                         rounded-full hover:border-brand-500/40 hover:text-gray-200
                         hover:bg-surface-700 transition-all duration-150"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className={cn(
        'flex items-end gap-2 bg-surface-800 border rounded-2xl px-4 py-3',
        'transition-all duration-150',
        disabled ? 'border-white/5 opacity-70' : 'border-white/10 focus-within:border-brand-500/50',
      )}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          placeholder="Ask anything about your team's knowledge…"
          rows={1}
          className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600
                     resize-none outline-none leading-relaxed max-h-40"
        />

        <div className="flex items-center gap-1 flex-shrink-0 pb-0.5">
          <span className="text-2xs text-gray-700 mr-1 hidden sm:block">⏎ send</span>
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150',
              value.trim() && !disabled
                ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm'
                : 'bg-surface-700 text-gray-600 cursor-not-allowed',
            )}
          >
            {disabled
              ? <StopCircle size={15} className="text-brand-400" />
              : <Send size={14} />}
          </button>
        </div>
      </div>

      <p className="text-2xs text-gray-700 text-center">
        Every answer includes source references from your knowledge base
      </p>
    </div>
  );
}