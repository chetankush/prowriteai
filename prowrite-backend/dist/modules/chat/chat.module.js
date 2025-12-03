"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const prompt_manager_service_1 = require("./prompt-manager.service");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const database_1 = require("../../common/database");
const generation_module_1 = require("../generation/generation.module");
const auth_module_1 = require("../auth/auth.module");
const workspace_module_1 = require("../workspace/workspace.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [database_1.DatabaseModule, generation_module_1.GenerationModule, auth_module_1.AuthModule, workspace_module_1.WorkspaceModule],
        controllers: [chat_controller_1.ChatController],
        providers: [prompt_manager_service_1.PromptManagerService, chat_service_1.ChatService],
        exports: [prompt_manager_service_1.PromptManagerService, chat_service_1.ChatService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map