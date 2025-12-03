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
exports.TranslateController = void 0;
const common_1 = require("@nestjs/common");
const translate_service_1 = require("./translate.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
let TranslateController = class TranslateController {
    translateService;
    constructor(translateService) {
        this.translateService = translateService;
    }
    async translateForAll(dto) {
        return this.translateService.translateForAllAudiences(dto);
    }
    async translateForAudience(audience, dto) {
        const translation = await this.translateService.translateForAudience(dto, audience);
        return { translation };
    }
};
exports.TranslateController = TranslateController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TranslateTextDto]),
    __metadata("design:returntype", Promise)
], TranslateController.prototype, "translateForAll", null);
__decorate([
    (0, common_1.Post)(':audience'),
    __param(0, (0, common_1.Param)('audience')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.TranslateTextDto]),
    __metadata("design:returntype", Promise)
], TranslateController.prototype, "translateForAudience", null);
exports.TranslateController = TranslateController = __decorate([
    (0, common_1.Controller)('api/translate'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.WorkspaceGuard),
    __metadata("design:paramtypes", [translate_service_1.TranslateService])
], TranslateController);
//# sourceMappingURL=translate.controller.js.map