import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { AssetService } from './asset.service';
import { ApprovalService } from './approval.service';
import { PersonalizationService } from './personalization.service';
import { AuthGuard, WorkspaceGuard } from '@common/guards';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
import {
  InviteTeamMemberDto,
  UpdateTeamMemberRoleDto,
  CreateAssetDto,
  UpdateAssetDto,
  CreateApprovalRequestDto,
  UpdateApprovalDto,
  CreatePersonalizationSetDto,
  BulkPersonalizationDto,
  AssetStatus,
  ApprovalStatus,
} from './dto';

@Controller('api/team')
@UseGuards(AuthGuard, WorkspaceGuard)
export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly assetService: AssetService,
    private readonly approvalService: ApprovalService,
    private readonly personalizationService: PersonalizationService,
  ) {}

  // ==================== Team Members ====================

  /**
   * GET /api/team/members
   * Get all team members
   */
  @Get('members')
  async getTeamMembers(@Request() req: AuthenticatedRequest) {
    return this.teamService.getTeamMembers(req.user.workspace_id);
  }

  /**
   * POST /api/team/invite
   * Invite a new team member
   */
  @Post('invite')
  async inviteTeamMember(
    @Body() dto: InviteTeamMemberDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamService.inviteTeamMember(
      req.user.workspace_id,
      req.user.sub,
      dto,
    );
  }

  /**
   * GET /api/team/invitations
   * Get pending invitations
   */
  @Get('invitations')
  async getPendingInvitations(@Request() req: AuthenticatedRequest) {
    return this.teamService.getPendingInvitations(req.user.workspace_id);
  }

  /**
   * DELETE /api/team/invitations/:id
   * Cancel an invitation
   */
  @Delete('invitations/:id')
  async cancelInvitation(
    @Param('id') invitationId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.teamService.cancelInvitation(
      req.user.workspace_id,
      invitationId,
      req.user.sub,
    );
    return { success: true };
  }

  /**
   * PUT /api/team/members/:id/role
   * Update team member role
   */
  @Put('members/:id/role')
  async updateMemberRole(
    @Param('id') memberId: string,
    @Body() dto: UpdateTeamMemberRoleDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.teamService.updateMemberRole(
      req.user.workspace_id,
      memberId,
      req.user.sub,
      dto,
    );
  }

  /**
   * DELETE /api/team/members/:id
   * Remove a team member
   */
  @Delete('members/:id')
  async removeMember(
    @Param('id') memberId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.teamService.removeMember(
      req.user.workspace_id,
      memberId,
      req.user.sub,
    );
    return { success: true };
  }

  // ==================== Assets ====================

  /**
   * GET /api/team/assets
   * Get all assets with optional filters
   */
  @Get('assets')
  async getAssets(
    @Query('asset_type') assetType?: string,
    @Query('status') status?: AssetStatus,
    @Query('tags') tags?: string,
    @Query('search') search?: string,
    @Request() req?: AuthenticatedRequest,
  ) {
    return this.assetService.getAssets(req!.user.workspace_id, {
      asset_type: assetType,
      status,
      tags: tags ? tags.split(',') : undefined,
      search,
    });
  }

  /**
   * GET /api/team/assets/:id
   * Get a single asset
   */
  @Get('assets/:id')
  async getAsset(
    @Param('id') assetId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.assetService.getAsset(req.user.workspace_id, assetId);
  }

  /**
   * POST /api/team/assets
   * Create a new asset
   */
  @Post('assets')
  async createAsset(
    @Body() dto: CreateAssetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.assetService.createAsset(
      req.user.workspace_id,
      req.user.sub,
      dto,
    );
  }

  /**
   * PUT /api/team/assets/:id
   * Update an asset
   */
  @Put('assets/:id')
  async updateAsset(
    @Param('id') assetId: string,
    @Body() dto: UpdateAssetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.assetService.updateAsset(
      req.user.workspace_id,
      assetId,
      req.user.sub,
      dto,
    );
  }

  /**
   * DELETE /api/team/assets/:id
   * Delete an asset
   */
  @Delete('assets/:id')
  async deleteAsset(
    @Param('id') assetId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.assetService.deleteAsset(
      req.user.workspace_id,
      assetId,
      req.user.sub,
    );
    return { success: true };
  }

  /**
   * GET /api/team/assets/:id/versions
   * Get asset version history
   */
  @Get('assets/:id/versions')
  async getAssetVersions(@Param('id') assetId: string) {
    return this.assetService.getAssetVersions(assetId);
  }

  /**
   * POST /api/team/assets/:id/restore/:versionId
   * Restore asset to a previous version
   */
  @Post('assets/:id/restore/:versionId')
  async restoreVersion(
    @Param('id') assetId: string,
    @Param('versionId') versionId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.assetService.restoreVersion(
      req.user.workspace_id,
      assetId,
      versionId,
      req.user.sub,
    );
  }

  // ==================== Approvals ====================

  /**
   * GET /api/team/approvals
   * Get all approval requests
   */
  @Get('approvals')
  async getApprovalRequests(
    @Query('status') status?: ApprovalStatus,
    @Request() req?: AuthenticatedRequest,
  ) {
    return this.approvalService.getApprovalRequests(req!.user.workspace_id, {
      status,
    });
  }

  /**
   * GET /api/team/approvals/my-pending
   * Get my pending approvals
   */
  @Get('approvals/my-pending')
  async getMyPendingApprovals(@Request() req: AuthenticatedRequest) {
    return this.approvalService.getMyPendingApprovals(
      req.user.workspace_id,
      req.user.sub,
    );
  }

  /**
   * POST /api/team/approvals
   * Create an approval request
   */
  @Post('approvals')
  async createApprovalRequest(
    @Body() dto: CreateApprovalRequestDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.approvalService.createApprovalRequest(
      req.user.workspace_id,
      req.user.sub,
      dto,
    );
  }

  /**
   * PUT /api/team/approvals/:id
   * Update approval status
   */
  @Put('approvals/:id')
  async updateApproval(
    @Param('id') approvalId: string,
    @Body() dto: UpdateApprovalDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.approvalService.updateApproval(
      req.user.workspace_id,
      approvalId,
      req.user.sub,
      dto,
    );
  }

  // ==================== Personalization ====================

  /**
   * GET /api/team/personalization-sets
   * Get all personalization sets
   */
  @Get('personalization-sets')
  async getPersonalizationSets(@Request() req: AuthenticatedRequest) {
    return this.personalizationService.getPersonalizationSets(req.user.workspace_id);
  }

  /**
   * POST /api/team/personalization-sets
   * Create a personalization set
   */
  @Post('personalization-sets')
  async createPersonalizationSet(
    @Body() dto: CreatePersonalizationSetDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.personalizationService.createPersonalizationSet(
      req.user.workspace_id,
      req.user.sub,
      dto,
    );
  }

  /**
   * DELETE /api/team/personalization-sets/:id
   * Delete a personalization set
   */
  @Delete('personalization-sets/:id')
  async deletePersonalizationSet(
    @Param('id') setId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.personalizationService.deletePersonalizationSet(
      req.user.workspace_id,
      setId,
    );
    return { success: true };
  }

  /**
   * POST /api/team/personalize/bulk
   * Bulk personalization - generate multiple versions
   */
  @Post('personalize/bulk')
  async bulkPersonalize(@Body() dto: BulkPersonalizationDto) {
    const results = this.personalizationService.bulkPersonalize(dto);
    return { results, count: results.length };
  }

  /**
   * POST /api/team/personalize/extract-variables
   * Extract variable names from a template
   */
  @Post('personalize/extract-variables')
  async extractVariables(@Body() body: { template: string }) {
    const variables = this.personalizationService.extractVariables(body.template);
    return { variables };
  }

  /**
   * POST /api/team/personalize/parse-csv
   * Parse CSV content into recipient records
   */
  @Post('personalize/parse-csv')
  async parseCSV(@Body() body: { csv_content: string }) {
    const recipients = this.personalizationService.parseCSV(body.csv_content);
    return { recipients, count: recipients.length };
  }
}
