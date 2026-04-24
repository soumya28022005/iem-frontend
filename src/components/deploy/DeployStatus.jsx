// src/components/deploy/DeployStatus.jsx
import { ExternalLink, RefreshCw, CheckCircle, XCircle, Clock, Loader } from 'lucide-react';
import { cn, getStatusMeta, timeAgo } from '../../lib/utils';
import { Badge } from '../ui/Badge';

const STATUS_ICONS = {
  queued:    <Clock size={14} className="text-yellow-400" />,
  building:  <Loader size={14} className="text-blue-400 animate-spin" />,
  deployed:  <CheckCircle size={14} className="text-emerald-400" />,
  failed:    <XCircle size={14} className="text-red-400" />,
  cancelled: <XCircle size={14} className="text-gray-500" />,
};

const PLATFORM_COLORS = {
  vercel:  { badge: 'gray',  label: '▲ Vercel' },
  railway: { badge: 'purple', label: '🚂 Railway' },
  render:  { badge: 'green', label: '⬡ Render' },
};

export default function DeployStatus({ deployment }) {
  const status = getStatusMeta(deployment.status);
  const platform = PLATFORM_COLORS[deployment.platform] || { badge: 'gray', label: deployment.platform || 'Unknown' };

  const statusColorMap = {
    queued: 'yellow', building: 'blue', deployed: 'green', failed: 'red', cancelled: 'gray',
  };

  return (
    <div className={cn(
      'bg-surface-900 border rounded-2xl px-4 py-3 flex items-center gap-3 transition-all',
      deployment.status === 'deployed' ? 'border-emerald-500/20' :
      deployment.status === 'failed'   ? 'border-red-500/20'     : 'border-white/8',
    )}>
      {/* Status icon */}
      <div className="flex-shrink-0">
        {STATUS_ICONS[deployment.status] || STATUS_ICONS.queued}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-200 truncate">
            {deployment.repo_full_name || 'Unknown repo'}
          </span>
          <Badge color={platform.badge} size="xs">{platform.label}</Badge>
          <Badge color={statusColorMap[deployment.status] || 'gray'} size="xs" dot>
            {status.label}
          </Badge>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {deployment.deploy_type && (
            <span className="text-2xs text-gray-600 capitalize">{deployment.deploy_type}</span>
          )}
          {deployment.triggered_by_username && (
            <span className="text-2xs text-gray-600">
              by {deployment.triggered_by_username}
            </span>
          )}
          {deployment.created_at && (
            <span className="text-2xs text-gray-700">{timeAgo(deployment.created_at)}</span>
          )}
        </div>

        {/* Logs snippet */}
        {deployment.status === 'failed' && deployment.logs && (
          <p className="text-2xs text-red-400/70 font-mono truncate mt-1">{deployment.logs}</p>
        )}
      </div>

      {/* Live URL */}
      {deployment.live_url && (
        <a
          href={deployment.live_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300
                     flex-shrink-0 transition-colors"
        >
          <ExternalLink size={12} />
          Live
        </a>
      )}
    </div>
  );
}