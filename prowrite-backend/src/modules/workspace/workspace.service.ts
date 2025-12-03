import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService, WorkspaceRow, BrandVoiceGuide } from '@common/database';
import { UpdateWorkspaceDto } from './dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Get workspace by ID
   * Validates that the requesting user owns the workspace
   */
  async getWorkspace(workspaceId: string, requestingWorkspaceId: string): Promise<WorkspaceRow> {
    // Check cross-workspace authorization
    if (workspaceId !== requestingWorkspaceId) {
      throw new ForbiddenException('Access denied');
    }

    console.log('Fetching workspace:', workspaceId);

    const { data: workspaceData, error } = await this.supabaseService.workspaces
      .select('*')
      .eq('id', workspaceId)
      .single();

    console.log('Workspace result:', { data: workspaceData, error });

    if (error || !workspaceData) {
      console.error('Workspace not found:', workspaceId, error);
      throw new NotFoundException('Workspace not found');
    }

    return workspaceData as WorkspaceRow;
  }

  /**
   * Get workspace by ID (internal use, no authorization check)
   */
  async getWorkspaceById(workspaceId: string): Promise<WorkspaceRow> {
    const { data: workspaceData, error } = await this.supabaseService.workspaces
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (error || !workspaceData) {
      throw new NotFoundException('Workspace not found');
    }

    return workspaceData as WorkspaceRow;
  }

  /**
   * Update workspace with partial data
   */
  async updateWorkspace(
    workspaceId: string,
    requestingWorkspaceId: string,
    data: UpdateWorkspaceDto,
  ): Promise<WorkspaceRow> {
    // Check cross-workspace authorization
    if (workspaceId !== requestingWorkspaceId) {
      throw new ForbiddenException('Access denied');
    }

    // Verify workspace exists and get current data
    const currentWorkspace = await this.getWorkspaceById(workspaceId);

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined && data.name !== '') {
      updateData.name = data.name;
    }
    if (data.description !== undefined) {
      updateData.description = data.description || null;
    }
    if (data.brand_voice_guide !== undefined) {
      updateData.brand_voice_guide = data.brand_voice_guide as BrandVoiceGuide;
    }

    // If nothing to update, return current workspace
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

    return updated as WorkspaceRow;
  }

  /**
   * Increment usage count for a workspace
   */
  async incrementUsage(workspaceId: string): Promise<void> {
    const workspace = await this.getWorkspaceById(workspaceId);
    
    await this.supabaseService.workspaces
      .update({ usage_count: workspace.usage_count + 1 })
      .eq('id', workspaceId);
  }

  /**
   * Check if workspace has reached usage limit
   * Returns true if usage is allowed, false if limit reached
   */
  async checkUsageLimit(workspaceId: string): Promise<boolean> {
    const workspace = await this.getWorkspaceById(workspaceId);
    return workspace.usage_count < workspace.usage_limit;
  }

  /**
   * Get usage statistics for a workspace
   */
  async getUsageStats(workspaceId: string, requestingWorkspaceId: string): Promise<{
    usage_count: number;
    usage_limit: number;
    remaining: number;
    percentage_used: number;
  }> {
    // Check cross-workspace authorization
    if (workspaceId !== requestingWorkspaceId) {
      throw new ForbiddenException('Access denied');
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
}
