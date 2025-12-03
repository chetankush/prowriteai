import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, TemplateResponseDto } from './dto';
import { AuthGuard, WorkspaceGuard } from '@common/guards';
import { ModuleType, TemplateRow } from '@common/database';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';

@Controller('api/templates')
@UseGuards(AuthGuard, WorkspaceGuard)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  /**
   * GET /api/templates?module_type=
   * List templates by module type
   */
  @Get()
  async getTemplates(
    @Query('module_type') moduleType: ModuleType,
    @Request() req: AuthenticatedRequest,
  ): Promise<TemplateResponseDto[]> {
    const templates = await this.templatesService.getTemplatesByModule(
      moduleType,
      req.user.workspace_id,
    );
    return templates.map(this.toResponseDto);
  }

  /**
   * GET /api/templates/:id
   * Get single template by ID
   */
  @Get(':id')
  async getTemplate(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<TemplateResponseDto> {
    const template = await this.templatesService.getTemplate(id, req.user.workspace_id);
    return this.toResponseDto(template);
  }

  /**
   * POST /api/templates
   * Create custom template (Pro+ subscription required)
   */
  @Post()
  async createTemplate(
    @Body() createTemplateDto: CreateTemplateDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<TemplateResponseDto> {
    const template = await this.templatesService.createTemplate(
      createTemplateDto,
      req.user.workspace_id,
    );
    return this.toResponseDto(template);
  }

  /**
   * Convert Template row to response DTO
   */
  private toResponseDto(template: TemplateRow): TemplateResponseDto {
    return {
      id: template.id,
      workspace_id: template.workspace_id,
      module_type: template.module_type,
      name: template.name,
      description: template.description,
      system_prompt: template.system_prompt,
      input_schema: template.input_schema,
      output_format: template.output_format,
      tags: template.tags,
      is_custom: template.is_custom,
      created_at: new Date(template.created_at),
      updated_at: new Date(template.updated_at),
    };
  }
}
