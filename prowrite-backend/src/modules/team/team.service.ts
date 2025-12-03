import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '@common/database';
import {
  InviteTeamMemberDto,
  UpdateTeamMemberRoleDto,
  TeamMemberResponseDto,
  TeamInvitationResponseDto,
  TeamRole,
} from './dto';
import { randomBytes } from 'crypto';

@Injectable()
export class TeamService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get all team members for a workspace
   */
  async getTeamMembers(workspaceId: string): Promise<TeamMemberResponseDto[]> {
    // Simple query without join - table may not exist yet
    const { data, error } = await this.supabaseService.client
      .from('team_members')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    // If table doesn't exist, return empty array
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST200') {
        console.warn('team_members table not found - run supabase-team-collaboration.sql');
        return [];
      }
      console.error('Failed to fetch team members:', error);
      throw new Error(`Failed to fetch team members: ${error.message}`);
    }

    return (data || []).map((member: any) => ({
      id: member.id,
      workspace_id: member.workspace_id,
      user_id: member.user_id,
      email: undefined, // Email lookup would require separate query
      role: member.role as TeamRole,
      invited_by: member.invited_by,
      invited_at: new Date(member.invited_at),
      accepted_at: member.accepted_at ? new Date(member.accepted_at) : undefined,
      created_at: new Date(member.created_at),
    }));
  }

  /**
   * Get user's role in a workspace
   */
  async getUserRole(workspaceId: string, userId: string): Promise<TeamRole | null> {
    // First check if user is workspace owner
    const { data: workspace } = await this.supabaseService.workspaces
      .select('user_id')
      .eq('id', workspaceId)
      .single();

    if (workspace?.user_id === userId) {
      return 'owner';
    }

    // Check team_members table (may not exist yet)
    try {
      const { data: member, error } = await this.supabaseService.client
        .from('team_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userId)
        .single();

      if (error && (error.code === '42P01' || error.code === 'PGRST200')) {
        return null; // Table doesn't exist
      }

      return member?.role as TeamRole || null;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has required role or higher
   */
  async hasPermission(workspaceId: string, userId: string, requiredRole: TeamRole): Promise<boolean> {
    const userRole = await this.getUserRole(workspaceId, userId);
    if (!userRole) return false;

    const roleHierarchy: Record<TeamRole, number> = {
      owner: 4,
      admin: 3,
      editor: 2,
      viewer: 1,
    };

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  }


  /**
   * Invite a new team member
   */
  async inviteTeamMember(
    workspaceId: string,
    invitedBy: string,
    dto: InviteTeamMemberDto,
  ): Promise<TeamInvitationResponseDto> {
    // Check if user has permission to invite
    const hasPermission = await this.hasPermission(workspaceId, invitedBy, 'admin');
    if (!hasPermission) {
      throw new ForbiddenException('Only admins and owners can invite team members');
    }

    // Check if user is already a member
    const { data: existingMember } = await this.supabaseService.client
      .from('team_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', (await this.getUserIdByEmail(dto.email)) || '')
      .single();

    if (existingMember) {
      throw new BadRequestException('User is already a team member');
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await this.supabaseService.client
      .from('team_invitations')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('email', dto.email)
      .is('accepted_at', null)
      .single();

    if (existingInvitation) {
      throw new BadRequestException('Invitation already sent to this email');
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data, error } = await this.supabaseService.client
      .from('team_invitations')
      .insert({
        workspace_id: workspaceId,
        email: dto.email,
        role: dto.role,
        invited_by: invitedBy,
        token,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create invitation:', error);
      throw new Error(`Failed to create invitation: ${error.message}`);
    }

    return {
      id: data.id,
      workspace_id: data.workspace_id,
      email: data.email,
      role: data.role as TeamRole,
      invited_by: data.invited_by,
      expires_at: new Date(data.expires_at),
      created_at: new Date(data.created_at),
    };
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(token: string, userId: string): Promise<TeamMemberResponseDto> {
    // Find the invitation
    const { data: invitation, error: findError } = await this.supabaseService.client
      .from('team_invitations')
      .select('*')
      .eq('token', token)
      .is('accepted_at', null)
      .single();

    if (findError || !invitation) {
      throw new NotFoundException('Invalid or expired invitation');
    }

    // Check if invitation has expired
    if (new Date(invitation.expires_at) < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Create team member
    const { data: member, error: memberError } = await this.supabaseService.client
      .from('team_members')
      .insert({
        workspace_id: invitation.workspace_id,
        user_id: userId,
        role: invitation.role,
        invited_by: invitation.invited_by,
        accepted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) {
      console.error('Failed to create team member:', memberError);
      throw new Error(`Failed to accept invitation: ${memberError.message}`);
    }

    // Mark invitation as accepted
    await this.supabaseService.client
      .from('team_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    return {
      id: member.id,
      workspace_id: member.workspace_id,
      user_id: member.user_id,
      role: member.role as TeamRole,
      invited_by: member.invited_by,
      invited_at: new Date(member.invited_at),
      accepted_at: new Date(member.accepted_at),
      created_at: new Date(member.created_at),
    };
  }

  /**
   * Update team member role
   */
  async updateMemberRole(
    workspaceId: string,
    memberId: string,
    requestingUserId: string,
    dto: UpdateTeamMemberRoleDto,
  ): Promise<TeamMemberResponseDto> {
    // Check if user has permission
    const hasPermission = await this.hasPermission(workspaceId, requestingUserId, 'admin');
    if (!hasPermission) {
      throw new ForbiddenException('Only admins and owners can update roles');
    }

    // Cannot change owner role
    const { data: member } = await this.supabaseService.client
      .from('team_members')
      .select('*')
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .single();

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot change owner role');
    }

    const { data: updated, error } = await this.supabaseService.client
      .from('team_members')
      .update({ role: dto.role })
      .eq('id', memberId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update role: ${error.message}`);
    }

    return {
      id: updated.id,
      workspace_id: updated.workspace_id,
      user_id: updated.user_id,
      role: updated.role as TeamRole,
      invited_by: updated.invited_by,
      invited_at: new Date(updated.invited_at),
      accepted_at: updated.accepted_at ? new Date(updated.accepted_at) : undefined,
      created_at: new Date(updated.created_at),
    };
  }

  /**
   * Remove team member
   */
  async removeMember(
    workspaceId: string,
    memberId: string,
    requestingUserId: string,
  ): Promise<void> {
    // Check if user has permission
    const hasPermission = await this.hasPermission(workspaceId, requestingUserId, 'admin');
    if (!hasPermission) {
      throw new ForbiddenException('Only admins and owners can remove members');
    }

    // Cannot remove owner
    const { data: member } = await this.supabaseService.client
      .from('team_members')
      .select('role')
      .eq('id', memberId)
      .eq('workspace_id', workspaceId)
      .single();

    if (!member) {
      throw new NotFoundException('Team member not found');
    }

    if (member.role === 'owner') {
      throw new ForbiddenException('Cannot remove workspace owner');
    }

    const { error } = await this.supabaseService.client
      .from('team_members')
      .delete()
      .eq('id', memberId);

    if (error) {
      throw new Error(`Failed to remove member: ${error.message}`);
    }
  }

  /**
   * Get pending invitations for a workspace
   */
  async getPendingInvitations(workspaceId: string): Promise<TeamInvitationResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('team_invitations')
      .select('*')
      .eq('workspace_id', workspaceId)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    // If table doesn't exist, return empty array
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST200') {
        return [];
      }
      throw new Error(`Failed to fetch invitations: ${error.message}`);
    }

    return (data || []).map((inv: any) => ({
      id: inv.id,
      workspace_id: inv.workspace_id,
      email: inv.email,
      role: inv.role as TeamRole,
      invited_by: inv.invited_by,
      expires_at: new Date(inv.expires_at),
      created_at: new Date(inv.created_at),
    }));
  }

  /**
   * Cancel an invitation
   */
  async cancelInvitation(
    workspaceId: string,
    invitationId: string,
    requestingUserId: string,
  ): Promise<void> {
    const hasPermission = await this.hasPermission(workspaceId, requestingUserId, 'admin');
    if (!hasPermission) {
      throw new ForbiddenException('Only admins and owners can cancel invitations');
    }

    const { error } = await this.supabaseService.client
      .from('team_invitations')
      .delete()
      .eq('id', invitationId)
      .eq('workspace_id', workspaceId);

    if (error) {
      throw new Error(`Failed to cancel invitation: ${error.message}`);
    }
  }

  /**
   * Helper: Get user ID by email
   */
  private async getUserIdByEmail(email: string): Promise<string | null> {
    const { data } = await this.supabaseService.client
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single();
    return data?.id || null;
  }
}
