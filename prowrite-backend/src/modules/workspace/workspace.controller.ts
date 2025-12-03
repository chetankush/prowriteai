import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { UpdateWorkspaceDto, WorkspaceResponseDto, UsageStatsDto } from './dto';
import { AuthGuard, WorkspaceGuard } from '@common/guards';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
import { WorkspaceRow } from '@common/database';

@Controller('api/workspace')
@UseGuards(AuthGuard, WorkspaceGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  /**
   * GET /api/workspace
   * Get current workspace
   */
  @Get()
  async getWorkspace(@Request() req: AuthenticatedRequest): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceService.getWorkspace(
      req.user.workspace_id,
      req.user.workspace_id,
    );
    return this.toResponseDto(workspace);
  }

  /**
   * PUT /api/workspace
   * Update workspace settings
   */
  @Put()
  async updateWorkspace(
    @Body() updateDto: UpdateWorkspaceDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<WorkspaceResponseDto> {
    const workspace = await this.workspaceService.updateWorkspace(
      req.user.workspace_id,
      req.user.workspace_id,
      updateDto,
    );
    return this.toResponseDto(workspace);
  }

  /**
   * GET /api/workspace/usage
   * Get usage statistics
   */
  @Get('usage')
  async getUsage(@Request() req: AuthenticatedRequest): Promise<UsageStatsDto> {
    return this.workspaceService.getUsageStats(
      req.user.workspace_id,
      req.user.workspace_id,
    );
  }

  /**
   * Convert Workspace row to response DTO
   */
  private toResponseDto(workspace: WorkspaceRow): WorkspaceResponseDto {
    return {
      id: workspace.id,
      user_id: workspace.user_id,
      name: workspace.name,
      description: workspace.description,
      brand_voice_guide: workspace.brand_voice_guide,
      usage_limit: workspace.usage_limit,
      usage_count: workspace.usage_count,
      created_at: new Date(workspace.created_at),
      updated_at: new Date(workspace.updated_at),
    };
  }
}
