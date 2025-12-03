import { SupabaseService } from '@common/database';
import { TeamService } from './team.service';
import { AssetService } from './asset.service';
import { CreateApprovalRequestDto, UpdateApprovalDto, ApprovalRequestResponseDto, ApprovalStatus } from './dto';
export declare class ApprovalService {
    private readonly supabaseService;
    private readonly teamService;
    private readonly assetService;
    constructor(supabaseService: SupabaseService, teamService: TeamService, assetService: AssetService);
    createApprovalRequest(workspaceId: string, userId: string, dto: CreateApprovalRequestDto): Promise<ApprovalRequestResponseDto>;
    getApprovalRequests(workspaceId: string, filters?: {
        status?: ApprovalStatus;
        assigned_to?: string;
    }): Promise<ApprovalRequestResponseDto[]>;
    getMyPendingApprovals(workspaceId: string, userId: string): Promise<ApprovalRequestResponseDto[]>;
    updateApproval(workspaceId: string, approvalId: string, userId: string, dto: UpdateApprovalDto): Promise<ApprovalRequestResponseDto>;
    getAssetApprovalHistory(workspaceId: string, assetId: string): Promise<ApprovalRequestResponseDto[]>;
    private toApprovalResponse;
}
