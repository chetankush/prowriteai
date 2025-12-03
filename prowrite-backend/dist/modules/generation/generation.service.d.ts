import { SupabaseService, GenerationRow } from '@common/database';
import { GeminiService } from './gemini.service';
export declare class GenerationService {
    private readonly supabaseService;
    private readonly geminiService;
    private readonly logger;
    constructor(supabaseService: SupabaseService, geminiService: GeminiService);
    generateContent(workspaceId: string, templateId: string, inputData: Record<string, unknown>, generateVariations?: boolean, variationCount?: number): Promise<GenerationRow>;
    private buildPrompt;
    listGenerations(workspaceId: string): Promise<GenerationRow[]>;
    getGeneration(id: string, workspaceId: string): Promise<GenerationRow>;
    deleteGeneration(id: string, workspaceId: string): Promise<void>;
    regenerateContent(generationId: string, workspaceId: string): Promise<GenerationRow>;
}
