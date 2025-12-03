import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '@common/database';
import { TeamService } from './team.service';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetResponseDto,
  AssetVersionResponseDto,
  AssetStatus,
} from './dto';

@Injectable()
export class AssetService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly teamService: TeamService,
  ) {}

  /**
   * Create a new asset
   */
  async createAsset(
    workspaceId: string,
    userId: string,
    dto: CreateAssetDto,
  ): Promise<AssetResponseDto> {
    // Check permission (editor or higher)
    const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'editor');
    if (!hasPermission) {
      throw new ForbiddenException('Only editors and above can create assets');
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

    // Create initial version
    await this.createVersion(data.id, 1, dto.content, userId, 'Initial version');

    return this.toAssetResponse(data);
  }

  /**
   * Get all assets for a workspace
   */
  async getAssets(
    workspaceId: string,
    filters?: {
      asset_type?: string;
      status?: AssetStatus;
      tags?: string[];
      search?: string;
    },
  ): Promise<AssetResponseDto[]> {
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

  /**
   * Get a single asset by ID
   */
  async getAsset(workspaceId: string, assetId: string): Promise<AssetResponseDto> {
    const { data, error } = await this.supabaseService.client
      .from('assets')
      .select('*')
      .eq('id', assetId)
      .eq('workspace_id', workspaceId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Asset not found');
    }

    return this.toAssetResponse(data);
  }

  /**
   * Update an asset
   */
  async updateAsset(
    workspaceId: string,
    assetId: string,
    userId: string,
    dto: UpdateAssetDto,
  ): Promise<AssetResponseDto> {
    // Check permission
    const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'editor');
    if (!hasPermission) {
      throw new ForbiddenException('Only editors and above can update assets');
    }

    // Get current asset
    const current = await this.getAsset(workspaceId, assetId);

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.content !== undefined) updateData.content = dto.content;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.tags !== undefined) updateData.tags = dto.tags;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    const { data, error } = await this.supabaseService.client
      .from('assets')
      .update(updateData)
      .eq('id', assetId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update asset: ${error.message}`);
    }

    // Create new version if content changed
    if (dto.content && dto.content !== current.content) {
      const versions = await this.getAssetVersions(assetId);
      const nextVersion = versions.length + 1;
      await this.createVersion(assetId, nextVersion, dto.content, userId, dto.change_notes);
    }

    return this.toAssetResponse(data);
  }

  /**
   * Delete an asset
   */
  async deleteAsset(
    workspaceId: string,
    assetId: string,
    userId: string,
  ): Promise<void> {
    // Check permission (admin or higher)
    const hasPermission = await this.teamService.hasPermission(workspaceId, userId, 'admin');
    if (!hasPermission) {
      throw new ForbiddenException('Only admins and above can delete assets');
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

  /**
   * Get asset version history
   */
  async getAssetVersions(assetId: string): Promise<AssetVersionResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('asset_versions')
      .select('*')
      .eq('asset_id', assetId)
      .order('version_number', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch versions: ${error.message}`);
    }

    return (data || []).map((v: any) => ({
      id: v.id,
      asset_id: v.asset_id,
      version_number: v.version_number,
      content: v.content,
      changed_by: v.changed_by,
      change_notes: v.change_notes,
      created_at: new Date(v.created_at),
    }));
  }

  /**
   * Restore asset to a previous version
   */
  async restoreVersion(
    workspaceId: string,
    assetId: string,
    versionId: string,
    userId: string,
  ): Promise<AssetResponseDto> {
    // Get the version
    const { data: version, error: versionError } = await this.supabaseService.client
      .from('asset_versions')
      .select('*')
      .eq('id', versionId)
      .eq('asset_id', assetId)
      .single();

    if (versionError || !version) {
      throw new NotFoundException('Version not found');
    }

    // Update asset with version content
    return this.updateAsset(workspaceId, assetId, userId, {
      content: version.content,
      change_notes: `Restored to version ${version.version_number}`,
    });
  }

  /**
   * Create a version record
   */
  private async createVersion(
    assetId: string,
    versionNumber: number,
    content: string,
    changedBy: string,
    changeNotes?: string,
  ): Promise<void> {
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

  /**
   * Convert DB row to response DTO
   */
  private toAssetResponse(data: any): AssetResponseDto {
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
}
