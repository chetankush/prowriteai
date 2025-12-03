"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./common/database/database.module");
const auth_1 = require("./modules/auth");
const templates_1 = require("./modules/templates");
const generation_1 = require("./modules/generation");
const workspace_1 = require("./modules/workspace");
const chat_1 = require("./modules/chat");
const billing_1 = require("./modules/billing");
const team_1 = require("./modules/team");
const incident_1 = require("./modules/incident");
const translate_1 = require("./modules/translate");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            database_module_1.DatabaseModule,
            auth_1.AuthModule,
            templates_1.TemplatesModule,
            generation_1.GenerationModule,
            workspace_1.WorkspaceModule,
            chat_1.ChatModule,
            billing_1.BillingModule,
            team_1.TeamModule,
            incident_1.IncidentModule,
            translate_1.TranslateModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map