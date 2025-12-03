import { Module } from '@nestjs/common';
import { PromptManagerService } from './prompt-manager.service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DatabaseModule } from '@common/database';
import { GenerationModule } from '../generation/generation.module';
import { AuthModule } from '../auth/auth.module';
import { WorkspaceModule } from '../workspace/workspace.module';

@Module({
  imports: [DatabaseModule, GenerationModule, AuthModule, WorkspaceModule],
  controllers: [ChatController],
  providers: [PromptManagerService, ChatService],
  exports: [PromptManagerService, ChatService],
})
export class ChatModule {}
