import { SupabaseService, TemplateRow, ModuleType } from '@common/database';
import { CreateTemplateDto } from './dto';
export declare class TemplatesService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    hasProPlusSubscription(workspaceId: string): Promise<boolean>;
    getTemplatesByModule(moduleType: ModuleType, workspaceId?: string): Promise<TemplateRow[]>;
    getTemplate(id: string, workspaceId?: string): Promise<TemplateRow>;
    createTemplate(dto: CreateTemplateDto, workspaceId: string): Promise<TemplateRow>;
    createDefaultTemplates(): Promise<void>;
    private getDefaultTemplateDefinitions;
    private getColdEmailTemplates;
    private getWebsiteCopyTemplates;
    private getHRDocsTemplates;
    private getYouTubeScriptsTemplates;
}
