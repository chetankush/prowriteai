import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  TrendingUp,
  Activity,
  Shield,
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';

interface AuditLogSummary {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
}

interface WorkspaceStats {
  total_documents: number;
  documents_by_status: Record<string, number>;
  pending_approvals: number;
  team_members: number;
  recent_activities: AuditLogSummary[];
  approval_rate: number;
  average_response_time_hours: number;
}

const ACTION_LABELS: Record<string, string> = {
  document_created: 'Created document',
  document_updated: 'Updated document',
  document_status_changed: 'Changed document status',
  document_deleted: 'Deleted document',
  team_member_added: 'Added team member',
  team_member_removed: 'Removed team member',
  approval_requested: 'Requested approval',
  approval_granted: 'Granted approval',
  approval_rejected: 'Rejected approval',
};

export function AdminDashboardPage() {
  // First get the workspace ID, then fetch stats
  const { data: workspace } = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const response = await api.get('/workspace');
      return response.data;
    },
  });

  const { data: stats, isLoading } = useQuery<WorkspaceStats>({
    queryKey: ['workspace-stats', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return null;
      try {
        const response = await api.get(`/workspaces/${workspace.id}/compliance/stats`);
        return response.data;
      } catch (err) {
        console.error('[AdminDashboard] Failed to load workspace stats:', err)
        return {
          total_documents: 0,
          documents_by_status: { draft: 0, pending_approval: 0, approved: 0, archived: 0 },
          pending_approvals: 0,
          team_members: 1,
          recent_activities: [],
          approval_rate: 0,
          average_response_time_hours: 0,
        };
      }
    },
    enabled: !!workspace?.id,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-400" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'from-gray-500/20 to-gray-600/20';
      case 'pending_approval':
        return 'from-yellow-500/20 to-orange-600/20';
      case 'approved':
        return 'from-green-500/20 to-emerald-600/20';
      case 'archived':
        return 'from-gray-500/20 to-slate-600/20';
      default:
        return 'from-gray-500/20 to-gray-600/20';
    }
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load dashboard stats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitor workspace activity and compliance metrics
              </p>
            </div>
            <Link to="/admin/compliance">
              <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                <Shield className="h-4 w-4" />
                Compliance Reports
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Documents */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Total
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.total_documents ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">documents</p>
                </>
              )}
            </div>

            {/* Pending Approvals */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Pending
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.pending_approvals ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">approvals</p>
                </>
              )}
            </div>

            {/* Team Members */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Team
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.team_members ?? 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">members</p>
                </>
              )}
            </div>

            {/* Approval Rate */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-violet-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Rate
                </span>
              </div>
              {isLoading ? (
                <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-3xl font-bold text-foreground">
                    {stats?.approval_rate ?? 0}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">approval rate</p>
                </>
              )}
            </div>
          </div>

          {/* Documents by Status Chart */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">Documents by Status</h2>
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-secondary/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['draft', 'pending_approval', 'approved', 'archived'].map((status) => (
                    <div
                      key={status}
                      className={`rounded-lg bg-gradient-to-br ${getStatusColor(status)} p-4`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(status)}
                        <span className="text-sm font-medium text-foreground capitalize">
                          {status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-foreground">
                        {stats?.documents_by_status?.[status] ?? 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Link to="/admin/compliance" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              {isLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-secondary/50 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
                          <div className="h-3 w-48 bg-secondary/50 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : !stats?.recent_activities?.length ? (
                <div className="p-12 text-center">
                  <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {stats.recent_activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {ACTION_LABELS[activity.action] || activity.action}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {activity.entity_type}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
