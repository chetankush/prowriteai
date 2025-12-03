"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../common/database");
const crypto_1 = require("crypto");
let TeamService = class TeamService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getTeamMembers(workspaceId) {
        const { data, error } = await this.supabaseService.client
            .from('team_members')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: true });
        if (error) {
            if (error.code === '42P01' || error.message.includes('does not exist') || error.code === 'PGRST200') {
                console.warn('team_members table not found - run supabase-team-collaboration.sql');
                return [];
            }
            console.error('Failed to fetch team members:', error);
            throw new Error(`Failed to fetch team members: ${error.message}`);
        }
        return (data || []).map((member) => ({
            id: member.id,
            workspace_id: member.workspace_id,
            user_id: member.user_id,
            email: undefined,
            role: member.role,
            invited_by: member.invited_by,
            invited_at: new Date(member.invited_at),
            accepted_at: member.accepted_at ? new Date(member.accepted_at) : undefined,
            created_at: new Date(member.created_at),
        }));
    }
    async getUserRole(workspaceId, userId) {
        const { data: workspace } = await this.supabaseService.workspaces
            .select('user_id')
            .eq('id', workspaceId)
            .single();
        if (workspace?.user_id === userId) {
            return 'owner';
        }
        try {
            const { data: member, error } = await this.supabaseService.client
                .from('team_members')
                .select('role')
                .eq('workspace_id', workspaceId)
                .eq('user_id', userId)
                .single();
            if (error && (error.code === '42P01' || error.code === 'PGRST200')) {
                return null;
            }
            return member?.role || null;
        }
        catch {
            return null;
        }
    }
    async hasPermission(workspaceId, userId, requiredRole) {
        const userRole = await this.getUserRole(workspaceId, userId);
        if (!userRole)
            return false;
        const roleHierarchy = {
            owner: 4,
            admin: 3,
            editor: 2,
            viewer: 1,
        };
        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }
    async inviteTeamMember(workspaceId, invitedBy, dto) {
        const hasPermission = await this.hasPermission(workspaceId, invitedBy, 'admin');
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Only admins and owners can invite team members');
        }
        const { data: existingMember } = await this.supabaseService.client
            .from('team_members')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('user_id', (await this.getUserIdByEmail(dto.email)) || '')
            .single();
        if (existingMember) {
            throw new common_1.BadRequestException('User is already a team member');
        }
        const { data: existingInvitation } = await this.supabaseService.client
            .from('team_invitations')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('email', dto.email)
            .is('accepted_at', null)
            .single();
        if (existingInvitation) {
            throw new common_1.BadRequestException('Invitation already sent to this email');
        }
        const token = (0, crypto_1.randomBytes)(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
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
            role: data.role,
            invited_by: data.invited_by,
            expires_at: new Date(data.expires_at),
            created_at: new Date(data.created_at),
        };
    }
    async acceptInvitation(token, userId) {
        const { data: invitation, error: findError } = await this.supabaseService.client
            .from('team_invitations')
            .select('*')
            .eq('token', token)
            .is('accepted_at', null)
            .single();
        if (findError || !invitation) {
            throw new common_1.NotFoundException('Invalid or expired invitation');
        }
        if (new Date(invitation.expires_at) < new Date()) {
            throw new common_1.BadRequestException('Invitation has expired');
        }
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
        await this.supabaseService.client
            .from('team_invitations')
            .update({ accepted_at: new Date().toISOString() })
            .eq('id', invitation.id);
        return {
            id: member.id,
            workspace_id: member.workspace_id,
            user_id: member.user_id,
            role: member.role,
            invited_by: member.invited_by,
            invited_at: new Date(member.invited_at),
            accepted_at: new Date(member.accepted_at),
            created_at: new Date(member.created_at),
        };
    }
    async updateMemberRole(workspaceId, memberId, requestingUserId, dto) {
        const hasPermission = await this.hasPermission(workspaceId, requestingUserId, 'admin');
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Only admins and owners can update roles');
        }
        const { data: member } = await this.supabaseService.client
            .from('team_members')
            .select('*')
            .eq('id', memberId)
            .eq('workspace_id', workspaceId)
            .single();
        if (!member) {
            throw new common_1.NotFoundException('Team member not found');
        }
        if (member.role === 'owner') {
            throw new common_1.ForbiddenException('Cannot change owner role');
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
            role: updated.role,
            invited_by: updated.invited_by,
            invited_at: new Date(updated.invited_at),
            accepted_at: updated.accepted_at ? new Date(updated.accepted_at) : undefined,
            created_at: new Date(updated.created_at),
        };
    }
    async removeMember(workspaceId, memberId, requestingUserId) {
        const hasPermission = await this.hasPermission(workspaceId, requestingUserId, 'admin');
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Only admins and owners can remove members');
        }
        const { data: member } = await this.supabaseService.client
            .from('team_members')
            .select('role')
            .eq('id', memberId)
            .eq('workspace_id', workspaceId)
            .single();
        if (!member) {
            throw new common_1.NotFoundException('Team member not found');
        }
        if (member.role === 'owner') {
            throw new common_1.ForbiddenException('Cannot remove workspace owner');
        }
        const { error } = await this.supabaseService.client
            .from('team_members')
            .delete()
            .eq('id', memberId);
        if (error) {
            throw new Error(`Failed to remove member: ${error.message}`);
        }
    }
    async getPendingInvitations(workspaceId) {
        const { data, error } = await this.supabaseService.client
            .from('team_invitations')
            .select('*')
            .eq('workspace_id', workspaceId)
            .is('accepted_at', null)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false });
        if (error) {
            if (error.code === '42P01' || error.code === 'PGRST200') {
                return [];
            }
            throw new Error(`Failed to fetch invitations: ${error.message}`);
        }
        return (data || []).map((inv) => ({
            id: inv.id,
            workspace_id: inv.workspace_id,
            email: inv.email,
            role: inv.role,
            invited_by: inv.invited_by,
            expires_at: new Date(inv.expires_at),
            created_at: new Date(inv.created_at),
        }));
    }
    async cancelInvitation(workspaceId, invitationId, requestingUserId) {
        const hasPermission = await this.hasPermission(workspaceId, requestingUserId, 'admin');
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Only admins and owners can cancel invitations');
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
    async getUserIdByEmail(email) {
        const { data } = await this.supabaseService.client
            .from('auth.users')
            .select('id')
            .eq('email', email)
            .single();
        return data?.id || null;
    }
};
exports.TeamService = TeamService;
exports.TeamService = TeamService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.SupabaseService])
], TeamService);
//# sourceMappingURL=team.service.js.map