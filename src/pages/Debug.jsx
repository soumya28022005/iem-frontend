// src/pages/Debug.jsx
import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Upload, GitPullRequest } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { debugAPI } from '../lib/api';
import ErrorCard from '../components/debug/ErrorCard';
import FixPreview from '../components/debug/FixPreview';
import PRCard from '../components/debug/PRCard';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { getErrorMessage } from '../lib/utils';

const TABS = ['Errors', 'Fixes', 'Pull Requests'];

export default function Debug() {
  const { workspaceId } = useWorkspaceStore();
  const [tab, setTab] = useState(0);
  const [errors, setErrors] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [prs, setPRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [logInput, setLogInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const [errRes, fixRes] = await Promise.all([
        debugAPI.errors(workspaceId),
        debugAPI.fixes(workspaceId),
      ]);
      setErrors(errRes.data);
      setFixes(fixRes.data);
      const prItems = fixRes.data.filter(f => f.pr_url);
      setPRs(prItems);
    } catch {}
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  async function submitLog() {
    if (!logInput.trim() || !workspaceId) return;
    setSubmitting(true);
    try {
      await debugAPI.ingest({ workspaceId, rawLog: logInput });
      setLogInput('');
      showToast('Log submitted — errors detected!');
      setTimeout(load, 2000);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    }
    setSubmitting(false);
  }

  async function handleFix(logEntryId) {
    setActionLoading(l => ({ ...l, [logEntryId]: 'fix' }));
    try {
      await debugAPI.fix({ logEntryId, workspaceId });
      showToast('Fix generation queued…');
      setTimeout(load, 4000);
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    }
    setActionLoading(l => ({ ...l, [logEntryId]: null }));
  }

  async function handleDismiss(logEntryId) {
    try {
      await debugAPI.dismiss(logEntryId, workspaceId);
      setErrors(e => e.filter(x => x.id !== logEntryId));
    } catch {}
  }

  async function handleCreatePR(fixId) {
    setActionLoading(l => ({ ...l, [fixId]: 'pr' }));
    try {
      const { data } = await debugAPI.createPR({ fixId, workspaceId });
      showToast(`PR #${data.prNumber} created!`);
      load();
    } catch (e) {
      showToast(getErrorMessage(e), 'error');
    }
    setActionLoading(l => ({ ...l, [fixId]: null }));
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl text-sm font-medium
                         animate-slide-down shadow-lg border
                         ${toast.type === 'error'
                           ? 'bg-red-500/20 border-red-500/30 text-red-300'
                           : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'}`}>
          {toast.msg}
        </div>
      )}

      {/* Log paste */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-300">Paste Logs</p>
          <span className="text-2xs text-gray-600">Supports Node.js, Python, Java, Go</span>
        </div>
        <textarea
          value={logInput}
          onChange={e => setLogInput(e.target.value)}
          rows={5}
          placeholder="Paste error logs here…&#10;&#10;Error: Cannot read property 'id' of undefined&#10;    at UserService.getUser (src/services/user.service.js:42:18)"
          className="input-base font-mono text-xs leading-relaxed resize-none"
        />
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="primary"
            icon={Upload}
            loading={submitting}
            onClick={submitLog}
            disabled={!logInput.trim()}
          >
            Detect Errors
          </Button>
          <span className="text-2xs text-gray-600">
            Errors are embedded in your knowledge base for future RAG context
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-surface-800 border border-white/8 rounded-xl">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 ${
                tab === i
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t}
              {i === 0 && errors.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-red-500/20 text-red-400 text-2xs rounded-full">
                  {errors.filter(e => e.status === 'open').length}
                </span>
              )}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={load} />
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Spinner size="md" className="text-brand-400" />
        </div>
      ) : (
        <>
          {/* Errors tab */}
          {tab === 0 && (
            <div className="space-y-2">
              {errors.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm text-gray-600">No errors detected. Paste logs above to get started.</p>
                </div>
              ) : errors.map(err => (
                <ErrorCard
                  key={err.id}
                  error={err}
                  onFix={handleFix}
                  onDismiss={handleDismiss}
                  loading={actionLoading[err.id] === 'fix'}
                />
              ))}
            </div>
          )}

          {/* Fixes tab */}
          {tab === 1 && (
            <div className="space-y-3">
              {fixes.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm text-gray-600">No fix suggestions yet. Generate one from the Errors tab.</p>
                </div>
              ) : fixes.map(fix => (
                <FixPreview
                  key={fix.id}
                  fix={fix}
                  onCreatePR={handleCreatePR}
                  loading={actionLoading[fix.id] === 'pr'}
                />
              ))}
            </div>
          )}

          {/* PRs tab */}
          {tab === 2 && (
            <div className="space-y-3">
              {prs.length === 0 ? (
                <div className="card p-8 text-center">
                  <p className="text-sm text-gray-600">No pull requests created yet.</p>
                </div>
              ) : prs.map(pr => (
                <PRCard key={pr.id} pr={pr} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}