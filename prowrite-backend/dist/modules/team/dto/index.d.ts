export type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer';
export declare class InviteTeamMemberDto {
    email: string;
    role: 'admin' | 'editor' | 'viewer';
}
export declare class UpdateTeamMemberRoleDto {
    role: 'admin' | 'editor' | 'viewer';
}
export declare class TeamMemberResponseDto {
    id: string;
    workspace_id: string;
    user_id: string;
    email?: string;
    role: TeamRole;
    invited_by?: string;
    invited_at: Date;
    accepted_at?: Date;
    created_at: Date;
}
export declare class TeamInvitationResponseDto {
    id: string;
    workspace_id: string;
    email: string;
    role: TeamRole;
    invited_by: string;
    expires_at: Date;
    created_at: Date;
}
export declare class AcceptInvitationDto {
    token: string;
}
export type AssetStatus = 'draft' | 'pending_review' | 'approved' | 'archived';
export type AssetType = 'email' | 'job_description' | 'offer_letter' | 'script' | 'landing_page' | 'product_description' | 'other';
export declare class CreateAssetDto {
    title: string;
    content: string;
    asset_type: AssetType;
    tags?: string[];
    metadata?: Record<string, unknown>;
    source_generation_id?: string;
    source_conversation_id?: string;
}
export declare class UpdateAssetDto {
    title?: string;
    content?: string;
    status?: AssetStatus;
    tags?: string[];
    metadata?: Record<string, unknown>;
    change_notes?: string;
}
export declare class AssetResponseDto {
    id: string;
    workspace_id: string;
    created_by: string;
    title: string;
    content: string;
    asset_type: AssetType;
    status: AssetStatus;
    tags: string[];
    metadata?: Record<string, unknown>;
    source_generation_id?: string;
    source_conversation_id?: string;
    created_at: Date;
    updated_at: Date;
}
export declare class AssetVersionResponseDto {
    id: string;
    asset_id: string;
    version_number: number;
    content: string;
    changed_by: string;
    change_notes?: string;
    created_at: Date;
}
export declare class CreateCommentDto {
    content: string;
    asset_id?: string;
    generation_id?: string;
    conversation_id?: string;
    parent_comment_id?: string;
}
export declare class CommentResponseDto {
    id: string;
    workspace_id: string;
    user_id: string;
    user_email?: string;
    content: string;
    asset_id?: string;
    generation_id?: string;
    conversation_id?: string;
    parent_comment_id?: string;
    created_at: Date;
    updated_at: Date;
}
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'revision_requested';
export declare class CreateApprovalRequestDto {
    asset_id: string;
    assigned_to?: string;
}
export declare class UpdateApprovalDto {
    status: 'approved' | 'rejected' | 'revision_requested';
    feedback?: string;
}
export declare class ApprovalRequestResponseDto {
    id: string;
    workspace_id: string;
    asset_id: string;
    requested_by: string;
    assigned_to?: string;
    status: ApprovalStatus;
    feedback?: string;
    created_at: Date;
    updated_at: Date;
}
export declare class PersonalizationVariable {
    name: string;
    value: string;
}
export declare class CreatePersonalizationSetDto {
    name: string;
    description?: string;
    variables: PersonalizationVariable[];
}
export declare class BulkPersonalizationDto {
    template_content: string;
    recipients: Record<string, string>[];
}
export declare class PersonalizationSetResponseDto {
    id: string;
    workspace_id: string;
    name: string;
    description?: string;
    variables: PersonalizationVariable[];
    created_by: string;
    created_at: Date;
    updated_at: Date;
}
