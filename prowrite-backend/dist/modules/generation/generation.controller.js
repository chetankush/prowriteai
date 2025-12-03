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
exports.GenerationController = void 0;
const common_1 = require("@nestjs/common");
const generation_service_1 = require("./generation.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
let GenerationController = class GenerationController {
    generationService;
    constructor(generationService) {
        this.generationService = generationService;
    }
    async generateContent(generateRequestDto, req) {
        const generation = await this.generationService.generateContent(req.user.workspace_id, generateRequestDto.template_id, generateRequestDto.input_data, generateRequestDto.generate_variations, generateRequestDto.variation_count);
        return this.toResponseDto(generation);
    }
    async listGenerations(req) {
        const generations = await this.generationService.listGenerations(req.user.workspace_id);
        return generations.map(this.toResponseDto);
    }
    async getGeneration(id, req) {
        const generation = await this.generationService.getGeneration(id, req.user.workspace_id);
        return this.toResponseDto(generation);
    }
    async deleteGeneration(id, req) {
        await this.generationService.deleteGeneration(id, req.user.workspace_id);
        return { success: true };
    }
    async regenerateContent(id, req) {
        const generation = await this.generationService.regenerateContent(id, req.user.workspace_id);
        return this.toResponseDto(generation);
    }
    toResponseDto(generation) {
        return {
            id: generation.id,
            workspace_id: generation.workspace_id,
            template_id: generation.template_id,
            input_data: generation.input_data,
            generated_content: generation.generated_content,
            tokens_used: generation.tokens_used,
            status: generation.status,
            error_message: generation.error_message,
            created_at: new Date(generation.created_at),
            updated_at: new Date(generation.updated_at),
        };
    }
};
exports.GenerationController = GenerationController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateRequestDto, Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "generateContent", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "listGenerations", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "getGeneration", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "deleteGeneration", null);
__decorate([
    (0, common_1.Post)(':id/regenerate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GenerationController.prototype, "regenerateContent", null);
exports.GenerationController = GenerationController = __decorate([
    (0, common_1.Controller)('api/generation'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.WorkspaceGuard),
    __metadata("design:paramtypes", [generation_service_1.GenerationService])
], GenerationController);
//# sourceMappingURL=generation.controller.js.map