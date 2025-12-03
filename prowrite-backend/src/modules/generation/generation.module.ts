import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { GenerationService } from './generation.service';
import { GenerationController } from './generation.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [ConfigModule, AuthModule],
  controllers: [GenerationController],
  providers: [GeminiService, GenerationService],
  exports: [GeminiService, GenerationService],
})
export class GenerationModule {}
