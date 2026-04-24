// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, MessageSquare, Github, Rocket,
  Bug, Send, Settings, LogOut, Zap, ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { cn } from '../../lib/utils';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chat',      icon: MessageSquare,   label: 'RAG Chat',  accent: true },
  { to: '/github',    icon: Github,          label: 'GitHub' },
  { to: '/deploy',    icon: Rocket,          label: 'Deploy' },
  { to: '/debug',     icon: Bug,             label: 'Debug' },
  { to: '/telegram',  icon: Send,            label: 'Telegram' },
  { to: '/workspace', icon: Settings,        label: 'Workspace' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { workspaceName } = useWorkspaceStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="w-56 flex flex-col bg-surface-900 border-r border-white/8 flex-shrink-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/8">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-brand-600 flex items-center justify-center shadow-glow-sm">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-none">SoumyaOps</p>
            <p className="text-2xs text-gray-600 mt-0.5">AI DevOps Platform</p>
          </div>
        </div>
      </div>

      {/* Workspace pill */}
      {workspaceName && (
        <div className="px-3 pt-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-surface-800 border border-white/8
                          rounded-xl text-xs text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="truncate">{workspaceName}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label, accent }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 group',
              isActive
                ? accent
                  ? 'bg-brand-600 text-white shadow-glow-sm'
                  : 'bg-white/8 text-gray-100'
                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300',
            )}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive && accent ? 'text-white' : isActive ? 'text-gray-200' : 'text-gray-600 group-hover:text-gray-400',
                )} />
                <span className="flex-1">{label}</span>
                {isActive && !accent && (
                  <ChevronRight size={12} className="text-gray-600" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="px-3 py-3 border-t border-white/8">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-7 h-7 rounded-full border border-white/15 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">{user.username}</p>
              {user.email && (
                <p className="text-2xs text-gray-600 truncate">{user.email}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-600
                         hover:text-gray-300 hover:bg-white/5 transition-colors flex-shrink-0"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}