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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../common/database");
const prompt_manager_service_1 = require("./prompt-manager.service");
const gemini_service_1 = require("../generation/gemini.service");
const workspace_service_1 = require("../workspace/workspace.service");
class PaymentRequiredException extends common_1.HttpException {
    constructor(message) {
        super(message, common_1.HttpStatus.PAYMENT_REQUIRED);
    }
}
const MAX_CONTEXT_MESSAGES = 20;
const MAX_CONTEXT_CHARS = 12000;
let ChatService = ChatService_1 = class ChatService {
    supabaseService;
    promptManagerService;
    geminiService;
    workspaceService;
    logger = new common_1.Logger(ChatService_1.name);
    constructor(supabaseService, promptManagerService, geminiService, workspaceService) {
        this.supabaseService = supabaseService;
        this.promptManagerService = promptManagerService;
        this.geminiService = geminiService;
        this.workspaceService = workspaceService;
    }
    async createConversation(workspaceId, moduleType, title) {
        this.logger.log(`Creating conversation for workspace ${workspaceId}, module ${moduleType}`);
        if (!this.promptManagerService.isValidModuleType(moduleType)) {
            throw new common_1.NotFoundException(`Invalid module type: ${moduleType}`);
        }
        const conversationTitle = title || 'New Conversation';
        const { data, error } = await this.supabaseService.conversations
            .insert({
            workspace_id: workspaceId,
            module_type: moduleType,
            title: conversationTitle,
        })
            .select()
            .single();
        if (error || !data) {
            this.logger.error(`Failed to create conversation: ${error?.message}`);
            throw new Error(`Failed to create conversation: ${error?.message}`);
        }
        return data;
    }
    async getConversation(conversationId, workspaceId) {
        const { data: conversationData, error: convError } = await this.supabaseService.conversations
            .select('*')
            .eq('id', conversationId)
            .single();
        if (convError || !conversationData) {
            throw new common_1.NotFoundException('Conversation not found');
        }
        const conversation = conversationData;
        if (conversation.workspace_id !== workspaceId) {
            throw new common_1.ForbiddenException('Access denied to this conversation');
        }
        const { data: messagesData, error: msgError } = await this.supabaseService.messages
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });
        if (msgError) {
            this.logger.error(`Failed to fetch messages: ${msgError.message}`);
            throw new Error(`Failed to fetch messages: ${msgError.message}`);
        }
        return {
            ...conversation,
            messages: (messagesData || []),
        };
    }
    async listConversations(workspaceId, moduleType) {
        let query = this.supabaseService.conversations
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('updated_at', { ascending: false });
        if (moduleType) {
            query = query.eq('module_type', moduleType);
        }
        const { data, error } = await query;
        if (error) {
            this.logger.error(`Failed to list conversations: ${error.message}`);
            throw new Error(`Failed to list conversations: ${error.message}`);
        }
        return (data || []);
    }
    async deleteConversation(conversationId, workspaceId) {
        const conversation = await this.getConversation(conversationId, workspaceId);
        const { error } = await this.supabaseService.conversations
            .delete()
            .eq('id', conversation.id);
        if (error) {
            this.logger.error(`Failed to delete conversation: ${error.message}`);
            throw new Error(`Failed to delete conversation: ${error.message}`);
        }
        this.logger.log(`Deleted conversation ${conversationId}`);
    }
    async updateConversationTitle(conversationId, workspaceId, title) {
        await this.getConversation(conversationId, workspaceId);
        const { data, error } = await this.supabaseService.conversations
            .update({ title })
            .eq('id', conversationId)
            .select()
            .single();
        if (error || !data) {
            this.logger.error(`Failed to update conversation title: ${error?.message}`);
            throw new Error(`Failed to update conversation title: ${error?.message}`);
        }
        return data;
    }
    buildConversationContext(messages) {
        const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
        const context = [];
        let totalChars = 0;
        for (const message of recentMessages) {
            const messageContent = message.content;
            if (totalChars + messageContent.length > MAX_CONTEXT_CHARS) {
                if (context.length > 0) {
                    this.logger.log(`Context truncated at ${context.length} messages due to character limit`);
                    break;
                }
                const truncatedContent = messageContent.substring(0, MAX_CONTEXT_CHARS);
                context.push({
                    role: message.role,
                    content: truncatedContent,
                });
                break;
            }
            context.push({
                role: message.role,
                content: messageContent,
            });
            totalChars += messageContent.length;
        }
        return context;
    }
    buildPromptWithContext(moduleType, userMessage, conversationContext, brandVoice) {
        const systemPrompt = this.promptManagerService.getPromptWithBrandVoice(moduleType, brandVoice ? {
            tone: brandVoice.tone,
            style: brandVoice.style,
            terminology: brandVoice.terminology,
        } : undefined);
        let userPrompt = '';
        if (conversationContext.length > 0) {
            userPrompt += '--- Previous Conversation ---\n';
            for (const msg of conversationContext) {
                const roleLabel = msg.role === 'user' ? 'User' : 'Assistant';
                userPrompt += `${roleLabel}: ${msg.content}\n\n`;
            }
            userPrompt += '--- Current Message ---\n';
        }
        userPrompt += userMessage;
        return { systemPrompt, userPrompt };
    }
    async addUserMessage(conversationId, workspaceId, content) {
        await this.getConversation(conversationId, workspaceId);
        const { data, error } = await this.supabaseService.messages
            .insert({
            conversation_id: conversationId,
            role: database_1.MessageRole.USER,
            content,
            generated_content: null,
        })
            .select()
            .single();
        if (error || !data) {
            this.logger.error(`Failed to add user message: ${error?.message}`);
            throw new Error(`Failed to add user message: ${error?.message}`);
        }
        await this.supabaseService.conversations
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        return data;
    }
    async addAssistantMessage(conversationId, content, generatedContent) {
        const { data, error } = await this.supabaseService.messages
            .insert({
            conversation_id: conversationId,
            role: database_1.MessageRole.ASSISTANT,
            content,
            generated_content: generatedContent || null,
        })
            .select()
            .single();
        if (error || !data) {
            this.logger.error(`Failed to add assistant message: ${error?.message}`);
            throw new Error(`Failed to add assistant message: ${error?.message}`);
        }
        await this.supabaseService.conversations
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);
        return data;
    }
    async sendMessage(conversationId, workspaceId, userMessage, brandVoice) {
        const canGenerate = await this.workspaceService.checkUsageLimit(workspaceId);
        if (!canGenerate) {
            throw new PaymentRequiredException('Usage limit reached. Please upgrade your plan to continue generating content.');
        }
        const conversation = await this.getConversation(conversationId, workspaceId);
        const userMessageRow = await this.addUserMessage(conversationId, workspaceId, userMessage);
        const context = this.buildConversationContext(conversation.messages);
        const { systemPrompt, userPrompt } = this.buildPromptWithContext(conversation.module_type, userMessage, context, brandVoice);
        this.logger.log(`Sending message to AI for conversation ${conversationId}`);
        this.logger.debug(`System prompt length: ${systemPrompt.length}`);
        this.logger.debug(`User prompt length: ${userPrompt.length}`);
        try {
            const result = await this.geminiService.generateContent(userPrompt, systemPrompt);
            const generatedContent = this.parseGeneratedContent(result.content);
            const assistantMessageRow = await this.addAssistantMessage(conversationId, result.content, generatedContent);
            await this.workspaceService.incrementUsage(workspaceId);
            this.logger.log(`Usage incremented for workspace ${workspaceId}`);
            this.logger.log(`AI response added to conversation ${conversationId}`);
            return { userMessageRow, assistantMessageRow };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Failed to generate AI response: ${errorMessage}`);
            const assistantMessageRow = await this.addAssistantMessage(conversationId, `I apologize, but I encountered an error while processing your request. Please try again. Error: ${errorMessage}`);
            return { userMessageRow, assistantMessageRow };
        }
    }
    async *sendMessageStreaming(conversationId, workspaceId, userMessage, brandVoice) {
        const canGenerate = await this.workspaceService.checkUsageLimit(workspaceId);
        if (!canGenerate) {
            yield {
                type: 'error',
                error: 'Usage limit reached. Please upgrade your plan to continue generating content.'
            };
            return;
        }
        const conversation = await this.getConversation(conversationId, workspaceId);
        const isFirstMessage = conversation.messages.length === 0;
        const userMessageRow = await this.addUserMessage(conversationId, workspaceId, userMessage);
        let generatedTitle;
        if (isFirstMessage && conversation.title === 'New Conversation') {
            generatedTitle = await this.autoGenerateTitle(conversationId, workspaceId, userMessage);
        }
        yield {
            type: 'text',
            content: '',
            userMessageId: userMessageRow.id,
            ...(generatedTitle && { title: generatedTitle }),
        };
        const context = this.buildConversationContext(conversation.messages);
        const { systemPrompt, userPrompt } = this.buildPromptWithContext(conversation.module_type, userMessage, context, brandVoice);
        this.logger.log(`Starting true streaming response for conversation ${conversationId}`);
        let fullContent = '';
        try {
            const stream = this.geminiService.generateContentStream(userPrompt, systemPrompt);
            for await (const chunk of stream) {
                if (chunk.type === 'text' && chunk.content) {
                    fullContent += chunk.content;
                    yield { type: 'text', content: chunk.content };
                }
                else if (chunk.type === 'error') {
                    throw new Error(chunk.error);
                }
            }
            const generatedContent = this.parseGeneratedContent(fullContent);
            const assistantMessageRow = await this.addAssistantMessage(conversationId, fullContent, generatedContent);
            await this.workspaceService.incrementUsage(workspaceId);
            this.logger.log(`Usage incremented for workspace ${workspaceId}`);
            yield {
                type: 'done',
                assistantMessageId: assistantMessageRow.id,
                fullContent: fullContent
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Streaming error: ${errorMessage}`);
            await this.addAssistantMessage(conversationId, `I apologize, but I encountered an error. Please try again. Error: ${errorMessage}`);
            yield { type: 'error', error: errorMessage };
        }
    }
    parseGeneratedContent(content) {
        const patterns = [
            { type: 'email', regex: /\*\*EMAIL:\*\*\s*```([\s\S]*?)```/i },
            { type: 'subject_lines', regex: /\*\*SUBJECT LINES:\*\*([\s\S]*?)(?=\*\*|$)/i },
            { type: 'script', regex: /\*\*SCRIPT:\*\*\s*```([\s\S]*?)```/i },
            { type: 'landing_page', regex: /\*\*LANDING PAGE COPY:\*\*\s*```([\s\S]*?)```/i },
            { type: 'job_description', regex: /\*\*JOB DESCRIPTION:\*\*\s*```([\s\S]*?)```/i },
            { type: 'code_block', regex: /```[\w]*\n([\s\S]*?)```/ },
        ];
        for (const pattern of patterns) {
            const match = content.match(pattern.regex);
            if (match) {
                return {
                    type: pattern.type,
                    content: match[1].trim(),
                    metadata: {
                        extractedAt: new Date().toISOString(),
                    },
                };
            }
        }
        if (content.length > 100) {
            return {
                type: 'general',
                content: content,
                metadata: {
                    extractedAt: new Date().toISOString(),
                },
            };
        }
        return undefined;
    }
    async autoGenerateTitle(conversationId, workspaceId, firstMessage) {
        const maxTitleLength = 50;
        let title = firstMessage.trim();
        title = title.replace(/\s+/g, ' ');
        if (title.length > maxTitleLength) {
            title = title.substring(0, maxTitleLength - 3) + '...';
        }
        await this.updateConversationTitle(conversationId, workspaceId, title);
        return title;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.SupabaseService,
        prompt_manager_service_1.PromptManagerService,
        gemini_service_1.GeminiService,
        workspace_service_1.WorkspaceService])
], ChatService);
//# sourceMappingURL=chat.service.js.map