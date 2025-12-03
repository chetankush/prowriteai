import { ModuleType, ConversationRow, MessageRow, GeneratedContent } from '@common/database';
export declare class CreateConversationDto {
    module_type: ModuleType;
    title?: string;
}
export declare class SendMessageDto {
    content: string;
}
export declare class UpdateConversationDto {
    title: string;
}
export declare class MessageResponseDto {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    generated_content: GeneratedContent | null;
    created_at: Date;
    static fromRow(row: MessageRow): MessageResponseDto;
}
export declare class ConversationResponseDto {
    id: string;
    workspace_id: string;
    module_type: ModuleType;
    title: string;
    created_at: Date;
    updated_at: Date;
    static fromRow(row: ConversationRow): ConversationResponseDto;
}
export declare class ConversationWithMessagesResponseDto extends ConversationResponseDto {
    messages: MessageResponseDto[];
    static fromConversationWithMessages(conversation: ConversationRow & {
        messages: MessageRow[];
    }): ConversationWithMessagesResponseDto;
}
export declare class SendMessageResponseDto {
    user_message: MessageResponseDto;
    assistant_message: MessageResponseDto;
}
export declare class ListConversationsQueryDto {
    module_type?: ModuleType;
}
