import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Trash2, Mail, Clock, Users, Crown } from 'lucide-react';

interface TeamMember {
  id: string;
  workspace_id: string;
  user_id: string;
  email?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  invited_at: string;
  accepted_at?: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  expires_at: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: 'Full access, cannot be removed',
  admin: 'Can manage team and all content',
  editor: 'Can create and edit content',
  viewer: 'Can only view content',
};

export function TeamPage() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const { data: members = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await api.get('/team/members');
      return response.data;
    },
  });

  const { data: invitations = [] } = useQuery<TeamInvitation[]>({
    queryKey: ['team-invitations'],
    queryFn: async () => {
      const response = await api.get('/team/invitations');
      return response.data;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      const response = await api.post('/team/invite', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      setInviteEmail('');
    },
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await api.delete(`/team/invitations/${invitationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const response = await api.put(`/team/members/${memberId}/role`, { role });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await api.delete(`/team/members/${memberId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      inviteMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Team Management</h1>
            <p className="text-muted-foreground mt-1">Invite team members and manage permissions</p>
          </div>

          {/* Invite Form */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Invite Team Member</h2>
              <p className="text-sm text-muted-foreground">Send an invitation to add someone to your workspace</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleInvite} className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="pl-10 h-11 bg-secondary/30 border-border/50"
                  required
                />
              </div>
            </div>
            <div className="w-40">
              <Label htmlFor="role" className="text-sm font-medium mb-2 block">Role</Label>
              <Select value={inviteRole} onValueChange={(v: any) => setInviteRole(v)}>
                <SelectTrigger className="h-11 bg-secondary/30 border-border/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              type="submit" 
              disabled={inviteMutation.isPending}
              className="h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </form>
          {inviteMutation.isError && (
            <p className="text-sm text-destructive mt-3">
              Failed to send invitation. Please try again.
            </p>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Pending Invitations</h2>
                <p className="text-sm text-muted-foreground">{invitations.length} invitation{invitations.length !== 1 ? 's' : ''} waiting</p>
              </div>
            </div>
          </div>
          <div className="divide-y divide-border/50">
            {invitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/50 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{invitation.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {ROLE_LABELS[invitation.role]} • Expires {formatDate(invitation.expires_at)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                  disabled={cancelInvitationMutation.isPending}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Team Members</h2>
              <p className="text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? 's' : ''} in workspace</p>
            </div>
          </div>
        </div>
        <div>
          {membersLoading ? (
            <div className="p-6 flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading team members...</span>
            </div>
          ) : members.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No team members yet. Invite someone to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-violet-400">
                        {member.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.email || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{ROLE_DESCRIPTIONS[member.role]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role !== 'owner' ? (
                      <>
                        <Select
                          value={member.role}
                          onValueChange={(role) => updateRoleMutation.mutate({ memberId: member.id, role })}
                        >
                          <SelectTrigger className="w-28 h-9 bg-secondary/30 border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMemberMutation.mutate(member.id)}
                          disabled={removeMemberMutation.isPending}
                          className="h-9 w-9 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Crown className="h-3 w-3" />
                        Owner
                      </span>
                    )}
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

export default TeamPage;
