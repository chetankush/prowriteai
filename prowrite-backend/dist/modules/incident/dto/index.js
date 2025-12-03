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
exports.UpdateIncidentDto = exports.GenerateIncidentCommsDto = void 0;
const class_validator_1 = require("class-validator");
class GenerateIncidentCommsDto {
    title;
    description;
    severity;
    status;
    impact;
    eta;
    rootCause;
    resolution;
    affectedServices;
    companyName;
}
exports.GenerateIncidentCommsDto = GenerateIncidentCommsDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['critical', 'high', 'medium', 'low']),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "severity", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['investigating', 'identified', 'monitoring', 'resolved']),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "impact", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "eta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "rootCause", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "resolution", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], GenerateIncidentCommsDto.prototype, "affectedServices", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GenerateIncidentCommsDto.prototype, "companyName", void 0);
class UpdateIncidentDto {
    status;
    update;
    eta;
    rootCause;
    resolution;
}
exports.UpdateIncidentDto = UpdateIncidentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['investigating', 'identified', 'monitoring', 'resolved']),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "update", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "eta", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "rootCause", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateIncidentDto.prototype, "resolution", void 0);
//# sourceMappingURL=index.js.map