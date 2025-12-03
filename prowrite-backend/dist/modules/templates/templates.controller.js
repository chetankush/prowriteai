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
exports.TemplatesController = void 0;
const common_1 = require("@nestjs/common");
const templates_service_1 = require("./templates.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
const database_1 = require("../../common/database");
let TemplatesController = class TemplatesController {
    templatesService;
    constructor(templatesService) {
        this.templatesService = templatesService;
    }
    async getTemplates(moduleType, req) {
        const templates = await this.templatesService.getTemplatesByModule(moduleType, req.user.workspace_id);
        return templates.map(this.toResponseDto);
    }
    async getTemplate(id, req) {
        const template = await this.templatesService.getTemplate(id, req.user.workspace_id);
        return this.toResponseDto(template);
    }
    async createTemplate(createTemplateDto, req) {
        const template = await this.templatesService.createTemplate(createTemplateDto, req.user.workspace_id);
        return this.toResponseDto(template);
    }
    toResponseDto(template) {
        return {
            id: template.id,
            workspace_id: template.workspace_id,
            module_type: template.module_type,
            name: template.name,
            description: template.description,
            system_prompt: template.system_prompt,
            input_schema: template.input_schema,
            output_format: template.output_format,
            tags: template.tags,
            is_custom: template.is_custom,
            created_at: new Date(template.created_at),
            updated_at: new Date(template.updated_at),
        };
    }
};
exports.TemplatesController = TemplatesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('module_type')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplates", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "getTemplate", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateTemplateDto, Object]),
    __metadata("design:returntype", Promise)
], TemplatesController.prototype, "createTemplate", null);
exports.TemplatesController = TemplatesController = __decorate([
    (0, common_1.Controller)('api/templates'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.WorkspaceGuard),
    __metadata("design:paramtypes", [templates_service_1.TemplatesService])
], TemplatesController);
//# sourceMappingURL=templates.controller.js.map