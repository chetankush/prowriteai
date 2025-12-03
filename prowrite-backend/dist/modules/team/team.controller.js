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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamController = void 0;
const common_1 = require("@nestjs/common");
const team_service_1 = require("./team.service");
const asset_service_1 = require("./asset.service");
const approval_service_1 = require("./approval.service");
const personalization_service_1 = require("./personalization.service");
const guards_1 = require("../../common/guards");
const dto_1 = require("./dto");
let TeamController = class TeamController {
    teamService;
    assetService;
    approvalService;
    personalizationService;
    constructor(teamService, assetService, approvalService, personalizationService) {
        this.teamService = teamService;
        this.assetService = assetService;
        this.approvalService = approvalService;
        this.personalizationService = personalizationService;
    }
    async getTeamMembers(req) {
        return this.teamService.getTeamMembers(req.user.workspace_id);
    }
    async inviteTeamMember(dto, req) {
        return this.teamService.inviteTeamMember(req.user.workspace_id, req.user.sub, dto);
    }
    async getPendingInvitations(req) {
        return this.teamService.getPendingInvitations(req.user.workspace_id);
    }
    async cancelInvitation(invitationId, req) {
        await this.teamService.cancelInvitation(req.user.workspace_id, invitationId, req.user.sub);
        return { success: true };
    }
    async updateMemberRole(memberId, dto, req) {
        return this.teamService.updateMemberRole(req.user.workspace_id, memberId, req.user.sub, dto);
    }
    async removeMember(memberId, req) {
        await this.teamService.removeMember(req.user.workspace_id, memberId, req.user.sub);
        return { success: true };
    }
    async getAssets(assetType, status, tags, search, req) {
        return this.assetService.getAssets(req.user.workspace_id, {
            asset_type: assetType,
            status,
            tags: tags ? tags.split(',') : undefined,
            search,
        });
    }
    async getAsset(assetId, req) {
        return this.assetService.getAsset(req.user.workspace_id, assetId);
    }
    async createAsset(dto, req) {
        return this.assetService.createAsset(req.user.workspace_id, req.user.sub, dto);
    }
    async updateAsset(assetId, dto, req) {
        return this.assetService.updateAsset(req.user.workspace_id, assetId, req.user.sub, dto);
    }
    async deleteAsset(assetId, req) {
        await this.assetService.deleteAsset(req.user.workspace_id, assetId, req.user.sub);
        return { success: true };
    }
    async getAssetVersions(assetId) {
        return this.assetService.getAssetVersions(assetId);
    }
    async restoreVersion(assetId, versionId, req) {
        return this.assetService.restoreVersion(req.user.workspace_id, assetId, versionId, req.user.sub);
    }
    async getApprovalRequests(status, req) {
        return this.approvalService.getApprovalRequests(req.user.workspace_id, {
            status,
        });
    }
    async getMyPendingApprovals(req) {
        return this.approvalService.getMyPendingApprovals(req.user.workspace_id, req.user.sub);
    }
    async createApprovalRequest(dto, req) {
        return this.approvalService.createApprovalRequest(req.user.workspace_id, req.user.sub, dto);
    }
    async updateApproval(approvalId, dto, req) {
        return this.approvalService.updateApproval(req.user.workspace_id, approvalId, req.user.sub, dto);
    }
    async getPersonalizationSets(req) {
        return this.personalizationService.getPersonalizationSets(req.user.workspace_id);
    }
    async createPersonalizationSet(dto, req) {
        return this.personalizationService.createPersonalizationSet(req.user.workspace_id, req.user.sub, dto);
    }
    async deletePersonalizationSet(setId, req) {
        await this.personalizationService.deletePersonalizationSet(req.user.workspace_id, setId);
        return { success: true };
    }
    async bulkPersonalize(dto) {
        const results = this.personalizationService.bulkPersonalize(dto);
        return { results, count: results.length };
    }
    async extractVariables(body) {
        const variables = this.personalizationService.extractVariables(body.template);
        return { variables };
    }
    async parseCSV(body) {
        const recipients = this.personalizationService.parseCSV(body.csv_content);
        return { recipients, count: recipients.length };
    }
};
exports.TeamController = TeamController;
__decorate([
    (0, common_1.Get)('members'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getTeamMembers", null);
__decorate([
    (0, common_1.Post)('invite'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.InviteTeamMemberDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "inviteTeamMember", null);
__decorate([
    (0, common_1.Get)('invitations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getPendingInvitations", null);
__decorate([
    (0, common_1.Delete)('invitations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "cancelInvitation", null);
__decorate([
    (0, common_1.Put)('members/:id/role'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateTeamMemberRoleDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateMemberRole", null);
__decorate([
    (0, common_1.Delete)('members/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)('assets'),
    __param(0, (0, common_1.Query)('asset_type')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('tags')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getAssets", null);
__decorate([
    (0, common_1.Get)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getAsset", null);
__decorate([
    (0, common_1.Post)('assets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateAssetDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createAsset", null);
__decorate([
    (0, common_1.Put)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateAssetDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateAsset", null);
__decorate([
    (0, common_1.Delete)('assets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "deleteAsset", null);
__decorate([
    (0, common_1.Get)('assets/:id/versions'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getAssetVersions", null);
__decorate([
    (0, common_1.Post)('assets/:id/restore/:versionId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('versionId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "restoreVersion", null);
__decorate([
    (0, common_1.Get)('approvals'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getApprovalRequests", null);
__decorate([
    (0, common_1.Get)('approvals/my-pending'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getMyPendingApprovals", null);
__decorate([
    (0, common_1.Post)('approvals'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateApprovalRequestDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createApprovalRequest", null);
__decorate([
    (0, common_1.Put)('approvals/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateApprovalDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "updateApproval", null);
__decorate([
    (0, common_1.Get)('personalization-sets'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "getPersonalizationSets", null);
__decorate([
    (0, common_1.Post)('personalization-sets'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePersonalizationSetDto, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "createPersonalizationSet", null);
__decorate([
    (0, common_1.Delete)('personalization-sets/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "deletePersonalizationSet", null);
__decorate([
    (0, common_1.Post)('personalize/bulk'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.BulkPersonalizationDto]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "bulkPersonalize", null);
__decorate([
    (0, common_1.Post)('personalize/extract-variables'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "extractVariables", null);
__decorate([
    (0, common_1.Post)('personalize/parse-csv'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TeamController.prototype, "parseCSV", null);
exports.TeamController = TeamController = __decorate([
    (0, common_1.Controller)('api/team'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.WorkspaceGuard),
    __metadata("design:paramtypes", [team_service_1.TeamService,
        asset_service_1.AssetService,
        approval_service_1.ApprovalService,
        personalization_service_1.PersonalizationService])
], TeamController);
//# sourceMappingURL=team.controller.js.map