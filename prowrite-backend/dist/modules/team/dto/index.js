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
exports.PersonalizationSetResponseDto = exports.BulkPersonalizationDto = exports.CreatePersonalizationSetDto = exports.PersonalizationVariable = exports.ApprovalRequestResponseDto = exports.UpdateApprovalDto = exports.CreateApprovalRequestDto = exports.CommentResponseDto = exports.CreateCommentDto = exports.AssetVersionResponseDto = exports.AssetResponseDto = exports.UpdateAssetDto = exports.CreateAssetDto = exports.AcceptInvitationDto = exports.TeamInvitationResponseDto = exports.TeamMemberResponseDto = exports.UpdateTeamMemberRoleDto = exports.InviteTeamMemberDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class InviteTeamMemberDto {
    email;
    role;
}
exports.InviteTeamMemberDto = InviteTeamMemberDto;
__decorate([
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['admin', 'editor', 'viewer']),
    __metadata("design:type", String)
], InviteTeamMemberDto.prototype, "role", void 0);
class UpdateTeamMemberRoleDto {
    role;
}
exports.UpdateTeamMemberRoleDto = UpdateTeamMemberRoleDto;
__decorate([
    (0, class_validator_1.IsEnum)(['admin', 'editor', 'viewer']),
    __metadata("design:type", String)
], UpdateTeamMemberRoleDto.prototype, "role", void 0);
class TeamMemberResponseDto {
    id;
    workspace_id;
    user_id;
    email;
    role;
    invited_by;
    invited_at;
    accepted_at;
    created_at;
}
exports.TeamMemberResponseDto = TeamMemberResponseDto;
class TeamInvitationResponseDto {
    id;
    workspace_id;
    email;
    role;
    invited_by;
    expires_at;
    created_at;
}
exports.TeamInvitationResponseDto = TeamInvitationResponseDto;
class AcceptInvitationDto {
    token;
}
exports.AcceptInvitationDto = AcceptInvitationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AcceptInvitationDto.prototype, "token", void 0);
class CreateAssetDto {
    title;
    content;
    asset_type;
    tags;
    metadata;
    source_generation_id;
    source_conversation_id;
}
exports.CreateAssetDto = CreateAssetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['email', 'job_description', 'offer_letter', 'script', 'landing_page', 'product_description', 'other']),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "asset_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateAssetDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAssetDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "source_generation_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateAssetDto.prototype, "source_conversation_id", void 0);
class UpdateAssetDto {
    title;
    content;
    status;
    tags;
    metadata;
    change_notes;
}
exports.UpdateAssetDto = UpdateAssetDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['draft', 'pending_review', 'approved', 'archived']),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateAssetDto.prototype, "tags", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateAssetDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateAssetDto.prototype, "change_notes", void 0);
class AssetResponseDto {
    id;
    workspace_id;
    created_by;
    title;
    content;
    asset_type;
    status;
    tags;
    metadata;
    source_generation_id;
    source_conversation_id;
    created_at;
    updated_at;
}
exports.AssetResponseDto = AssetResponseDto;
class AssetVersionResponseDto {
    id;
    asset_id;
    version_number;
    content;
    changed_by;
    change_notes;
    created_at;
}
exports.AssetVersionResponseDto = AssetVersionResponseDto;
class CreateCommentDto {
    content;
    asset_id;
    generation_id;
    conversation_id;
    parent_comment_id;
}
exports.CreateCommentDto = CreateCommentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "content", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "asset_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "generation_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "conversation_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateCommentDto.prototype, "parent_comment_id", void 0);
class CommentResponseDto {
    id;
    workspace_id;
    user_id;
    user_email;
    content;
    asset_id;
    generation_id;
    conversation_id;
    parent_comment_id;
    created_at;
    updated_at;
}
exports.CommentResponseDto = CommentResponseDto;
class CreateApprovalRequestDto {
    asset_id;
    assigned_to;
}
exports.CreateApprovalRequestDto = CreateApprovalRequestDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApprovalRequestDto.prototype, "asset_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateApprovalRequestDto.prototype, "assigned_to", void 0);
class UpdateApprovalDto {
    status;
    feedback;
}
exports.UpdateApprovalDto = UpdateApprovalDto;
__decorate([
    (0, class_validator_1.IsEnum)(['approved', 'rejected', 'revision_requested']),
    __metadata("design:type", String)
], UpdateApprovalDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateApprovalDto.prototype, "feedback", void 0);
class ApprovalRequestResponseDto {
    id;
    workspace_id;
    asset_id;
    requested_by;
    assigned_to;
    status;
    feedback;
    created_at;
    updated_at;
}
exports.ApprovalRequestResponseDto = ApprovalRequestResponseDto;
class PersonalizationVariable {
    name;
    value;
}
exports.PersonalizationVariable = PersonalizationVariable;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PersonalizationVariable.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PersonalizationVariable.prototype, "value", void 0);
class CreatePersonalizationSetDto {
    name;
    description;
    variables;
}
exports.CreatePersonalizationSetDto = CreatePersonalizationSetDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonalizationSetDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePersonalizationSetDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PersonalizationVariable),
    __metadata("design:type", Array)
], CreatePersonalizationSetDto.prototype, "variables", void 0);
class BulkPersonalizationDto {
    template_content;
    recipients;
}
exports.BulkPersonalizationDto = BulkPersonalizationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], BulkPersonalizationDto.prototype, "template_content", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], BulkPersonalizationDto.prototype, "recipients", void 0);
class PersonalizationSetResponseDto {
    id;
    workspace_id;
    name;
    description;
    variables;
    created_by;
    created_at;
    updated_at;
}
exports.PersonalizationSetResponseDto = PersonalizationSetResponseDto;
//# sourceMappingURL=index.js.map