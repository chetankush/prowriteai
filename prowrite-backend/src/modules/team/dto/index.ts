import { IsString, IsEmail, IsEnum, IsOptional, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';

export class InviteTeamMemberDto {
  @IsEmail()
  email!: string;

  @IsEnum(['admin', 'editor', 'viewer'])
  role!: 'admin' | 'editor' | 'viewer';
}

export class UpdateTeamMemberRoleDto {
  @IsEnum(['admin', 'editor', 'viewer'])
  role!: 'admin' | 'editor' | 'viewer';
}

export class TeamMemberResponseDto {
  id!: string;
  workspace_id!: string;
  user_id!: string;
  email?: string;
  role!: TeamRole;
  invited_by?: string;
  invited_at!: Date;
  accepted_at?: Date;
  created_at!: Date;
}

export class TeamInvitationResponseDto {
  id!: string;
  workspace_id!: string;
  email!: string;
  role!: TeamRole;
  invited_by!: string;
  expires_at!: Date;
  created_at!: Date;
}

export class AcceptInvitationDto {
  @IsString()
  token!: string;
}

// Asset DTOs
export type AssetStatus = 'draft' | 'pending_review' | 'approved' | 'archived';
export type AssetType = 'email' | 'job_description' | 'offer_letter' | 'script' | 'landing_page' | 'product_description' | 'other';

export class CreateAssetDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsEnum(['email', 'job_description', 'offer_letter', 'script', 'landing_page', 'product_description', 'other'])
  asset_type!: AssetType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsUUID()
  source_generation_id?: string;

  @IsOptional()
  @IsUUID()
  source_conversation_id?: string;
}

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(['draft', 'pending_review', 'approved', 'archived'])
  status?: AssetStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  change_notes?: string;
}

export class AssetResponseDto {
  id!: string;
  workspace_id!: string;
  created_by!: string;
  title!: string;
  content!: string;
  asset_type!: AssetType;
  status!: AssetStatus;
  tags!: string[];
  metadata?: Record<string, unknown>;
  source_generation_id?: string;
  source_conversation_id?: string;
  created_at!: Date;
  updated_at!: Date;
}

export class AssetVersionResponseDto {
  id!: string;
  asset_id!: string;
  version_number!: number;
  content!: string;
  changed_by!: string;
  change_notes?: string;
  created_at!: Date;
}

// Comment DTOs
export class CreateCommentDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsUUID()
  asset_id?: string;

  @IsOptional()
  @IsUUID()
  generation_id?: string;

  @IsOptional()
  @IsUUID()
  conversation_id?: string;

  @IsOptional()
  @IsUUID()
  parent_comment_id?: string;
}

export class CommentResponseDto {
  id!: string;
  workspace_id!: string;
  user_id!: string;
  user_email?: string;
  content!: string;
  asset_id?: string;
  generation_id?: string;
  conversation_id?: string;
  parent_comment_id?: string;
  created_at!: Date;
  updated_at!: Date;
}

// Approval DTOs
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';

export class CreateApprovalRequestDto {
  @IsUUID()
  asset_id!: string;

  @IsOptional()
  @IsUUID()
  assigned_to?: string;
}

export class UpdateApprovalDto {
  @IsEnum(['approved', 'rejected', 'revision_requested'])
  status!: 'approved' | 'rejected' | 'revision_requested';

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class ApprovalRequestResponseDto {
  id!: string;
  workspace_id!: string;
  asset_id!: string;
  requested_by!: string;
  assigned_to?: string;
  status!: ApprovalStatus;
  feedback?: string;
  created_at!: Date;
  updated_at!: Date;
}

// Personalization DTOs
export class PersonalizationVariable {
  @IsString()
  name!: string;

  @IsString()
  value!: string;
}

export class CreatePersonalizationSetDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PersonalizationVariable)
  variables!: PersonalizationVariable[];
}

export class BulkPersonalizationDto {
  @IsString()
  template_content!: string;

  @IsArray()
  recipients!: Record<string, string>[];
}

export class PersonalizationSetResponseDto {
  id!: string;
  workspace_id!: string;
  name!: string;
  description?: string;
  variables!: PersonalizationVariable[];
  created_by!: string;
  created_at!: Date;
  updated_at!: Date;
}
