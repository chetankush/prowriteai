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
exports.ListConversationsQueryDto = exports.SendMessageResponseDto = exports.ConversationWithMessagesResponseDto = exports.ConversationResponseDto = exports.MessageResponseDto = exports.UpdateConversationDto = exports.SendMessageDto = exports.CreateConversationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const database_1 = require("../../../common/database");
class CreateConversationDto {
    module_type;
    title;
}
exports.CreateConversationDto = CreateConversationDto;
__decorate([
    (0, class_validator_1.IsEnum)(database_1.ModuleType),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "module_type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateConversationDto.prototype, "title", void 0);
class SendMessageDto {
    content;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
class UpdateConversationDto {
    title;
}
exports.UpdateConversationDto = UpdateConversationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateConversationDto.prototype, "title", void 0);
class MessageResponseDto {
    id;
    conversation_id;
    role;
    content;
    generated_content;
    created_at;
    static fromRow(row) {
        const dto = new MessageResponseDto();
        dto.id = row.id;
        dto.conversation_id = row.conversation_id;
        dto.role = row.role;
        dto.content = row.content;
        dto.generated_content = row.generated_content;
        dto.created_at = new Date(row.created_at);
        return dto;
    }
}
exports.MessageResponseDto = MessageResponseDto;
class ConversationResponseDto {
    id;
    workspace_id;
    module_type;
    title;
    created_at;
    updated_at;
    static fromRow(row) {
        const dto = new ConversationResponseDto();
        dto.id = row.id;
        dto.workspace_id = row.workspace_id;
        dto.module_type = row.module_type;
        dto.title = row.title;
        dto.created_at = new Date(row.created_at);
        dto.updated_at = new Date(row.updated_at);
        return dto;
    }
}
exports.ConversationResponseDto = ConversationResponseDto;
class ConversationWithMessagesResponseDto extends ConversationResponseDto {
    messages;
    static fromConversationWithMessages(conversation) {
        const dto = new ConversationWithMessagesResponseDto();
        dto.id = conversation.id;
        dto.workspace_id = conversation.workspace_id;
        dto.module_type = conversation.module_type;
        dto.title = conversation.title;
        dto.created_at = new Date(conversation.created_at);
        dto.updated_at = new Date(conversation.updated_at);
        dto.messages = conversation.messages.map(MessageResponseDto.fromRow);
        return dto;
    }
}
exports.ConversationWithMessagesResponseDto = ConversationWithMessagesResponseDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => MessageResponseDto),
    __metadata("design:type", Array)
], ConversationWithMessagesResponseDto.prototype, "messages", void 0);
class SendMessageResponseDto {
    user_message;
    assistant_message;
}
exports.SendMessageResponseDto = SendMessageResponseDto;
class ListConversationsQueryDto {
    module_type;
}
exports.ListConversationsQueryDto = ListConversationsQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(database_1.ModuleType),
    __metadata("design:type", String)
], ListConversationsQueryDto.prototype, "module_type", void 0);
//# sourceMappingURL=index.js.map