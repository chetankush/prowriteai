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
exports.AssetService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../common/database");
const team_service_1 = require("./team.service");
let AssetService = class AssetService {
    supabaseService;
    teamService;
    constructor(supabaseService, teamService) {
        this.supabaseService = supabaseService;
        this.teamService = teamService;
    }
    async createAsset(workspaceId, userId, dto) {
        const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'editor');
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Only editors and above can create assets');
        }
        const { data, error } = await this.supabaseService.client
            .from('assets')
            .insert({
            workspace_id: workspaceId,
            created_by: userId,
            title: dto.title,
            content: dto.content,
            asset_type: dto.asset_type,
            tags: dto.tags || [],
            metadata: dto.metadata || {},
            source_generation_id: dto.source_generation_id,
            source_conversation_id: dto.source_conversation_id,
            status: 'draft',
        })
            .select()
            .single();
        if (error) {
            console.error('Failed to create asset:', error);
            throw new Error(`Failed to create asset: ${error.message}`);
        }
        await this.createVersion(data.id, 1, dto.content, userId, 'Initial version');
        return this.toAssetResponse(data);
    }
    async getAssets(workspaceId, filters) {
        let query = this.supabaseService.client
            .from('assets')
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('updated_at', { ascending: false });
        if (filters?.asset_type) {
            query = query.eq('asset_type', filters.asset_type);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }
        if (filters?.tags && filters.tags.length > 0) {
            query = query.overlaps('tags', filters.tags);
        }
        if (filters?.search) {
            query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
        }
        const { data, error } = await query;
        if (error) {
            throw new Error(`Failed to fetch assets: ${error.message}`);
        }
        return (data || []).map(this.toAssetResponse);
    }
    async getAsset(workspaceId, assetId) {
        const { data, error } = await this.supabaseService.client
            .from('assets')
            .select('*')
            .eq('id', assetId)
            .eq('workspace_id', workspaceId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Asset not found');
        }
        return this.toAssetResponse(data);
    }
    async updateAsset(workspaceId, assetId, userId, dto) {
        const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'editor');
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Only editors and above can update assets');
        }
        const current = await this.getAsset(workspaceId, assetId);
        const updateData = {};
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.content !== undefined)
            updateData.content = dto.content;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        if (dto.tags !== undefined)
            updateData.tags = dto.tags;
        if (dto.metadata !== undefined)
            updateData.metadata = dto.metadata;
        const { data, error } = await this.supabaseService.client
            .from('assets')
            .update(updateData)
            .eq('id', assetId)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update asset: ${error.message}`);
        }
        if (dto.content && dto.content !== current.content) {
            const versions = await this.getAssetVersions(assetId);
            const nextVersion = versions.length + 1;
            await this.createVersion(assetId, nextVersion, dto.content, userId, dto.change_notes);
        }
        return this.toAssetResponse(data);
    }
    async deleteAsset(workspaceId, assetId, userId) {
        const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'admin');
        if (!hasPermission) {
            throw new common_1.ForbiddenException('Only admins and above can delete assets');
        }
        const { error } = await this.supabaseService.client
            .from('assets')
            .delete()
            .eq('id', assetId)
            .eq('workspace_id', workspaceId);
        if (error) {
            throw new Error(`Failed to delete asset: ${error.message}`);
        }
    }
    async getAssetVersions(assetId) {
        const { data, error } = await this.supabaseService.client
            .from('asset_versions')
            .select('*')
            .eq('asset_id', assetId)
            .order('version_number', { ascending: false });
        if (error) {
            throw new Error(`Failed to fetch versions: ${error.message}`);
        }
        return (data || []).map((v) => ({
            id: v.id,
            asset_id: v.asset_id,
            version_number: v.version_number,
            content: v.content,
            changed_by: v.changed_by,
            change_notes: v.change_notes,
            created_at: new Date(v.created_at),
        }));
    }
    async restoreVersion(workspaceId, assetId, versionId, userId) {
        const { data: version, error: versionError } = await this.supabaseService.client
            .from('asset_versions')
            .select('*')
            .eq('id', versionId)
            .eq('asset_id', assetId)
            .single();
        if (versionError || !version) {
            throw new common_1.NotFoundException('Version not found');
        }
        return this.updateAsset(workspaceId, assetId, userId, {
            content: version.content,
            change_notes: `Restored to version ${version.version_number}`,
        });
    }
    async createVersion(assetId, versionNumber, content, changedBy, changeNotes) {
        await this.supabaseService.client
            .from('asset_versions')
            .insert({
            asset_id: assetId,
            version_number: versionNumber,
            content,
            changed_by: changedBy,
            change_notes: changeNotes,
        });
    }
    toAssetResponse(data) {
        return {
            id: data.id,
            workspace_id: data.workspace_id,
            created_by: data.created_by,
            title: data.title,
            content: data.content,
            asset_type: data.asset_type,
            status: data.status,
            tags: data.tags || [],
            metadata: data.metadata,
            source_generation_id: data.source_generation_id,
            source_conversation_id: data.source_conversation_id,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
        };
    }
};
exports.AssetService = AssetService;
exports.AssetService = AssetService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.SupabaseService,
        team_service_1.TeamService])
], AssetService);
//# sourceMappingURL=asset.service.js.map