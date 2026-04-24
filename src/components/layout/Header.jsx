// src/components/layout/Header.jsx
import { useLocation } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { ChevronDown, Bell } from 'lucide-react';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard',  sub: 'Overview of your workspace' },
  '/chat':      { title: 'RAG Chat',   sub: 'Ask questions with source attribution' },
  '/github':    { title: 'GitHub',     sub: 'Repositories and pull requests' },
  '/deploy':    { title: 'Deploy',     sub: 'Deploy frontend and backend apps' },
  '/debug':     { title: 'Debug',      sub: 'Error detection and AI-powered fixes' },
  '/telegram':  { title: 'Telegram',   sub: 'Connect your team bot' },
  '/workspace': { title: 'Workspace',  sub: 'Manage your workspace and members' },
};

export default function Header() {
  const { pathname } = useLocation();
  const { workspaceName } = useWorkspaceStore();
  const meta = PAGE_TITLES[pathname] || { title: 'SoumyaOps', sub: '' };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-white/8 flex-shrink-0">
      <div>
        <h1 className="text-sm font-semibold text-gray-100">{meta.title}</h1>
        {meta.sub && <p className="text-xs text-gray-500 mt-0.5">{meta.sub}</p>}
      </div>

      <div className="flex items-center gap-2">
        {workspaceName && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-800 border border-white/8
                          rounded-xl text-xs text-gray-300 cursor-pointer hover:border-white/15 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {workspaceName}
            <ChevronDown size={12} className="text-gray-500" />
          </div>
        )}
      </div>
    </header>
  );
}