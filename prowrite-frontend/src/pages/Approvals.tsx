import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  MessageSquare,
  CheckSquare,
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  workspace_id: string;
  asset_id: string;
  requested_by: string;
  assigned_to?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface Asset {
  id: string;
  title: string;
  content: string;
  asset_type: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  pending: {
    icon: <Clock className="h-4 w-4" />,
    color: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    label: 'Pending Review',
  },
  approved: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'Approved',
  },
  rejected: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-red-500/10 text-red-400 border-red-500/20',
    label: 'Rejected',
  },
  revision_requested: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    label: 'Revision Requested',
  },
};

export function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [feedback, setFeedback] = useState('');

  const { data: approvals = [], isLoading } = useQuery<ApprovalRequest[]>({
    queryKey: ['approvals', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/team/approvals${params}`);
      return response.data;
    },
  });

  const { data: myPending = [] } = useQuery<ApprovalRequest[]>({
    queryKey: ['my-pending-approvals'],
    queryFn: async () => {
      const response = await api.get('/team/approvals/my-pending');
      return response.data;
    },
  });

  const { data: assetDetails } = useQuery<Asset>({
    queryKey: ['asset', selectedApproval?.asset_id],
    queryFn: async () => {
      const response = await api.get(`/team/assets/${selectedApproval?.asset_id}`);
      return response.data;
    },
    enabled: !!selectedApproval?.asset_id,
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      approvalId,
      status,
      feedback,
    }: {
      approvalId: string;
      status: string;
      feedback?: string;
    }) => {
      const response = await api.put(`/team/approvals/${approvalId}`, { status, feedback });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setSelectedApproval(null);
      setFeedback('');
    },
  });

  const handleApprove = () => {
    if (selectedApproval) {
      updateMutation.mutate({
        approvalId: selectedApproval.id,
        status: 'approved',
        feedback: feedback || undefined,
      });
    }
  };

  const handleReject = () => {
    if (selectedApproval) {
      updateMutation.mutate({
        approvalId: selectedApproval.id,
        status: 'rejected',
        feedback,
      });
    }
  };

  const handleRequestRevision = () => {
    if (selectedApproval && feedback) {
      updateMutation.mutate({
        approvalId: selectedApproval.id,
        status: 'revision_requested',
        feedback,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Approval Workflow</h1>
            <p className="text-muted-foreground mt-1">Review and approve content before it goes live</p>
          </div>

          {/* My Pending Approvals Alert */}
          {myPending.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
            <Clock className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="font-medium text-amber-400">
              You have {myPending.length} pending approval{myPending.length > 1 ? 's' : ''} assigned to you
            </p>
            <p className="text-sm text-amber-400/80">Review and take action on these requests</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label className="text-sm font-medium">Filter by status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 h-10 bg-secondary/30 border-border/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Requests</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="revision_requested">Revision Requested</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Approvals List */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12">
          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading approval requests...</span>
        </div>
      ) : approvals.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No approval requests</h3>
          <p className="text-muted-foreground">
            {statusFilter === 'pending'
              ? 'All caught up! No pending approvals.'
              : 'No approval requests match your filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((approval) => {
            const statusConfig = STATUS_CONFIG[approval.status];
            return (
              <div
                key={approval.id}
                className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4 cursor-pointer hover:bg-card/80 hover:border-violet-500/30 transition-all"
                onClick={() => setSelectedApproval(approval)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Asset #{approval.asset_id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">Submitted {formatDate(approval.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {approval.feedback && (
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border ${statusConfig.color}`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedApproval && (
            <>
              <DialogHeader>
                <DialogTitle>Review Approval Request</DialogTitle>
                <DialogDescription>Review the content and provide your decision</DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                <div>
                  <Label className="text-sm font-medium">Content to Review</Label>
                  <div className="rounded-xl bg-secondary/30 p-4 mt-2 whitespace-pre-wrap text-sm max-h-64 overflow-y-auto text-foreground">
                    {assetDetails?.content || 'Loading content...'}
                  </div>
                </div>

                {selectedApproval.feedback && (
                  <div>
                    <Label className="text-sm font-medium">Previous Feedback</Label>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 mt-2 text-sm text-amber-400">
                      {selectedApproval.feedback}
                    </div>
                  </div>
                )}

                {selectedApproval.status === 'pending' && (
                  <>
                    <div>
                      <Label htmlFor="feedback" className="text-sm font-medium">Your Feedback (optional for approval)</Label>
                      <Textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add feedback or suggestions..."
                        rows={3}
                        className="mt-2 bg-secondary/30 border-border/50"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-border/50">
                      <Button
                        variant="outline"
                        onClick={handleRequestRevision}
                        disabled={!feedback || updateMutation.isPending}
                        className="gap-2"
                      >
                        <AlertCircle className="h-4 w-4" />
                        Request Revision
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleReject}
                        disabled={updateMutation.isPending}
                        className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={handleApprove}
                        disabled={updateMutation.isPending}
                        className="gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </>
                )}

                {selectedApproval.status !== 'pending' && (
                  <div className="flex items-center justify-center py-4">
                    <span className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${STATUS_CONFIG[selectedApproval.status].color}`}>
                      {STATUS_CONFIG[selectedApproval.status].icon}
                      {STATUS_CONFIG[selectedApproval.status].label}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}

export default ApprovalsPage;
