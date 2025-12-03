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
exports.TemplateResponseDto = exports.CreateTemplateDto = void 0;
const class_validator_1 = require("class-validator");
const database_1 = require("../../../common/database");
const validators_1 = require("../../../common/validators");
class CreateTemplateDto {
    module_type;
    name;
    description;
    system_prompt;
    input_schema;
    output_format;
    tags;
}
exports.CreateTemplateDto = CreateTemplateDto;
__decorate([
    (0, class_validator_1.IsEnum)(database_1.ModuleType, {
        message: `module_type must be one of: ${Object.values(database_1.ModuleType).join(', ')}`,
    }),
    (0, class_validator_1.IsNotEmpty)({ message: 'module_type is required' }),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "module_type", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'name must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'name is required' }),
    (0, class_validator_1.MinLength)(1, { message: 'name cannot be empty' }),
    (0, class_validator_1.MaxLength)(100, { message: 'name cannot exceed 100 characters' }),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'description must be a string' }),
    (0, class_validator_1.MaxLength)(500, { message: 'description cannot exceed 500 characters' }),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'system_prompt must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'system_prompt is required' }),
    (0, class_validator_1.MinLength)(10, { message: 'system_prompt must be at least 10 characters' }),
    (0, class_validator_1.MaxLength)(10000, { message: 'system_prompt cannot exceed 10000 characters' }),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "system_prompt", void 0);
__decorate([
    (0, class_validator_1.IsObject)({ message: 'input_schema must be an object' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'input_schema is required' }),
    (0, class_validator_1.Validate)(validators_1.IsValidInputSchema, { message: 'input_schema must have a valid fields array' }),
    __metadata("design:type", Object)
], CreateTemplateDto.prototype, "input_schema", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'output_format must be a string' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'output_format is required' }),
    (0, class_validator_1.MinLength)(1, { message: 'output_format cannot be empty' }),
    (0, class_validator_1.MaxLength)(1000, { message: 'output_format cannot exceed 1000 characters' }),
    __metadata("design:type", String)
], CreateTemplateDto.prototype, "output_format", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)({ message: 'tags must be an array' }),
    (0, class_validator_1.IsString)({ each: true, message: 'each tag must be a string' }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'tags cannot exceed 10 items' }),
    __metadata("design:type", Array)
], CreateTemplateDto.prototype, "tags", void 0);
class TemplateResponseDto {
    id;
    workspace_id;
    module_type;
    name;
    description;
    system_prompt;
    input_schema;
    output_format;
    tags;
    is_custom;
    created_at;
    updated_at;
}
exports.TemplateResponseDto = TemplateResponseDto;
//# sourceMappingURL=index.js.map