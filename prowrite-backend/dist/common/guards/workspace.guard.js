"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceGuard = void 0;
const common_1 = require("@nestjs/common");
let WorkspaceGuard = class WorkspaceGuard {
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.workspace_id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const requestedWorkspaceId = this.extractWorkspaceId(request);
        if (!requestedWorkspaceId) {
            return true;
        }
        if (requestedWorkspaceId !== user.workspace_id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return true;
    }
    extractWorkspaceId(request) {
        if (request.params?.workspace_id) {
            return request.params.workspace_id;
        }
        if (request.body?.workspace_id && typeof request.body.workspace_id === 'string') {
            return request.body.workspace_id;
        }
        if (request.query?.workspace_id) {
            return request.query.workspace_id;
        }
        return undefined;
    }
};
exports.WorkspaceGuard = WorkspaceGuard;
exports.WorkspaceGuard = WorkspaceGuard = __decorate([
    (0, common_1.Injectable)()
], WorkspaceGuard);
//# sourceMappingURL=workspace.guard.js.map