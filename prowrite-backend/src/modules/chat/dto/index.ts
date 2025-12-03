import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ModuleType,
  ConversationRow,
  MessageRow,
  GeneratedContent,
} from '@common/database';

/**
 * DTO for creating a new conversation
 * Requirements: 5.1
 */
export class CreateConversationDto {
  @IsEnum(ModuleType)
  module_type!: ModuleType;

  @IsOptional()
  @IsString()
  title?: string;
}

/**
 * DTO for sending a message in a conversation
 * Requirements: 5.2, 5.4
 */
export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}

/**
 * DTO for updating conversation title
 * Requirements: 5.1
 */
export class UpdateConversationDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

/**
 * Response DTO for a single message
 * Requirements: 5.3
 */
export class MessageResponseDto {
  id!: string;
  conversation_id!: string;
  role!: 'user' | 'assistant';
  content!: string;
  generated_content!: GeneratedContent | null;
  created_at!: Date;

  static fromRow(row: MessageRow): MessageResponseDto {
    const dto = new MessageResponseDto();
    dto.id = row.id;
    dto.conversation_id = row.conversation_id;
    dto.role = row.role as 'user' | 'assistant';
    dto.content = row.content;
    dto.generated_content = row.generated_content;
    dto.created_at = new Date(row.created_at);
    return dto;
  }
}

/**
 * Response DTO for a conversation (without messages)
 * Requirements: 5.1, 5.4
 */
export class ConversationResponseDto {
  id!: string;
  workspace_id!: string;
  module_type!: ModuleType;
  title!: string;
  created_at!: Date;
  updated_at!: Date;

  static fromRow(row: ConversationRow): ConversationResponseDto {
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

/**
 * Response DTO for a conversation with its messages
 * Requirements: 5.4
 */
export class ConversationWithMessagesResponseDto extends ConversationResponseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageResponseDto)
  messages!: MessageResponseDto[];

  static fromConversationWithMessages(
    conversation: ConversationRow & { messages: MessageRow[] },
  ): ConversationWithMessagesResponseDto {
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

/**
 * Response DTO for send message result
 * Requirements: 5.2, 5.3
 */
export class SendMessageResponseDto {
  user_message!: MessageResponseDto;
  assistant_message!: MessageResponseDto;
}

/**
 * Query DTO for listing conversations
 * Requirements: 5.4
 */
export class ListConversationsQueryDto {
  @IsOptional()
  @IsEnum(ModuleType)
  module_type?: ModuleType;
}
