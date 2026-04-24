// src/pages/ChatRAG.jsx
import { useRef, useEffect } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import { useRAGChat } from '../hooks/useRAGChat';
import { useWorkspaceStore } from '../store/workspaceStore';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import { Button } from '../components/ui/Button';

export default function ChatRAG() {
  const { messages, streaming, error, sendMessage, clearMessages } = useRAGChat();
  const { workspaceId, workspaceName } = useWorkspaceStore();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmpty = messages.length <= 1; // only welcome message

  if (!workspaceId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20
                          flex items-center justify-center mx-auto">
            <MessageSquare size={22} className="text-brand-400" />
          </div>
          <p className="text-sm text-gray-400">
            Select or create a workspace to start chatting with your knowledge base.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-200">
            Knowledge Base · <span className="text-brand-400">{workspaceName}</span>
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">
            {messages.length - 1} message{messages.length !== 2 ? 's' : ''} in this session
          </p>
        </div>
        {!isEmpty && (
          <Button size="sm" variant="ghost" icon={Trash2} onClick={clearMessages}>
            Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-5 pb-4 pr-1">
        {messages.map((msg, i) => (
          <ChatMessage key={msg.id || i} message={msg} />
        ))}
        {error && (
          <div className="px-4 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl
                          text-xs text-red-400 animate-fade-in">
            {error}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 pt-4 border-t border-white/8">
        <ChatInput
          onSend={sendMessage}
          disabled={streaming}
          showSuggestions={isEmpty}
        />
      </div>
    </div>
  );
}