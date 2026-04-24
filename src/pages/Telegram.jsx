// src/pages/Telegram.jsx
import { useState, useEffect } from 'react';
import { Send, CheckCircle, AlertCircle, Link2Off, RefreshCw } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { telegramAPI } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getErrorMessage } from '../lib/utils';

export default function Telegram() {
  const { workspaceId, workspaceName } = useWorkspaceStore();
  const [botToken, setBotToken] = useState('');
  const [status, setStatus] = useState(null);   // { connected, botUsername, pendingUpdates }
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return; }
    telegramAPI.status(workspaceId)
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ connected: false }))
      .finally(() => setLoading(false));
  }, [workspaceId]);

  async function connect() {
    if (!botToken.trim() || !workspaceId) return;
    setConnecting(true);
    setError('');
    try {
      const { data } = await telegramAPI.connect({ workspaceId, botToken });
      setStatus({ connected: true, botUsername: data.botUsername });
      setBotToken('');
    } catch (e) {
      setError(getErrorMessage(e));
    }
    setConnecting(false);
  }

  async function disconnect() {
    setDisconnecting(true);
    try {
      await telegramAPI.disconnect({ workspaceId });
      setStatus({ connected: false });
    } catch {}
    setDisconnecting(false);
  }

  async function refreshStatus() {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const { data } = await telegramAPI.status(workspaceId);
      setStatus(data);
    } catch {}
    setLoading(false);
  }

  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-sm text-gray-600">Select a workspace first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-xl">
      {/* Status card */}
      {loading ? (
        <div className="card p-6 flex justify-center"><Spinner size="md" className="text-brand-400" /></div>
      ) : status?.connected ? (
        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20
                            flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200">Bot Connected</p>
              <p className="text-xs text-emerald-400">@{status.botUsername}</p>
            </div>
            <Button size="sm" variant="ghost" icon={RefreshCw} onClick={refreshStatus} className="ml-auto" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-800 border border-white/8 rounded-xl p-3">
              <p className="text-2xs text-gray-600 mb-1">Workspace</p>
              <p className="text-xs font-medium text-gray-300 truncate">{workspaceName}</p>
            </div>
            {status.pendingUpdates !== undefined && (
              <div className="bg-surface-800 border border-white/8 rounded-xl p-3">
                <p className="text-2xs text-gray-600 mb-1">Pending updates</p>
                <p className="text-xs font-medium text-gray-300">{status.pendingUpdates}</p>
              </div>
            )}
          </div>

          <div className="bg-surface-800 border border-white/8 rounded-xl p-3 space-y-1">
            <p className="text-2xs font-medium text-gray-400">Webhook URL</p>
            <code className="text-2xs text-gray-500 break-all">{status.webhookUrl}</code>
          </div>

          <Button size="sm" variant="danger" icon={Link2Off} loading={disconnecting} onClick={disconnect}>
            Disconnect Bot
          </Button>
        </div>
      ) : (
        <div className="card p-5 space-y-5">
          {/* Instructions */}
          <div className="bg-surface-800 border border-white/8 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-300">Setup Instructions</p>
            {[
              'Open @BotFather on Telegram',
              'Send /newbot and follow the prompts',
              'Copy the bot token (looks like 123456:ABC-DEF…)',
              'Add the bot to your team group',
              'Paste the token below and connect',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-600/20 text-brand-400 text-2xs
                                 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-xs text-gray-400">{step}</p>
              </div>
            ))}
          </div>

          {/* Token input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Bot Token</label>
            <input
              type="password"
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && connect()}
              placeholder="123456789:AABBcc…"
              className="input-base font-mono"
            />
            {error && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertCircle size={12} />
                {error}
              </div>
            )}
          </div>

          <Button
            size="md"
            variant="primary"
            icon={Send}
            loading={connecting}
            disabled={!botToken.trim()}
            onClick={connect}
          >
            Connect Bot
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="card p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-400">What gets ingested?</p>
        <div className="space-y-1.5">
          {[
            ['Text messages', 'All group messages are stored and embedded for RAG'],
            ['Voice notes',   'Transcribed automatically using OpenAI Whisper'],
            ['Documents',     '.txt and .json files shared in the group'],
          ].map(([label, desc]) => (
            <div key={label} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-300">{label}</p>
                <p className="text-2xs text-gray-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}