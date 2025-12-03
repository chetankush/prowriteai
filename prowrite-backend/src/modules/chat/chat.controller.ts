import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';
import { ChatService } from './chat.service';
import {
  CreateConversationDto,
  SendMessageDto,
  UpdateConversationDto,
  ConversationResponseDto,
  ConversationWithMessagesResponseDto,
  MessageResponseDto,
  SendMessageResponseDto,
  ListConversationsQueryDto,
} from './dto';
import { AuthGuard, WorkspaceGuard } from '@common/guards';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';

@Controller('api/chat')
@UseGuards(AuthGuard, WorkspaceGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/chat/conversations
   * Create a new conversation
   * Requirements: 5.1
   */
  @Post('conversations')
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.chatService.createConversation(
      req.user.workspace_id,
      createConversationDto.module_type,
      createConversationDto.title,
    );
    return ConversationResponseDto.fromRow(conversation);
  }

  /**
   * GET /api/chat/conversations
   * List all conversations for the workspace
   * Requirements: 5.4
   */
  @Get('conversations')
  async listConversations(
    @Query() query: ListConversationsQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ConversationResponseDto[]> {
    const conversations = await this.chatService.listConversations(
      req.user.workspace_id,
      query.module_type,
    );
    return conversations.map(ConversationResponseDto.fromRow);
  }


  /**
   * GET /api/chat/conversations/:id
   * Get a conversation with all its messages
   * Requirements: 5.4
   */
  @Get('conversations/:id')
  async getConversation(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ConversationWithMessagesResponseDto> {
    const conversation = await this.chatService.getConversation(
      id,
      req.user.workspace_id,
    );
    return ConversationWithMessagesResponseDto.fromConversationWithMessages(conversation);
  }

  /**
   * PATCH /api/chat/conversations/:id
   * Update conversation title
   * Requirements: 5.1
   */
  @Patch('conversations/:id')
  async updateConversation(
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.chatService.updateConversationTitle(
      id,
      req.user.workspace_id,
      updateConversationDto.title,
    );
    return ConversationResponseDto.fromRow(conversation);
  }

  /**
   * DELETE /api/chat/conversations/:id
   * Delete a conversation and all its messages
   * Requirements: 5.5
   */
  @Delete('conversations/:id')
  async deleteConversation(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ success: boolean }> {
    await this.chatService.deleteConversation(id, req.user.workspace_id);
    return { success: true };
  }

  /**
   * POST /api/chat/conversations/:id/messages
   * Send a message and get AI response (non-streaming)
   * Requirements: 5.2, 5.4
   */
  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<SendMessageResponseDto> {
    // Get workspace brand voice settings
    const brandVoice = await this.getBrandVoice(req.user.workspace_id);

    const { userMessageRow, assistantMessageRow } = await this.chatService.sendMessage(
      id,
      req.user.workspace_id,
      sendMessageDto.content,
      brandVoice,
    );

    return {
      user_message: MessageResponseDto.fromRow(userMessageRow),
      assistant_message: MessageResponseDto.fromRow(assistantMessageRow),
    };
  }

  /**
   * POST /api/chat/conversations/:id/messages/stream
   * Send a message and get AI response (streaming via SSE)
   * Requirements: 5.2
   * 
   * SSE Event Types:
   * - text: Streaming text chunk { type: 'text', content: string }
   * - done: Stream complete { type: 'done', assistantMessageId?: string }
   * - error: Error occurred { type: 'error', error: string }
   */
  @Post('conversations/:id/messages/stream')
  async sendMessageStreaming(
    @Param('id') id: string,
    @Body() sendMessageDto: SendMessageDto,
    @Request() req: AuthenticatedRequest,
    @Req() rawReq: ExpressRequest,
    @Res() res: Response,
  ): Promise<void> {
    // Set up SSE headers for proper streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    // Track if connection is still open
    let isConnectionOpen = true;

    // Handle client disconnect
    rawReq.on('close', () => {
      isConnectionOpen = false;
    });

    // Send heartbeat to keep connection alive
    const heartbeatInterval = setInterval(() => {
      if (isConnectionOpen) {
        res.write(': heartbeat\n\n');
      }
    }, 15000);

    try {
      // Get workspace brand voice settings
      const brandVoice = await this.getBrandVoice(req.user.workspace_id);

      const stream = this.chatService.sendMessageStreaming(
        id,
        req.user.workspace_id,
        sendMessageDto.content,
        brandVoice,
      );

      for await (const chunk of stream) {
        // Check if client disconnected
        if (!isConnectionOpen) {
          break;
        }

        if (chunk.type === 'text') {
          const textData: Record<string, unknown> = { type: 'text', content: chunk.content };
          // Include title if auto-generated (sent with first chunk)
          if ('title' in chunk) {
            textData.title = chunk.title;
          }
          res.write(`data: ${JSON.stringify(textData)}\n\n`);
        } else if (chunk.type === 'done') {
          // Include additional metadata in done event
          const doneData: Record<string, unknown> = { type: 'done' };
          if ('assistantMessageId' in chunk) {
            doneData.assistantMessageId = chunk.assistantMessageId;
          }
          if ('fullContent' in chunk) {
            doneData.fullContent = chunk.fullContent;
          }
          res.write(`data: ${JSON.stringify(doneData)}\n\n`);
        } else if (chunk.type === 'error') {
          res.write(`data: ${JSON.stringify({ type: 'error', error: chunk.error })}\n\n`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (isConnectionOpen) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: errorMessage })}\n\n`);
      }
    } finally {
      clearInterval(heartbeatInterval);
      isConnectionOpen = false;
      res.end();
    }
  }

  /**
   * Helper method to get brand voice settings for a workspace
   */
  private async getBrandVoice(workspaceId: string) {
    // This would typically fetch from workspace settings
    // For now, return null to use default behavior
    // The ChatService handles null brand voice gracefully
    return null;
  }
}
