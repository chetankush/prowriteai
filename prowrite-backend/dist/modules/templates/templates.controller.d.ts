import { TemplatesService } from './templates.service';
import { CreateTemplateDto, TemplateResponseDto } from './dto';
import { ModuleType } from '@common/database';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
export declare class TemplatesController {
    private readonly templatesService;
    constructor(templatesService: TemplatesService);
    getTemplates(moduleType: ModuleType, req: AuthenticatedRequest): Promise<TemplateResponseDto[]>;
    getTemplate(id: string, req: AuthenticatedRequest): Promise<TemplateResponseDto>;
    createTemplate(createTemplateDto: CreateTemplateDto, req: AuthenticatedRequest): Promise<TemplateResponseDto>;
    private toResponseDto;
}
