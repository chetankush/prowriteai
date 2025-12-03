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
exports.UsageStatsDto = exports.WorkspaceResponseDto = exports.UpdateWorkspaceDto = exports.BrandVoiceGuideDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class BrandVoiceGuideDto {
    tone;
    style;
    terminology;
    avoid;
}
exports.BrandVoiceGuideDto = BrandVoiceGuideDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'tone must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'tone cannot be empty' }),
    (0, class_validator_1.MaxLength)(100, { message: 'tone cannot exceed 100 characters' }),
    __metadata("design:type", String)
], BrandVoiceGuideDto.prototype, "tone", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'style must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'style cannot be empty' }),
    (0, class_validator_1.MaxLength)(100, { message: 'style cannot exceed 100 characters' }),
    __metadata("design:type", String)
], BrandVoiceGuideDto.prototype, "style", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'terminology must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'each terminology item must be a string' }),
    __metadata("design:type", Array)
], BrandVoiceGuideDto.prototype, "terminology", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'avoid must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'each avoid item must be a string' }),
    __metadata("design:type", Array)
], BrandVoiceGuideDto.prototype, "avoid", void 0);
class UpdateWorkspaceDto {
    name;
    description;
    brand_voice_guide;
}
exports.UpdateWorkspaceDto = UpdateWorkspaceDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'name must be a string' }),
    (0, class_validator_1.MinLength)(1, { message: 'name cannot be empty' }),
    (0, class_validator_1.MaxLength)(100, { message: 'name cannot exceed 100 characters' }),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'description must be a string' }),
    (0, class_validator_1.MaxLength)(500, { message: 'description cannot exceed 500 characters' }),
    __metadata("design:type", String)
], UpdateWorkspaceDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)({ message: 'brand_voice_guide must be a valid object' }),
    (0, class_transformer_1.Type)(() => BrandVoiceGuideDto),
    __metadata("design:type", BrandVoiceGuideDto)
], UpdateWorkspaceDto.prototype, "brand_voice_guide", void 0);
class WorkspaceResponseDto {
    id;
    user_id;
    name;
    description;
    brand_voice_guide;
    usage_limit;
    usage_count;
    created_at;
    updated_at;
}
exports.WorkspaceResponseDto = WorkspaceResponseDto;
class UsageStatsDto {
    usage_count;
    usage_limit;
    remaining;
    percentage_used;
}
exports.UsageStatsDto = UsageStatsDto;
//# sourceMappingURL=index.js.map