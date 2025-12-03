import { SupabaseService, ConversationRow, MessageRow, ModuleType, GeneratedContent, BrandVoiceGuide } from '@common/database';
import { PromptManagerService } from './prompt-manager.service';
import { GeminiService } from '../generation/gemini.service';
import { WorkspaceService } from '../workspace/workspace.service';
export interface ConversationWithMessages extends ConversationRow {
    messages: MessageRow[];
}
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export interface StreamChunk {
    type: 'text' | 'done' | 'error';
    content?: string;
    error?: string;
}
export declare class ChatService {
    private readonly supabaseService;
    private readonly promptManagerService;
    private readonly geminiService;
    private readonly workspaceService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, promptManagerService: PromptManagerService, geminiService: GeminiService, workspaceService: WorkspaceService);
    createConversation(workspaceId: string, moduleType: ModuleType, title?: string): Promise<ConversationRow>;
    getConversation(conversationId: string, workspaceId: string): Promise<ConversationWithMessages>;
    listConversations(workspaceId: string, moduleType?: ModuleType): Promise<ConversationRow[]>;
    deleteConversation(conversationId: string, workspaceId: string): Promise<void>;
    updateConversationTitle(conversationId: string, workspaceId: string, title: string): Promise<ConversationRow>;
    buildConversationContext(messages: MessageRow[]): ChatMessage[];
    buildPromptWithContext(moduleType: ModuleType, userMessage: string, conversationContext: ChatMessage[], brandVoice?: BrandVoiceGuide | null): {
        systemPrompt: string;
        userPrompt: string;
    };
    addUserMessage(conversationId: string, workspaceId: string, content: string): Promise<MessageRow>;
    addAssistantMessage(conversationId: string, content: string, generatedContent?: GeneratedContent): Promise<MessageRow>;
    sendMessage(conversationId: string, workspaceId: string, userMessage: string, brandVoice?: BrandVoiceGuide | null): Promise<{
        userMessageRow: MessageRow;
        assistantMessageRow: MessageRow;
    }>;
    sendMessageStreaming(conversationId: string, workspaceId: string, userMessage: string, brandVoice?: BrandVoiceGuide | null): AsyncGenerator<StreamChunk>;
    private parseGeneratedContent;
    autoGenerateTitle(conversationId: string, workspaceId: string, firstMessage: string): Promise<string>;
}
