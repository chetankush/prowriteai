import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '@common/database';
import { TeamService } from './team.service';
import { AssetService } from './asset.service';
import {
  CreateApprovalRequestDto,
  UpdateApprovalDto,
  ApprovalRequestResponseDto,
  ApprovalStatus,
} from './dto';

@Injectable()
export class ApprovalService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly teamService: TeamService,
    private readonly assetService: AssetService,
  ) {}

  /**
   * Create an approval request for an asset
   */
  async createApprovalRequest(
    workspaceId: string,
    userId: string,
    dto: CreateApprovalRequestDto,
  ): Promise<ApprovalRequestResponseDto> {
    // Verify asset exists and belongs to workspace
    const asset = await this.assetService.getAsset(workspaceId, dto.asset_id);
    
    if (asset.status !== 'draft') {
      throw new BadRequestException('Only draft assets can be submitted for approval');
    }

    // Check if there's already a pending approval
    const { data: existing } = await this.supabaseService.client
      .from('approval_requests')
      .select('id')
      .eq('asset_id', dto.asset_id)
      .eq('status', 'pending')
      .single();

    if (existing) {
      throw new BadRequestException('Asset already has a pending approval request');
    }

    // Create approval request
    const { data, error } = await this.supabaseService.client
      .from('approval_requests')
      .insert({
        workspace_id: workspaceId,
        asset_id: dto.asset_id,
        requested_by: userId,
        assigned_to: dto.assigned_to,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create approval request: ${error.message}`);
    }

    // Update asset status to pending_review
    await this.assetService.updateAsset(workspaceId, dto.asset_id, userId, {
      status: 'pending_review',
    });

    return this.toApprovalResponse(data);
  }

  /**
   * Get all approval requests for a workspace
   */
  async getApprovalRequests(
    workspaceId: string,
    filters?: {
      status?: ApprovalStatus;
      assigned_to?: string;
    },
  ): Promise<ApprovalRequestResponseDto[]> {
    let query = this.supabaseService.client
      .from('approval_requests')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.assigned_to) {
      query = query.eq('assigned_to', filters.assigned_to);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch approval requests: ${error.message}`);
    }

    return (data || []).map(this.toApprovalResponse);
  }

  /**
   * Get my pending approvals (assigned to me)
   */
  async getMyPendingApprovals(
    workspaceId: string,
    userId: string,
  ): Promise<ApprovalRequestResponseDto[]> {
    return this.getApprovalRequests(workspaceId, {
      status: 'pending',
      assigned_to: userId,
    });
  }

  /**
   * Update approval status (approve/reject/request revision)
   */
  async updateApproval(
    workspaceId: string,
    approvalId: string,
    userId: string,
    dto: UpdateApprovalDto,
  ): Promise<ApprovalRequestResponseDto> {
    // Check permission (admin or higher, or assigned reviewer)
    const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'admin');
    
    const { data: approval, error: findError } = await this.supabaseService.client
      .from('approval_requests')
      .select('*')
      .eq('id', approvalId)
      .eq('workspace_id', workspaceId)
      .single();

    if (findError || !approval) {
      throw new NotFoundException('Approval request not found');
    }

    // Allow if admin or assigned reviewer
    if (!hasPermission && approval.assigned_to !== userId) {
      throw new ForbiddenException('You are not authorized to review this request');
    }

    if (approval.status !== 'pending') {
      throw new BadRequestException('This approval request has already been processed');
    }

    // Update approval request
    const { data, error } = await this.supabaseService.client
      .from('approval_requests')
      .update({
        status: dto.status,
        feedback: dto.feedback,
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update approval: ${error.message}`);
    }

    // Update asset status based on approval decision
    let newAssetStatus: 'approved' | 'draft';
    if (dto.status === 'approved') {
      newAssetStatus = 'approved';
    } else {
      newAssetStatus = 'draft'; // Back to draft for revision or rejection
    }

    await this.assetService.updateAsset(workspaceId, approval.asset_id, userId, {
      status: newAssetStatus,
    });

    return this.toApprovalResponse(data);
  }

  /**
   * Get approval history for an asset
   */
  async getAssetApprovalHistory(
    workspaceId: string,
    assetId: string,
  ): Promise<ApprovalRequestResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('approval_requests')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch approval history: ${error.message}`);
    }

    return (data || []).map(this.toApprovalResponse);
  }

  /**
   * Convert DB row to response DTO
   */
  private toApprovalResponse(data: any): ApprovalRequestResponseDto {
    return {
      id: data.id,
      workspace_id: data.workspace_id,
      asset_id: data.asset_id,
      requested_by: data.requested_by,
      assigned_to: data.assigned_to,
      status: data.status as ApprovalStatus,
      feedback: data.feedback,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}
