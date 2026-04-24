// src/pages/GitHub.jsx
import { useState, useEffect, useCallback } from 'react';
import { Github, Plus, Trash2, RefreshCw, GitPullRequest, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { githubAPI } from '../lib/api';
import PRCard from '../components/debug/PRCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { getErrorMessage, timeAgo } from '../lib/utils';

const TABS = ['Repositories', 'Pull Requests'];

export default function GitHub() {
  const { workspaceId } = useWorkspaceStore();
  const [tab, setTab] = useState(0);
  const [repos, setRepos] = useState([]);
  const [prs, setPRs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repoUrl, setRepoUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const [reposRes, prsRes] = await Promise.all([
        githubAPI.listRepos(workspaceId),
        githubAPI.listPRs(workspaceId),
      ]);
      setRepos(reposRes.data);
      setPRs(prsRes.data);
    } catch {}
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  async function addRepo() {
    if (!repoUrl.trim()) return;
    setAdding(true);
    setError('');
    try {
      await githubAPI.addRepo({ workspaceId, repoUrl: repoUrl.trim() });
      setRepoUrl('');
      load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
    setAdding(false);
  }

  async function removeRepo(id) {
    setActionLoading(l => ({ ...l, [id]: 'removing' }));
    try {
      await githubAPI.removeRepo(id, workspaceId);
      setRepos(r => r.filter(x => x.id !== id));
    } catch {}
    setActionLoading(l => ({ ...l, [id]: null }));
  }

  async function reanalyze(id) {
    setActionLoading(l => ({ ...l, [id]: 'analyzing' }));
    try {
      await githubAPI.reanalyze(id, workspaceId);
      setTimeout(load, 2000);
    } catch {}
    setActionLoading(l => ({ ...l, [id]: null }));
  }

  const stackLabel = (repo) => {
    const s = repo.detected_stack;
    if (!s) return null;
    const stack = typeof s === 'string' ? (() => { try { return JSON.parse(s); } catch { return {}; } })() : s;
    const parts = [stack.frontend, stack.backend].filter(Boolean);
    return parts.join(' + ') || repo.detected_type;
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Add repo */}
      <div className="card p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-300">Connect Repository</p>
        <div className="flex gap-2">
          <input
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addRepo()}
            placeholder="https://github.com/owner/repo"
            className="input-base flex-1"
          />
          <Button size="md" icon={Plus} loading={adding} onClick={addRepo}
                  disabled={!repoUrl.trim()}>
            Add
          </Button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <p className="text-2xs text-gray-700">
          SoumyaOps will clone and index the repo into your knowledge base.
          Code is embedded for RAG Q&A and debug context.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 p-1 bg-surface-800 border border-white/8 rounded-xl">
          {TABS.map((t, i) => (
            <button key={t} onClick={() => setTab(i)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      tab === i ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-300'
                    }`}>
              {t}
              {i === 0 && <span className="ml-1.5 text-2xs text-gray-600">({repos.length})</span>}
              {i === 1 && <span className="ml-1.5 text-2xs text-gray-600">({prs.length})</span>}
            </button>
          ))}
        </div>
        <Button size="sm" variant="ghost" icon={RefreshCw} onClick={load} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Spinner size="md" className="text-brand-400" />
        </div>
      ) : (
        <>
          {/* Repos */}
          {tab === 0 && (
            <div className="space-y-2">
              {repos.length === 0 ? (
                <div className="card p-8 text-center">
                  <Github size={28} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No repositories connected yet.</p>
                </div>
              ) : repos.map(repo => (
                <div key={repo.id} className="card px-4 py-3 hover:border-white/15 transition-colors">
                  <div className="flex items-start gap-3">
                    <Github size={15} className="text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-gray-200">{repo.repo_full_name}</span>
                        {repo.detected_type && (
                          <Badge color="brand" size="xs">{repo.detected_type}</Badge>
                        )}
                        {stackLabel(repo) && (
                          <Badge color="gray" size="xs">{stackLabel(repo)}</Badge>
                        )}
                        {repo.last_analyzed ? (
                          <Badge color="green" size="xs" dot>Indexed</Badge>
                        ) : (
                          <Badge color="yellow" size="xs" dot>Analyzing…</Badge>
                        )}
                      </div>
                      {repo.last_analyzed && (
                        <p className="text-2xs text-gray-600 mt-0.5 flex items-center gap-1">
                          <Clock size={10} />
                          Indexed {timeAgo(repo.last_analyzed)}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={RefreshCw}
                        loading={actionLoading[repo.id] === 'analyzing'}
                        onClick={() => reanalyze(repo.id)}
                      >
                        Re-index
                      </Button>
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={Trash2}
                        loading={actionLoading[repo.id] === 'removing'}
                        onClick={() => removeRepo(repo.id)}
                        className="text-red-500/60 hover:text-red-400 hover:bg-red-400/10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRs */}
          {tab === 1 && (
            <div className="space-y-3">
              {prs.length === 0 ? (
                <div className="card p-8 text-center">
                  <GitPullRequest size={28} className="text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No pull requests created yet.</p>
                  <p className="text-2xs text-gray-700 mt-1">Fix errors in the Debug tab to generate PRs.</p>
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