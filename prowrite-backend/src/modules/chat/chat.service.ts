import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  SupabaseService,
  ConversationRow,
  MessageRow,
  ModuleType,
  MessageRole,
  GeneratedContent,
  BrandVoiceGuide,
} from '@common/database';
import { PromptManagerService, ModuleType as PromptModuleType } from './prompt-manager.service';
import { GeminiService } from '../generation/gemini.service';
import { WorkspaceService } from '../workspace/workspace.service';

// Custom exception for payment required (402)
class PaymentRequiredException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.PAYMENT_REQUIRED);
  }
}

// Maximum number of messages to include in context window
const MAX_CONTEXT_MESSAGES = 20;
// Maximum characters for context to prevent token overflow
const MAX_CONTEXT_CHARS = 12000;

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

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly promptManagerService: PromptManagerService,
    private readonly geminiService: GeminiService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  /**
   * Create a new conversation for a workspace
   * Requirements: 5.1, 5.4
   */
  async createConversation(
    workspaceId: string,
    moduleType: ModuleType,
    title?: string,
  ): Promise<ConversationRow> {
    this.logger.log(`Creating conversation for workspace ${workspaceId}, module ${moduleType}`);

    // Validate module type
    if (!this.promptManagerService.isValidModuleType(moduleType)) {
      throw new NotFoundException(`Invalid module type: ${moduleType}`);
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

    return data as ConversationRow;
  }


  /**
   * Get a conversation by ID with workspace authorization
   * Requirements: 5.4
   */
  async getConversation(
    conversationId: string,
    workspaceId: string,
  ): Promise<ConversationWithMessages> {
    const { data: conversationData, error: convError } = await this.supabaseService.conversations
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversationData) {
      throw new NotFoundException('Conversation not found');
    }

    const conversation = conversationData as ConversationRow;

    // Check workspace authorization
    if (conversation.workspace_id !== workspaceId) {
      throw new ForbiddenException('Access denied to this conversation');
    }

    // Get messages for this conversation
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
      messages: (messagesData || []) as MessageRow[],
    };
  }

  /**
   * List all conversations for a workspace, optionally filtered by module type
   * Requirements: 5.4, 5.5
   */
  async listConversations(
    workspaceId: string,
    moduleType?: ModuleType,
  ): Promise<ConversationRow[]> {
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

    return (data || []) as ConversationRow[];
  }

  /**
   * Delete a conversation and all its messages
   * Requirements: 5.5
   */
  async deleteConversation(
    conversationId: string,
    workspaceId: string,
  ): Promise<void> {
    // Verify ownership first
    const conversation = await this.getConversation(conversationId, workspaceId);

    // Messages will be cascade deleted due to foreign key constraint
    const { error } = await this.supabaseService.conversations
      .delete()
      .eq('id', conversation.id);

    if (error) {
      this.logger.error(`Failed to delete conversation: ${error.message}`);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }

    this.logger.log(`Deleted conversation ${conversationId}`);
  }

  /**
   * Update conversation title
   * Requirements: 5.1
   */
  async updateConversationTitle(
    conversationId: string,
    workspaceId: string,
    title: string,
  ): Promise<ConversationRow> {
    // Verify ownership first
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

    return data as ConversationRow;
  }


  /**
   * Build conversation context from message history
   * Limits context to prevent token overflow
   * Requirements: 5.4, 5.6
   */
  buildConversationContext(messages: MessageRow[]): ChatMessage[] {
    // Take the most recent messages up to the limit
    const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
    
    const context: ChatMessage[] = [];
    let totalChars = 0;

    // Build context from oldest to newest, but respect character limit
    for (const message of recentMessages) {
      const messageContent = message.content;
      
      // Check if adding this message would exceed the limit
      if (totalChars + messageContent.length > MAX_CONTEXT_CHARS) {
        // If we have at least some context, stop adding more
        if (context.length > 0) {
          this.logger.log(`Context truncated at ${context.length} messages due to character limit`);
          break;
        }
        // If this is the first message and it's too long, truncate it
        const truncatedContent = messageContent.substring(0, MAX_CONTEXT_CHARS);
        context.push({
          role: message.role as 'user' | 'assistant',
          content: truncatedContent,
        });
        break;
      }

      context.push({
        role: message.role as 'user' | 'assistant',
        content: messageContent,
      });
      totalChars += messageContent.length;
    }

    return context;
  }

  /**
   * Build the full prompt with conversation context and brand voice
   * Requirements: 5.4, 5.6
   */
  buildPromptWithContext(
    moduleType: ModuleType,
    userMessage: string,
    conversationContext: ChatMessage[],
    brandVoice?: BrandVoiceGuide | null,
  ): { systemPrompt: string; userPrompt: string } {
    // Get the specialized system prompt with brand voice injected
    const systemPrompt = this.promptManagerService.getPromptWithBrandVoice(
      moduleType as PromptModuleType,
      brandVoice ? {
        tone: brandVoice.tone,
        style: brandVoice.style,
        terminology: brandVoice.terminology,
      } : undefined,
    );

    // Build the user prompt with conversation history
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

  /**
   * Add a user message to a conversation
   * Requirements: 5.4
   */
  async addUserMessage(
    conversationId: string,
    workspaceId: string,
    content: string,
  ): Promise<MessageRow> {
    // Verify conversation ownership
    await this.getConversation(conversationId, workspaceId);

    const { data, error } = await this.supabaseService.messages
      .insert({
        conversation_id: conversationId,
        role: MessageRole.USER,
        content,
        generated_content: null,
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to add user message: ${error?.message}`);
      throw new Error(`Failed to add user message: ${error?.message}`);
    }

    // Update conversation's updated_at timestamp
    await this.supabaseService.conversations
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as MessageRow;
  }

  /**
   * Add an assistant message to a conversation
   * Requirements: 5.3
   */
  async addAssistantMessage(
    conversationId: string,
    content: string,
    generatedContent?: GeneratedContent,
  ): Promise<MessageRow> {
    const { data, error } = await this.supabaseService.messages
      .insert({
        conversation_id: conversationId,
        role: MessageRole.ASSISTANT,
        content,
        generated_content: generatedContent || null,
      })
      .select()
      .single();

    if (error || !data) {
      this.logger.error(`Failed to add assistant message: ${error?.message}`);
      throw new Error(`Failed to add assistant message: ${error?.message}`);
    }

    // Update conversation's updated_at timestamp
    await this.supabaseService.conversations
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return data as MessageRow;
  }


  /**
   * Send a message and get a streaming response from the AI
   * Requirements: 5.2, 5.3, 5.4, 5.6
   */
  async sendMessage(
    conversationId: string,
    workspaceId: string,
    userMessage: string,
    brandVoice?: BrandVoiceGuide | null,
  ): Promise<{ userMessageRow: MessageRow; assistantMessageRow: MessageRow }> {
    // Check usage limit before generating
    const canGenerate = await this.workspaceService.checkUsageLimit(workspaceId);
    if (!canGenerate) {
      throw new PaymentRequiredException(
        'Usage limit reached. Please upgrade your plan to continue generating content.',
      );
    }

    // Get conversation with messages
    const conversation = await this.getConversation(conversationId, workspaceId);

    // Add user message to conversation
    const userMessageRow = await this.addUserMessage(conversationId, workspaceId, userMessage);

    // Build conversation context from existing messages (excluding the just-added user message)
    const context = this.buildConversationContext(conversation.messages);

    // Build prompt with context and brand voice
    const { systemPrompt, userPrompt } = this.buildPromptWithContext(
      conversation.module_type,
      userMessage,
      context,
      brandVoice,
    );

    this.logger.log(`Sending message to AI for conversation ${conversationId}`);
    this.logger.debug(`System prompt length: ${systemPrompt.length}`);
    this.logger.debug(`User prompt length: ${userPrompt.length}`);

    try {
      // Generate response using Gemini
      const result = await this.geminiService.generateContent(userPrompt, systemPrompt);

      // Parse generated content blocks from the response
      const generatedContent = this.parseGeneratedContent(result.content);

      // Add assistant message to conversation
      const assistantMessageRow = await this.addAssistantMessage(
        conversationId,
        result.content,
        generatedContent,
      );

      // Increment usage count after successful generation
      await this.workspaceService.incrementUsage(workspaceId);
      this.logger.log(`Usage incremented for workspace ${workspaceId}`);

      this.logger.log(`AI response added to conversation ${conversationId}`);

      return { userMessageRow, assistantMessageRow };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to generate AI response: ${errorMessage}`);
      
      // Add error message as assistant response
      const assistantMessageRow = await this.addAssistantMessage(
        conversationId,
        `I apologize, but I encountered an error while processing your request. Please try again. Error: ${errorMessage}`,
      );

      return { userMessageRow, assistantMessageRow };
    }
  }

  /**
   * Send a message and stream the response using true SSE streaming
   * Requirements: 5.2, 5.3
   */
  async *sendMessageStreaming(
    conversationId: string,
    workspaceId: string,
    userMessage: string,
    brandVoice?: BrandVoiceGuide | null,
  ): AsyncGenerator<StreamChunk> {
    // Check usage limit before generating
    const canGenerate = await this.workspaceService.checkUsageLimit(workspaceId);
    if (!canGenerate) {
      yield { 
        type: 'error', 
        error: 'Usage limit reached. Please upgrade your plan to continue generating content.' 
      };
      return;
    }

    // Get conversation with messages
    const conversation = await this.getConversation(conversationId, workspaceId);

    // Check if this is the first message (for auto-title generation)
    const isFirstMessage = conversation.messages.length === 0;

    // Add user message to conversation
    const userMessageRow = await this.addUserMessage(conversationId, workspaceId, userMessage);

    // Auto-generate title from first user message
    let generatedTitle: string | undefined;
    if (isFirstMessage && conversation.title === 'New Conversation') {
      generatedTitle = await this.autoGenerateTitle(conversationId, workspaceId, userMessage);
    }

    // Yield user message confirmation with optional title update
    yield { 
      type: 'text', 
      content: '', 
      userMessageId: userMessageRow.id,
      ...(generatedTitle && { title: generatedTitle }),
    } as StreamChunk & { userMessageId?: string; title?: string };

    // Build conversation context from existing messages
    const context = this.buildConversationContext(conversation.messages);

    // Build prompt with context and brand voice
    const { systemPrompt, userPrompt } = this.buildPromptWithContext(
      conversation.module_type,
      userMessage,
      context,
      brandVoice,
    );

    this.logger.log(`Starting true streaming response for conversation ${conversationId}`);

    let fullContent = '';

    try {
      // Use true streaming from Gemini
      const stream = this.geminiService.generateContentStream(userPrompt, systemPrompt);

      for await (const chunk of stream) {
        if (chunk.type === 'text' && chunk.content) {
          fullContent += chunk.content;
          yield { type: 'text', content: chunk.content };
        } else if (chunk.type === 'error') {
          throw new Error(chunk.error);
        }
      }

      // Parse and store the complete response
      const generatedContent = this.parseGeneratedContent(fullContent);
      const assistantMessageRow = await this.addAssistantMessage(
        conversationId, 
        fullContent, 
        generatedContent
      );

      // Increment usage count after successful generation
      await this.workspaceService.incrementUsage(workspaceId);
      this.logger.log(`Usage incremented for workspace ${workspaceId}`);

      // Yield done with message ID for frontend reference
      yield { 
        type: 'done',
        assistantMessageId: assistantMessageRow.id,
        fullContent: fullContent
      } as StreamChunk & { assistantMessageId?: string; fullContent?: string };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Streaming error: ${errorMessage}`);
      
      // Store error message
      await this.addAssistantMessage(
        conversationId,
        `I apologize, but I encountered an error. Please try again. Error: ${errorMessage}`,
      );

      yield { type: 'error', error: errorMessage };
    }
  }

  /**
   * Parse generated content blocks from AI response
   * Extracts structured content like emails, scripts, etc.
   * Requirements: 5.3
   */
  private parseGeneratedContent(content: string): GeneratedContent | undefined {
    // Look for common content block patterns
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

    // If no specific pattern found but content is substantial, return as general content
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

  /**
   * Auto-generate a conversation title from the first user message
   * Requirements: 5.1
   */
  async autoGenerateTitle(
    conversationId: string,
    workspaceId: string,
    firstMessage: string,
  ): Promise<string> {
    // Generate a short title from the first message
    const maxTitleLength = 50;
    let title = firstMessage.trim();

    // Remove newlines and extra spaces
    title = title.replace(/\s+/g, ' ');

    // Truncate if too long
    if (title.length > maxTitleLength) {
      title = title.substring(0, maxTitleLength - 3) + '...';
    }

    // Update the conversation title
    await this.updateConversationTitle(conversationId, workspaceId, title);

    return title;
  }
}
