// src/pages/Workspace.jsx
import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, UserPlus, Users, Settings } from 'lucide-react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { workspaceAPI } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { getErrorMessage, timeAgo } from '../lib/utils';

export default function Workspace() {
  const { workspaceId, workspaces, setWorkspace, setWorkspaces, addWorkspace } = useWorkspaceStore();
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [inviteModal, setInviteModal] = useState(null); // workspace object
  const [inviteUsername, setInviteUsername] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    workspaceAPI.list()
      .then(r => setWorkspaces(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function create() {
    if (!newName.trim()) return;
    setCreating(true);
    setError('');
    try {
      const { data } = await workspaceAPI.create({ name: newName.trim() });
      addWorkspace(data);
      setWorkspace(data.id, data.name);
      setNewName('');
      showToast('Workspace created!');
    } catch (e) { setError(getErrorMessage(e)); }
    setCreating(false);
  }

  async function invite() {
    if (!inviteUsername.trim() || !inviteModal) return;
    setInviting(true);
    try {
      await workspaceAPI.invite(inviteModal.id, { username: inviteUsername, role: inviteRole });
      setInviteUsername('');
      setInviteModal(null);
      showToast(`${inviteUsername} invited!`);
    } catch (e) { setError(getErrorMessage(e)); }
    setInviting(false);
  }

  async function deleteWs(id) {
    if (!confirm('Delete this workspace? This cannot be undone.')) return;
    try {
      await workspaceAPI.delete(id);
      setWorkspaces(workspaces.filter(w => w.id !== id));
      if (workspaceId === id) setWorkspace(null, null);
    } catch (e) { showToast(getErrorMessage(e)); }
  }

  const roleColor = { owner: 'brand', admin: 'purple', member: 'gray' };

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-xl bg-emerald-500/20
                        border border-emerald-500/30 text-xs text-emerald-300 animate-slide-down shadow-lg">
          {toast}
        </div>
      )}

      {/* Create workspace */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20
                          flex items-center justify-center">
            <Plus size={14} className="text-brand-400" />
          </div>
          <span className="text-sm font-semibold text-gray-200">Create Workspace</span>
        </div>
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && create()}
            placeholder="My Team's Workspace"
            className="input-base flex-1"
          />
          <Button size="md" loading={creating} disabled={!newName.trim()} onClick={create}>
            Create
          </Button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <p className="text-2xs text-gray-700">
          Each workspace has an isolated knowledge base, Pinecone namespace, and team members.
        </p>
      </div>

      {/* Workspace list */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Your Workspaces
        </h3>

        {loading ? (
          <div className="flex items-center justify-center h-24">
            <Spinner size="md" className="text-brand-400" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="card p-8 text-center">
            <Settings size={28} className="text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No workspaces yet. Create one above.</p>
          </div>
        ) : (
          workspaces.map(ws => {
            const isActive = workspaceId === ws.id;
            return (
              <div
                key={ws.id}
                onClick={() => setWorkspace(ws.id, ws.name)}
                className={`card px-4 py-4 cursor-pointer transition-all duration-150 ${
                  isActive
                    ? 'border-brand-500/40 bg-brand-500/5'
                    : 'hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Active indicator */}
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isActive ? 'bg-brand-600 border-brand-500' : 'border-white/15'
                  }`}>
                    {isActive && <Check size={11} className="text-white" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-medium ${isActive ? 'text-brand-300' : 'text-gray-200'}`}>
                        {ws.name}
                      </span>
                      {ws.role && (
                        <Badge color={roleColor[ws.role] || 'gray'} size="xs">
                          {ws.role}
                        </Badge>
                      )}
                      {isActive && <Badge color="brand" size="xs" dot>Active</Badge>}
                    </div>
                    <p className="text-2xs text-gray-600 mt-0.5">/{ws.slug}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {ws.member_count !== undefined && (
                        <span className="text-2xs text-gray-600 flex items-center gap-1">
                          <Users size={10} />
                          {ws.member_count} member{ws.member_count !== 1 ? 's' : ''}
                        </span>
                      )}
                      {ws.message_count !== undefined && (
                        <span className="text-2xs text-gray-600">{ws.message_count} messages</span>
                      )}
                      {ws.created_at && (
                        <span className="text-2xs text-gray-700">Created {timeAgo(ws.created_at)}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                    {ws.role === 'owner' || ws.role === 'admin' ? (
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={UserPlus}
                        onClick={() => { setInviteModal(ws); setError(''); }}
                      >
                        Invite
                      </Button>
                    ) : null}
                    {ws.role === 'owner' && (
                      <Button
                        size="xs"
                        variant="ghost"
                        icon={Trash2}
                        onClick={() => deleteWs(ws.id)}
                        className="text-red-500/50 hover:text-red-400 hover:bg-red-400/10"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Invite modal */}
      <Modal
        open={!!inviteModal}
        onClose={() => { setInviteModal(null); setInviteUsername(''); setError(''); }}
        title={`Invite to "${inviteModal?.name}"`}
        size="sm"
      >
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">GitHub username</label>
            <input
              value={inviteUsername}
              onChange={e => setInviteUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && invite()}
              placeholder="username"
              className="input-base"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-400">Role</label>
            <div className="flex gap-2">
              {['member', 'admin'].map(r => (
                <button
                  key={r}
                  onClick={() => setInviteRole(r)}
                  className={`px-3 py-1.5 text-xs rounded-xl border transition-all capitalize ${
                    inviteRole === r
                      ? 'bg-brand-600/20 border-brand-500/40 text-brand-300'
                      : 'bg-surface-800 border-white/8 text-gray-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button
            size="md"
            variant="primary"
            icon={UserPlus}
            loading={inviting}
            disabled={!inviteUsername.trim()}
            onClick={invite}
            className="w-full"
          >
            Send Invite
          </Button>
          <p className="text-2xs text-gray-700 text-center">
            The user must have logged into SoumyaOps at least once.
          </p>
        </div>
      </Modal>
    </div>
  );
}