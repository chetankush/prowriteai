import { Request as ExpressRequest, Response } from 'express';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto, UpdateConversationDto, ConversationResponseDto, ConversationWithMessagesResponseDto, SendMessageResponseDto, ListConversationsQueryDto } from './dto';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createConversation(createConversationDto: CreateConversationDto, req: AuthenticatedRequest): Promise<ConversationResponseDto>;
    listConversations(query: ListConversationsQueryDto, req: AuthenticatedRequest): Promise<ConversationResponseDto[]>;
    getConversation(id: string, req: AuthenticatedRequest): Promise<ConversationWithMessagesResponseDto>;
    updateConversation(id: string, updateConversationDto: UpdateConversationDto, req: AuthenticatedRequest): Promise<ConversationResponseDto>;
    deleteConversation(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    sendMessage(id: string, sendMessageDto: SendMessageDto, req: AuthenticatedRequest): Promise<SendMessageResponseDto>;
    sendMessageStreaming(id: string, sendMessageDto: SendMessageDto, req: AuthenticatedRequest, rawReq: ExpressRequest, res: Response): Promise<void>;
    private getBrandVoice;
}
