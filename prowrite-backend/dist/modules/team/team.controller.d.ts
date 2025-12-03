import { TeamService } from './team.service';
import { AssetService } from './asset.service';
import { ApprovalService } from './approval.service';
import { PersonalizationService } from './personalization.service';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
import { InviteTeamMemberDto, UpdateTeamMemberRoleDto, CreateAssetDto, UpdateAssetDto, CreateApprovalRequestDto, UpdateApprovalDto, CreatePersonalizationSetDto, BulkPersonalizationDto, AssetStatus, ApprovalStatus } from './dto';
export declare class TeamController {
    private readonly teamService;
    private readonly assetService;
    private readonly approvalService;
    private readonly personalizationService;
    constructor(teamService: TeamService, assetService: AssetService, approvalService: ApprovalService, personalizationService: PersonalizationService);
    getTeamMembers(req: AuthenticatedRequest): Promise<import("./dto").TeamMemberResponseDto[]>;
    inviteTeamMember(dto: InviteTeamMemberDto, req: AuthenticatedRequest): Promise<import("./dto").TeamInvitationResponseDto>;
    getPendingInvitations(req: AuthenticatedRequest): Promise<import("./dto").TeamInvitationResponseDto[]>;
    cancelInvitation(invitationId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    updateMemberRole(memberId: string, dto: UpdateTeamMemberRoleDto, req: AuthenticatedRequest): Promise<import("./dto").TeamMemberResponseDto>;
    removeMember(memberId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    getAssets(assetType?: string, status?: AssetStatus, tags?: string, search?: string, req?: AuthenticatedRequest): Promise<import("./dto").AssetResponseDto[]>;
    getAsset(assetId: string, req: AuthenticatedRequest): Promise<import("./dto").AssetResponseDto>;
    createAsset(dto: CreateAssetDto, req: AuthenticatedRequest): Promise<import("./dto").AssetResponseDto>;
    updateAsset(assetId: string, dto: UpdateAssetDto, req: AuthenticatedRequest): Promise<import("./dto").AssetResponseDto>;
    deleteAsset(assetId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    getAssetVersions(assetId: string): Promise<import("./dto").AssetVersionResponseDto[]>;
    restoreVersion(assetId: string, versionId: string, req: AuthenticatedRequest): Promise<import("./dto").AssetResponseDto>;
    getApprovalRequests(status?: ApprovalStatus, req?: AuthenticatedRequest): Promise<import("./dto").ApprovalRequestResponseDto[]>;
    getMyPendingApprovals(req: AuthenticatedRequest): Promise<import("./dto").ApprovalRequestResponseDto[]>;
    createApprovalRequest(dto: CreateApprovalRequestDto, req: AuthenticatedRequest): Promise<import("./dto").ApprovalRequestResponseDto>;
    updateApproval(approvalId: string, dto: UpdateApprovalDto, req: AuthenticatedRequest): Promise<import("./dto").ApprovalRequestResponseDto>;
    getPersonalizationSets(req: AuthenticatedRequest): Promise<import("./dto").PersonalizationSetResponseDto[]>;
    createPersonalizationSet(dto: CreatePersonalizationSetDto, req: AuthenticatedRequest): Promise<import("./dto").PersonalizationSetResponseDto>;
    deletePersonalizationSet(setId: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    bulkPersonalize(dto: BulkPersonalizationDto): Promise<{
        results: string[];
        count: number;
    }>;
    extractVariables(body: {
        template: string;
    }): Promise<{
        variables: string[];
    }>;
    parseCSV(body: {
        csv_content: string;
    }): Promise<{
        recipients: Record<string, string>[];
        count: number;
    }>;
}
