"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslateModule = void 0;
const common_1 = require("@nestjs/common");
const translate_controller_1 = require("./translate.controller");
const translate_service_1 = require("./translate.service");
const auth_module_1 = require("../auth/auth.module");
const generation_module_1 = require("../generation/generation.module");
let TranslateModule = class TranslateModule {
};
exports.TranslateModule = TranslateModule;
exports.TranslateModule = TranslateModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, generation_module_1.GenerationModule],
        controllers: [translate_controller_1.TranslateController],
        providers: [translate_service_1.TranslateService],
        exports: [translate_service_1.TranslateService],
    })
], TranslateModule);
//# sourceMappingURL=translate.module.js.map