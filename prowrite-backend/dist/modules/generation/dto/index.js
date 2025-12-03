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
exports.GenerationResponseDto = exports.GenerationResultDto = exports.GenerateRequestDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GenerateRequestDto {
    template_id;
    input_data;
    generate_variations;
    variation_count;
}
exports.GenerateRequestDto = GenerateRequestDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'template_id must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'template_id is required' }),
    (0, class_validator_1.IsUUID)('4', { message: 'template_id must be a valid UUID' }),
    __metadata("design:type", String)
], GenerateRequestDto.prototype, "template_id", void 0);
__decorate([
    (0, class_validator_1.IsObject)({ message: 'input_data must be an object' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'input_data is required' }),
    __metadata("design:type", Object)
], GenerateRequestDto.prototype, "input_data", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'generate_variations must be a boolean' }),
    __metadata("design:type", Boolean)
], GenerateRequestDto.prototype, "generate_variations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'variation_count must be a number' }),
    (0, class_validator_1.Min)(1, { message: 'variation_count must be at least 1' }),
    (0, class_validator_1.Max)(5, { message: 'variation_count cannot exceed 5' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GenerateRequestDto.prototype, "variation_count", void 0);
class GenerationResultDto {
    id;
    content;
    tokens;
    variations;
}
exports.GenerationResultDto = GenerationResultDto;
class GenerationResponseDto {
    id;
    workspace_id;
    template_id;
    input_data;
    generated_content;
    tokens_used;
    status;
    error_message;
    created_at;
    updated_at;
}
exports.GenerationResponseDto = GenerationResponseDto;
//# sourceMappingURL=index.js.map