import { useQuery } from '@tanstack/react-query';
import { Activity, FileText, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '@/lib/api';

interface AuditLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

interface ActivityFeedProps {
  workspaceId: string;
  limit?: number;
  showFilters?: boolean;
}

const ACTION_LABELS: Record<string, string> = {
  document_created: 'Created document',
  document_updated: 'Updated document',
  document_status_changed: 'Changed document status',
  document_deleted: 'Deleted document',
  team_member_added: 'Added team member',
  team_member_removed: 'Removed team member',
  team_member_role_changed: 'Changed team member role',
  team_invitation_sent: 'Sent team invitation',
  team_invitation_accepted: 'Accepted team invitation',
  team_invitation_cancelled: 'Cancelled team invitation',
  approval_requested: 'Requested approval',
  approval_granted: 'Granted approval',
  approval_rejected: 'Rejected approval',
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  document_created: <FileText className="h-4 w-4" />,
  document_updated: <FileText className="h-4 w-4" />,
  document_status_changed: <Clock className="h-4 w-4" />,
  document_deleted: <FileText className="h-4 w-4" />,
  team_member_added: <Users className="h-4 w-4" />,
  team_member_removed: <Users className="h-4 w-4" />,
  approval_requested: <Clock className="h-4 w-4" />,
  approval_granted: <CheckCircle className="h-4 w-4" />,
  approval_rejected: <XCircle className="h-4 w-4" />,
};

const ACTION_COLORS: Record<string, string> = {
  document_created: 'from-blue-500/20 to-cyan-600/20 text-blue-400',
  document_updated: 'from-violet-500/20 to-purple-600/20 text-violet-400',
  document_status_changed: 'from-yellow-500/20 to-orange-600/20 text-yellow-400',
  document_deleted: 'from-red-500/20 to-rose-600/20 text-red-400',
  team_member_added: 'from-green-500/20 to-emerald-600/20 text-green-400',
  team_member_removed: 'from-red-500/20 to-rose-600/20 text-red-400',
  approval_requested: 'from-yellow-500/20 to-orange-600/20 text-yellow-400',
  approval_granted: 'from-green-500/20 to-emerald-600/20 text-green-400',
  approval_rejected: 'from-red-500/20 to-rose-600/20 text-red-400',
};


export function ActivityFeed({ workspaceId, limit = 20 }: ActivityFeedProps) {
  const { data: activities = [], isLoading, error } = useQuery<AuditLog[]>({
    queryKey: ['audit-logs', workspaceId, limit],
    queryFn: async () => {
      const response = await api.get(`/workspaces/${workspaceId}/audit`);
      return response.data.slice(0, limit);
    },
    enabled: !!workspaceId,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    return ACTION_ICONS[action] || <Activity className="h-4 w-4" />;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || 'from-gray-500/20 to-gray-600/20 text-gray-400';
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-sm text-red-500">Failed to load activity feed</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="divide-y divide-border/50">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4">
            <div className="h-10 w-10 rounded-lg bg-secondary/50 animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-48 bg-secondary/50 rounded animate-pulse" />
              <div className="h-3 w-32 bg-secondary/50 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <div className="p-12 text-center">
        <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <Activity className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/50">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors"
        >
          <div
            className={`h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center ${getActionColor(activity.action)}`}
          >
            {getActionIcon(activity.action)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              {ACTION_LABELS[activity.action] || activity.action}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground capitalize">
                {activity.entity_type.replace('_', ' ')}
              </span>
              {activity.entity_id && (
                <>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                    {activity.entity_id.slice(0, 8)}...
                  </span>
                </>
              )}
            </div>
            {activity.details && Object.keys(activity.details).length > 0 && (
              <div className="mt-2 text-xs text-muted-foreground bg-secondary/30 rounded px-2 py-1">
                {Object.entries(activity.details)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <span key={key} className="mr-3">
                      {key}: {String(value)}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDate(activity.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default ActivityFeed;
