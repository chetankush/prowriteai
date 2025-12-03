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
exports.WorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../common/database");
let WorkspaceService = class WorkspaceService {
    supabaseService;
    constructor(supabaseService) {
        this.supabaseService = supabaseService;
    }
    async getWorkspace(workspaceId, requestingWorkspaceId) {
        if (workspaceId !== requestingWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        console.log('Fetching workspace:', workspaceId);
        const { data: workspaceData, error } = await this.supabaseService.workspaces
            .select('*')
            .eq('id', workspaceId)
            .single();
        console.log('Workspace result:', { data: workspaceData, error });
        if (error || !workspaceData) {
            console.error('Workspace not found:', workspaceId, error);
            throw new common_1.NotFoundException('Workspace not found');
        }
        return workspaceData;
    }
    async getWorkspaceById(workspaceId) {
        const { data: workspaceData, error } = await this.supabaseService.workspaces
            .select('*')
            .eq('id', workspaceId)
            .single();
        if (error || !workspaceData) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        return workspaceData;
    }
    async updateWorkspace(workspaceId, requestingWorkspaceId, data) {
        if (workspaceId !== requestingWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const currentWorkspace = await this.getWorkspaceById(workspaceId);
        const updateData = {};
        if (data.name !== undefined && data.name !== '') {
            updateData.name = data.name;
        }
        if (data.description !== undefined) {
            updateData.description = data.description || null;
        }
        if (data.brand_voice_guide !== undefined) {
            updateData.brand_voice_guide = data.brand_voice_guide;
        }
        if (Object.keys(updateData).length === 0) {
            console.log('No fields to update, returning current workspace');
            return currentWorkspace;
        }
        console.log('Updating workspace:', workspaceId, 'with data:', updateData);
        const { data: updated, error } = await this.supabaseService.workspaces
            .update(updateData)
            .eq('id', workspaceId)
            .select()
            .single();
        if (error) {
            console.error('Failed to update workspace:', error);
            throw new Error(`Failed to update workspace: ${error.message}`);
        }
        if (!updated) {
            throw new Error('Failed to update workspace: No data returned');
        }
        return updated;
    }
    async incrementUsage(workspaceId) {
        const workspace = await this.getWorkspaceById(workspaceId);
        await this.supabaseService.workspaces
            .update({ usage_count: workspace.usage_count + 1 })
            .eq('id', workspaceId);
    }
    async checkUsageLimit(workspaceId) {
        const workspace = await this.getWorkspaceById(workspaceId);
        return workspace.usage_count < workspace.usage_limit;
    }
    async getUsageStats(workspaceId, requestingWorkspaceId) {
        if (workspaceId !== requestingWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const workspace = await this.getWorkspaceById(workspaceId);
        const remaining = Math.max(0, workspace.usage_limit - workspace.usage_count);
        const percentageUsed = workspace.usage_limit > 0
            ? Math.round((workspace.usage_count / workspace.usage_limit) * 100)
            : 0;
        return {
            usage_count: workspace.usage_count,
            usage_limit: workspace.usage_limit,
            remaining,
            percentage_used: percentageUsed,
        };
    }
};
exports.WorkspaceService = WorkspaceService;
exports.WorkspaceService = WorkspaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.SupabaseService])
], WorkspaceService);
//# sourceMappingURL=workspace.service.js.map