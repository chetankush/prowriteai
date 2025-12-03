import { SupabaseService } from '@common/database';
import { InviteTeamMemberDto, UpdateTeamMemberRoleDto, TeamMemberResponseDto, TeamInvitationResponseDto, TeamRole } from './dto';
export declare class TeamService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getTeamMembers(workspaceId: string): Promise<TeamMemberResponseDto[]>;
    getUserRole(workspaceId: string, userId: string): Promise<TeamRole | null>;
    hasPermission(workspaceId: string, userId: string, requiredRole: TeamRole): Promise<boolean>;
    inviteTeamMember(workspaceId: string, invitedBy: string, dto: InviteTeamMemberDto): Promise<TeamInvitationResponseDto>;
    acceptInvitation(token: string, userId: string): Promise<TeamMemberResponseDto>;
    updateMemberRole(workspaceId: string, memberId: string, requestingUserId: string, dto: UpdateTeamMemberRoleDto): Promise<TeamMemberResponseDto>;
    removeMember(workspaceId: string, memberId: string, requestingUserId: string): Promise<void>;
    getPendingInvitations(workspaceId: string): Promise<TeamInvitationResponseDto[]>;
    cancelInvitation(workspaceId: string, invitationId: string, requestingUserId: string): Promise<void>;
    private getUserIdByEmail;
}
