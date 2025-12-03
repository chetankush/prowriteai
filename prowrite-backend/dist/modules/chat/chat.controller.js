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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const chat_service_1 = require("./chat.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createConversation(createConversationDto, req) {
        const conversation = await this.chatService.createConversation(req.user.workspace_id, createConversationDto.module_type, createConversationDto.title);
        return dto_1.ConversationResponseDto.fromRow(conversation);
    }
    async listConversations(query, req) {
        const conversations = await this.chatService.listConversations(req.user.workspace_id, query.module_type);
        return conversations.map(dto_1.ConversationResponseDto.fromRow);
    }
    async getConversation(id, req) {
        const conversation = await this.chatService.getConversation(id, req.user.workspace_id);
        return dto_1.ConversationWithMessagesResponseDto.fromConversationWithMessages(conversation);
    }
    async updateConversation(id, updateConversationDto, req) {
        const conversation = await this.chatService.updateConversationTitle(id, req.user.workspace_id, updateConversationDto.title);
        return dto_1.ConversationResponseDto.fromRow(conversation);
    }
    async deleteConversation(id, req) {
        await this.chatService.deleteConversation(id, req.user.workspace_id);
        return { success: true };
    }
    async sendMessage(id, sendMessageDto, req) {
        const brandVoice = await this.getBrandVoice(req.user.workspace_id);
        const { userMessageRow, assistantMessageRow } = await this.chatService.sendMessage(id, req.user.workspace_id, sendMessageDto.content, brandVoice);
        return {
            user_message: dto_1.MessageResponseDto.fromRow(userMessageRow),
            assistant_message: dto_1.MessageResponseDto.fromRow(assistantMessageRow),
        };
    }
    async sendMessageStreaming(id, sendMessageDto, req, rawReq, res) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();
        let isConnectionOpen = true;
        rawReq.on('close', () => {
            isConnectionOpen = false;
        });
        const heartbeatInterval = setInterval(() => {
            if (isConnectionOpen) {
                res.write(': heartbeat\n\n');
            }
        }, 15000);
        try {
            const brandVoice = await this.getBrandVoice(req.user.workspace_id);
            const stream = this.chatService.sendMessageStreaming(id, req.user.workspace_id, sendMessageDto.content, brandVoice);
            for await (const chunk of stream) {
                if (!isConnectionOpen) {
                    break;
                }
                if (chunk.type === 'text') {
                    const textData = { type: 'text', content: chunk.content };
                    if ('title' in chunk) {
                        textData.title = chunk.title;
                    }
                    res.write(`data: ${JSON.stringify(textData)}\n\n`);
                }
                else if (chunk.type === 'done') {
                    const doneData = { type: 'done' };
                    if ('assistantMessageId' in chunk) {
                        doneData.assistantMessageId = chunk.assistantMessageId;
                    }
                    if ('fullContent' in chunk) {
                        doneData.fullContent = chunk.fullContent;
                    }
                    res.write(`data: ${JSON.stringify(doneData)}\n\n`);
                }
                else if (chunk.type === 'error') {
                    res.write(`data: ${JSON.stringify({ type: 'error', error: chunk.error })}\n\n`);
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (isConnectionOpen) {
                res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
            }
        }
        finally {
            clearInterval(heartbeatInterval);
            isConnectionOpen = false;
            res.end();
        }
    }
    async getBrandVoice(workspaceId) {
        return null;
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('conversations'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateConversationDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createConversation", null);
__decorate([
    (0, common_1.Get)('conversations'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ListConversationsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "listConversations", null);
__decorate([
    (0, common_1.Get)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getConversation", null);
__decorate([
    (0, common_1.Patch)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateConversationDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateConversation", null);
__decorate([
    (0, common_1.Delete)('conversations/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteConversation", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('conversations/:id/messages/stream'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __param(3, (0, common_1.Req)()),
    __param(4, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.SendMessageDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessageStreaming", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('api/chat'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.WorkspaceGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map