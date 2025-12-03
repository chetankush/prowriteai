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
exports.WorkspaceController = void 0;
const common_1 = require("@nestjs/common");
const workspace_service_1 = require("./workspace.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
let WorkspaceController = class WorkspaceController {
    workspaceService;
    constructor(workspaceService) {
        this.workspaceService = workspaceService;
    }
    async getWorkspace(req) {
        const workspace = await this.workspaceService.getWorkspace(req.user.workspace_id, req.user.workspace_id);
        return this.toResponseDto(workspace);
    }
    async updateWorkspace(updateDto, req) {
        const workspace = await this.workspaceService.updateWorkspace(req.user.workspace_id, req.user.workspace_id, updateDto);
        return this.toResponseDto(workspace);
    }
    async getUsage(req) {
        return this.workspaceService.getUsageStats(req.user.workspace_id, req.user.workspace_id);
    }
    toResponseDto(workspace) {
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
};
exports.WorkspaceController = WorkspaceController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "getWorkspace", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UpdateWorkspaceDto, Object]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "updateWorkspace", null);
__decorate([
    (0, common_1.Get)('usage'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WorkspaceController.prototype, "getUsage", null);
exports.WorkspaceController = WorkspaceController = __decorate([
    (0, common_1.Controller)('api/workspace'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.WorkspaceGuard),
    __metadata("design:paramtypes", [workspace_service_1.WorkspaceService])
], WorkspaceController);
//# sourceMappingURL=workspace.controller.js.map