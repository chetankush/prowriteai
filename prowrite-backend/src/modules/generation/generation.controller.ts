import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GenerationService } from './generation.service';
import { GenerateRequestDto, GenerationResponseDto } from './dto';
import { AuthGuard, WorkspaceGuard } from '@common/guards';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
import { GenerationRow } from '@common/database';

@Controller('api/generation')
@UseGuards(AuthGuard, WorkspaceGuard)
export class GenerationController {
  constructor(private readonly generationService: GenerationService) {}

  /**
   * POST /api/generation/generate
   * Create new generation
   * Requirements: 4.1
   */
  @Post('generate')
  async generateContent(
    @Body() generateRequestDto: GenerateRequestDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<GenerationResponseDto> {
    const generation = await this.generationService.generateContent(
      req.user.workspace_id,
      generateRequestDto.template_id,
      generateRequestDto.input_data,
      generateRequestDto.generate_variations,
      generateRequestDto.variation_count,
    );
    return this.toResponseDto(generation);
  }

  /**
   * GET /api/generation/list
   * List user generations
   * Requirements: 8.1
   */
  @Get('list')
  async listGenerations(
    @Request() req: AuthenticatedRequest,
  ): Promise<GenerationResponseDto[]> {
    const generations = await this.generationService.listGenerations(
      req.user.workspace_id,
    );
    return generations.map(this.toResponseDto);
  }

  /**
   * GET /api/generation/:id
   * Get single generation
   * Requirements: 8.2
   */
  @Get(':id')
  async getGeneration(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GenerationResponseDto> {
    const generation = await this.generationService.getGeneration(
      id,
      req.user.workspace_id,
    );
    return this.toResponseDto(generation);
  }

  /**
   * DELETE /api/generation/:id
   * Delete generation
   * Requirements: 8.4
   */
  @Delete(':id')
  async deleteGeneration(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{ success: boolean }> {
    await this.generationService.deleteGeneration(id, req.user.workspace_id);
    return { success: true };
  }

  /**
   * POST /api/generation/:id/regenerate
   * Regenerate content with same inputs
   * Requirements: 4.6
   */
  @Post(':id/regenerate')
  async regenerateContent(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<GenerationResponseDto> {
    const generation = await this.generationService.regenerateContent(
      id,
      req.user.workspace_id,
    );
    return this.toResponseDto(generation);
  }

  /**
   * Convert Generation row to response DTO
   */
  private toResponseDto(generation: GenerationRow): GenerationResponseDto {
    return {
      id: generation.id,
      workspace_id: generation.workspace_id,
      template_id: generation.template_id,
      input_data: generation.input_data as Record<string, unknown>,
      generated_content: generation.generated_content,
      tokens_used: generation.tokens_used,
      status: generation.status,
      error_message: generation.error_message,
      created_at: new Date(generation.created_at),
      updated_at: new Date(generation.updated_at),
    };
  }
}
