import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Calendar,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AuditLogSummary {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
}

interface ComplianceReportSummary {
  total_documents: number;
  total_approvals: number;
  total_rejections: number;
  average_approval_time_hours: number;
}

interface ComplianceReport {
  workspace_id: string;
  period_start: string;
  period_end: string;
  summary: ComplianceReportSummary;
  documents_by_status: Record<string, number>;
  activity_by_user: Record<string, number>;
  audit_trail: AuditLogSummary[];
}

interface ComplianceDashboardProps {
  workspaceId: string;
}

export function ComplianceDashboard({ workspaceId }: ComplianceDashboardProps) {
  // Default to last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [isExporting, setIsExporting] = useState(false);

  const { data: report, isLoading, error, refetch } = useQuery<ComplianceReport>({
    queryKey: ['compliance-report', workspaceId, startDate, endDate],
    queryFn: async () => {
      const response = await api.get(
        `/workspaces/${workspaceId}/compliance/report?start_date=${startDate}&end_date=${endDate}`
      );
      return response.data;
    },
    enabled: !!workspaceId && !!startDate && !!endDate,
  });

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      const response = await api.get(
        `/workspaces/${workspaceId}/compliance/export?start_date=${startDate}&end_date=${endDate}&format=${format}`,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `compliance-report-${startDate}-${endDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-muted-foreground">Failed to load compliance report</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date" className="text-sm font-medium">
                Start Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date" className="text-sm font-medium">
                End Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              disabled={isExporting || isLoading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting || isLoading}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Documents */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">
                {report?.summary.total_documents ?? 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Documents Created</p>
            </>
          )}
        </div>

        {/* Total Approvals */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">
                {report?.summary.total_approvals ?? 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Approvals</p>
            </>
          )}
        </div>

        {/* Total Rejections */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">
                {report?.summary.total_rejections ?? 0}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Rejections</p>
            </>
          )}
        </div>

        {/* Average Approval Time */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-400" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-8 w-16 bg-secondary/50 rounded animate-pulse" />
          ) : (
            <>
              <p className="text-3xl font-bold text-foreground">
                {report?.summary.average_approval_time_hours ?? 0}h
              </p>
              <p className="text-sm text-muted-foreground mt-1">Avg. Approval Time</p>
            </>
          )}
        </div>
      </div>

      {/* Documents by Status & Activity by User */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Documents by Status */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Documents by Status</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-secondary/50 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(report?.documents_by_status || {}).map(([status, count]) => {
                const total = Object.values(report?.documents_by_status || {}).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = total > 0 ? (count / total) * 100 : 0;

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground capitalize">
                        {status.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-muted-foreground">{count}</span>
                    </div>
                    <div className="w-full bg-secondary/50 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          status === 'approved'
                            ? 'bg-green-500'
                            : status === 'pending_approval'
                              ? 'bg-yellow-500'
                              : status === 'draft'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity by User */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Activity by User</h3>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-secondary/50 rounded animate-pulse" />
              ))}
            </div>
          ) : Object.keys(report?.activity_by_user || {}).length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No user activity in this period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(report?.activity_by_user || {})
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([userId, count]) => (
                  <div
                    key={userId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                      <Users className="h-4 w-4 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate font-mono">
                        {userId.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Audit Trail */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-semibold text-foreground">Audit Trail</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {report
              ? `${formatDate(report.period_start)} - ${formatDate(report.period_end)}`
              : 'Loading...'}
          </p>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-secondary/50 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-secondary/50 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-secondary/50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : !report?.audit_trail?.length ? (
          <div className="p-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No audit entries in this period</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 max-h-96 overflow-y-auto">
            {report.audit_trail.slice(0, 50).map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-4 hover:bg-secondary/30">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{log.action}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{log.entity_type}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {log.user_id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(log.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplianceDashboard;
