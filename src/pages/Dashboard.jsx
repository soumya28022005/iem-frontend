// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Github, Rocket, Bug, Send, FileText, Zap, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { ragAPI, githubAPI, deployAPI, debugAPI, ingestAPI } from '../lib/api';
import { Spinner } from '../components/ui/Spinner';
import { timeAgo } from '../lib/utils';

function StatCard({ icon: Icon, label, value, sub, color, to }) {
  const inner = (
    <div className={`card p-4 hover:border-white/15 transition-all duration-150 ${to ? 'cursor-pointer' : ''}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon size={16} className="text-white" />
      </div>
      <div className="text-2xl font-semibold text-gray-100 tabular-nums">{value ?? '—'}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {sub && <div className="text-2xs text-gray-700 mt-1">{sub}</div>}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
}

const QUICK_ACTIONS = [
  { icon: MessageSquare, label: 'Ask a question',   sub: 'RAG-powered Q&A',     to: '/chat',     color: 'bg-brand-600' },
  { icon: Github,        label: 'Connect repo',      sub: 'Index your codebase', to: '/github',   color: 'bg-purple-600' },
  { icon: Rocket,        label: 'Deploy app',        sub: 'Vercel or Railway',   to: '/deploy',   color: 'bg-emerald-600' },
  { icon: Send,          label: 'Connect Telegram',  sub: 'Ingest team chats',   to: '/telegram', color: 'bg-sky-600' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { workspaceId, workspaceName } = useWorkspaceStore();
  const [stats, setStats] = useState(null);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) { setLoading(false); return; }

    Promise.all([
      ragAPI.stats(workspaceId).catch(() => ({ data: {} })),
      ragAPI.history(workspaceId, 5).catch(() => ({ data: [] })),
      debugAPI.errors(workspaceId, { status: 'open' }).catch(() => ({ data: [] })),
      deployAPI.list(workspaceId).catch(() => ({ data: [] })),
      githubAPI.listRepos(workspaceId).catch(() => ({ data: [] })),
    ]).then(([statsRes, historyRes, errorsRes, deploysRes, reposRes]) => {
      setStats({
        queries:     statsRes.data.total_queries   ?? 0,
        tokens:      statsRes.data.total_tokens    ?? 0,
        messages:    statsRes.data.messageCount    ?? 0,
        documents:   statsRes.data.documentCount   ?? 0,
        openErrors:  errorsRes.data.length         ?? 0,
        deployments: deploysRes.data.filter(d => d.status === 'deployed').length,
        repos:       reposRes.data.length          ?? 0,
      });
      setRecentQueries(historyRes.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="md" className="text-brand-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Welcome */}
      <div className="flex items-center gap-3">
        {user?.avatar_url && (
          <img src={user.avatar_url} alt={user.username}
               className="w-10 h-10 rounded-full border border-white/10" />
        )}
        <div>
          <h2 className="text-base font-semibold text-gray-100">
            Welcome back, {user?.username} 👋
          </h2>
          <p className="text-xs text-gray-500">
            {workspaceName ? `Workspace: ${workspaceName}` : 'No workspace selected'}
          </p>
        </div>
      </div>

      {!workspaceId ? (
        <div className="card p-6 text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/10 border border-brand-500/20
                          flex items-center justify-center mx-auto">
            <Zap size={20} className="text-brand-400" />
          </div>
          <p className="text-sm text-gray-300 font-medium">No workspace selected</p>
          <p className="text-xs text-gray-500">
            Create or select a workspace to see your dashboard.
          </p>
          <Link to="/workspace"
                className="inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Go to Workspaces <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={MessageSquare} label="RAG Queries"    value={stats?.queries}     color="bg-brand-600"   to="/chat" />
            <StatCard icon={FileText}      label="Knowledge items" value={(stats?.messages ?? 0) + (stats?.documents ?? 0)} color="bg-sky-600" sub={`${stats?.messages ?? 0} msgs · ${stats?.documents ?? 0} docs`} />
            <StatCard icon={Rocket}        label="Live deployments" value={stats?.deployments} color="bg-emerald-600" to="/deploy" />
            <StatCard icon={Bug}           label="Open errors"    value={stats?.openErrors}  color="bg-red-600"    to="/debug" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick actions */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {QUICK_ACTIONS.map(({ icon: Icon, label, sub, to, color }) => (
                  <Link key={to} to={to}
                        className="card p-3 hover:border-white/15 transition-all duration-150 space-y-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                      <Icon size={13} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-200">{label}</p>
                      <p className="text-2xs text-gray-600">{sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent queries */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Queries</h3>
                <Link to="/chat" className="text-2xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-0.5">
                  View all <ArrowRight size={10} />
                </Link>
              </div>

              {recentQueries.length === 0 ? (
                <div className="card p-4 text-center">
                  <p className="text-xs text-gray-600">No queries yet. Start chatting!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentQueries.map(q => (
                    <div key={q.id} className="card px-3 py-2.5 hover:border-white/15 transition-colors">
                      <p className="text-xs text-gray-300 line-clamp-1">{q.question}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-2xs text-gray-600">{q.tokens_used} tokens</span>
                        <span className="text-2xs text-gray-700">{q.latency_ms}ms</span>
                        <span className="text-2xs text-gray-700 ml-auto">{timeAgo(q.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}