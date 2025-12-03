export type ModuleType = 'cold_email' | 'hr_docs' | 'youtube_scripts' | 'website_copy' | 'software_docs';
export interface PromptConfig {
    systemPrompt: string;
    moduleType: ModuleType;
    displayName: string;
}
export declare class PromptManagerService {
    private readonly prompts;
    getPromptForModule(moduleType: ModuleType): PromptConfig;
    getSystemPrompt(moduleType: ModuleType): string;
    getAvailableModules(): ModuleType[];
    isValidModuleType(moduleType: string): moduleType is ModuleType;
    getPromptWithBrandVoice(moduleType: ModuleType, brandVoice?: {
        tone?: string;
        style?: string;
        terminology?: string[];
    }): string;
    private buildBrandVoiceSection;
}
