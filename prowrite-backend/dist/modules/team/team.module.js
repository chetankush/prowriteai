"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamModule = void 0;
const common_1 = require("@nestjs/common");
const team_controller_1 = require("./team.controller");
const team_service_1 = require("./team.service");
const asset_service_1 = require("./asset.service");
const approval_service_1 = require("./approval.service");
const personalization_service_1 = require("./personalization.service");
const auth_module_1 = require("../auth/auth.module");
let TeamModule = class TeamModule {
};
exports.TeamModule = TeamModule;
exports.TeamModule = TeamModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule],
        controllers: [team_controller_1.TeamController],
        providers: [
            team_service_1.TeamService,
            asset_service_1.AssetService,
            approval_service_1.ApprovalService,
            personalization_service_1.PersonalizationService,
        ],
        exports: [
            team_service_1.TeamService,
            asset_service_1.AssetService,
            approval_service_1.ApprovalService,
            personalization_service_1.PersonalizationService,
        ],
    })
], TeamModule);
//# sourceMappingURL=team.module.js.map