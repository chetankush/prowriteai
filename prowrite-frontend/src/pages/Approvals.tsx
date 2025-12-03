/**
 * Approvals page
 * Review and approve/reject content before publishing
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
    color: 'bg-yellow-100 text-yellow-700',
    label: 'Pending Review',
  },
  approved: {
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'bg-green-100 text-green-700',
    label: 'Approved',
  },
  rejected: {
    icon: <XCircle className="h-4 w-4" />,
    color: 'bg-red-100 text-red-700',
    label: 'Rejected',
  },
  revision_requested: {
    icon: <AlertCircle className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-700',
    label: 'Revision Requested',
  },
};

export function ApprovalsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [feedback, setFeedback] = useState('');

  // Fetch approval requests
  const { data: approvals = [], isLoading } = useQuery<ApprovalRequest[]>({
    queryKey: ['approvals', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/team/approvals${params}`);
      return response.data;
    },
  });

  // Fetch my pending approvals
  const { data: myPending = [] } = useQuery<ApprovalRequest[]>({
    queryKey: ['my-pending-approvals'],
    queryFn: async () => {
      const response = await api.get('/team/approvals/my-pending');
      return response.data;
    },
  });

  // Fetch asset details when approval is selected
  const { data: assetDetails } = useQuery<Asset>({
    queryKey: ['asset', selectedApproval?.asset_id],
    queryFn: async () => {
      const response = await api.get(`/team/assets/${selectedApproval?.asset_id}`);
      return response.data;
    },
    enabled: !!selectedApproval?.asset_id,
  });

  // Update approval mutation
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
      const response = await api.put(`/team/approvals/${approvalId}`, {
        status,
        feedback,
      });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Approval Workflow</h1>
        <p className="text-muted-foreground">
          Review and approve content before it goes live
        </p>
      </div>

      {/* My Pending Approvals Alert */}
      {myPending.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  You have {myPending.length} pending approval{myPending.length > 1 ? 's' : ''} assigned to you
                </p>
                <p className="text-sm text-yellow-700">
                  Review and take action on these requests
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by status:</Label>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
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
        <p className="text-muted-foreground">Loading approval requests...</p>
      ) : approvals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No approval requests</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'pending'
                ? 'All caught up! No pending approvals.'
                : 'No approval requests match your filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {approvals.map((approval) => {
            const statusConfig = STATUS_CONFIG[approval.status];
            return (
              <Card
                key={approval.id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setSelectedApproval(approval)}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Asset #{approval.asset_id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDate(approval.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {approval.feedback && (
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                <DialogDescription>
                  Review the content and provide your decision
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-4">
                {/* Asset Content */}
                <div>
                  <Label>Content to Review</Label>
                  <div className="bg-muted rounded-lg p-4 mt-2 whitespace-pre-wrap text-sm max-h-64 overflow-y-auto">
                    {assetDetails?.content || 'Loading content...'}
                  </div>
                </div>

                {/* Previous Feedback */}
                {selectedApproval.feedback && (
                  <div>
                    <Label>Previous Feedback</Label>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2 text-sm">
                      {selectedApproval.feedback}
                    </div>
                  </div>
                )}

                {/* Feedback Input (for pending requests) */}
                {selectedApproval.status === 'pending' && (
                  <>
                    <div>
                      <Label htmlFor="feedback">Your Feedback (optional for approval)</Label>
                      <Textarea
                        id="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Add feedback or suggestions..."
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={handleRequestRevision}
                        disabled={!feedback || updateMutation.isPending}
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={updateMutation.isPending}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button
                        onClick={handleApprove}
                        disabled={updateMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </>
                )}

                {/* Status for non-pending */}
                {selectedApproval.status !== 'pending' && (
                  <div className="flex items-center justify-center py-4">
                    <span
                      className={`flex items-center gap-2 px-4 py-2 rounded-full ${STATUS_CONFIG[selectedApproval.status].color}`}
                    >
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
  );
}

export default ApprovalsPage;
