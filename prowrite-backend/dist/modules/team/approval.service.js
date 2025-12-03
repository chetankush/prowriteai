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
exports.ApprovalService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../common/database");
const team_service_1 = require("./team.service");
const asset_service_1 = require("./asset.service");
let ApprovalService = class ApprovalService {
    supabaseService;
    teamService;
    assetService;
    constructor(supabaseService, teamService, assetService) {
        this.supabaseService = supabaseService;
        this.teamService = teamService;
        this.assetService = assetService;
    }
    async createApprovalRequest(workspaceId, userId, dto) {
        const asset = await this.assetService.getAsset(workspaceId, dto.asset_id);
        if (asset.status !== 'draft') {
            throw new common_1.BadRequestException('Only draft assets can be submitted for approval');
        }
        const { data: existing } = await this.supabaseService.client
            .from('approval_requests')
            .select('id')
            .eq('asset_id', dto.asset_id)
            .eq('status', 'pending')
            .single();
        if (existing) {
            throw new common_1.BadRequestException('Asset already has a pending approval request');
        }
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
        await this.assetService.updateAsset(workspaceId, dto.asset_id, userId, {
            status: 'pending_review',
        });
        return this.toApprovalResponse(data);
    }
    async getApprovalRequests(workspaceId, filters) {
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
    async getMyPendingApprovals(workspaceId, userId) {
        return this.getApprovalRequests(workspaceId, {
            status: 'pending',
            assigned_to: userId,
        });
    }
    async updateApproval(workspaceId, approvalId, userId, dto) {
        const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'admin');
        const { data: approval, error: findError } = await this.supabaseService.client
            .from('approval_requests')
            .select('*')
            .eq('id', approvalId)
            .eq('workspace_id', workspaceId)
            .single();
        if (findError || !approval) {
            throw new common_1.NotFoundException('Approval request not found');
        }
        if (!hasPermission && approval.assigned_to !== userId) {
            throw new common_1.ForbiddenException('You are not authorized to review this request');
        }
        if (approval.status !== 'pending') {
            throw new common_1.BadRequestException('This approval request has already been processed');
        }
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
        let newAssetStatus;
        if (dto.status === 'approved') {
            newAssetStatus = 'approved';
        }
        else {
            newAssetStatus = 'draft';
        }
        await this.assetService.updateAsset(workspaceId, approval.asset_id, userId, {
            status: newAssetStatus,
        });
        return this.toApprovalResponse(data);
    }
    async getAssetApprovalHistory(workspaceId, assetId) {
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
    toApprovalResponse(data) {
        return {
            id: data.id,
            workspace_id: data.workspace_id,
            asset_id: data.asset_id,
            requested_by: data.requested_by,
            assigned_to: data.assigned_to,
            status: data.status,
            feedback: data.feedback,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
        };
    }
};
exports.ApprovalService = ApprovalService;
exports.ApprovalService = ApprovalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.SupabaseService,
        team_service_1.TeamService,
        asset_service_1.AssetService])
], ApprovalService);
//# sourceMappingURL=approval.service.js.map