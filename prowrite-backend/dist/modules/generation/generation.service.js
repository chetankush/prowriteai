"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var GenerationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerationService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../common/database");
const gemini_service_1 = require("./gemini.service");
class PaymentRequiredException extends common_1.HttpException {
    constructor(message) {
        super(message, common_1.HttpStatus.PAYMENT_REQUIRED);
    }
}
const MAX_GENERATIONS_PER_REQUEST = 50;
let GenerationService = GenerationService_1 = class GenerationService {
    supabaseService;
    geminiService;
    logger = new common_1.Logger(GenerationService_1.name);
    constructor(supabaseService, geminiService) {
        this.supabaseService = supabaseService;
        this.geminiService = geminiService;
    }
    async generateContent(workspaceId, templateId, inputData, generateVariations = false, variationCount = 2) {
        const { data: workspaceData, error: workspaceError } = await this.supabaseService.workspaces
            .select('*')
            .eq('id', workspaceId)
            .single();
        if (workspaceError || !workspaceData) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        const workspace = workspaceData;
        if (workspace.usage_count >= workspace.usage_limit) {
            throw new PaymentRequiredException('Usage limit reached. Please upgrade your plan to continue generating content.');
        }
        const { data: templateData, error: templateError } = await this.supabaseService.templates
            .select('*')
            .eq('id', templateId)
            .single();
        if (templateError || !templateData) {
            throw new common_1.NotFoundException('Template not found');
        }
        const template = templateData;
        const { data: generationData, error: createError } = await this.supabaseService.generations
            .insert({
            workspace_id: workspaceId,
            template_id: templateId,
            input_data: inputData,
            status: database_1.GenerationStatus.PENDING,
            tokens_used: 0,
            generated_content: null,
            error_message: null,
        })
            .select()
            .single();
        if (createError || !generationData) {
            throw new Error('Failed to create generation record');
        }
        const generation = generationData;
        try {
            const prompt = this.buildPrompt(template, inputData, workspace.brand_voice_guide);
            this.logger.log(`Built prompt for template: ${template.name}`);
            this.logger.debug(`Prompt: ${prompt.substring(0, 300)}...`);
            let content;
            let tokens;
            let variations;
            if (generateVariations && variationCount > 1) {
                this.logger.log(`Generating ${variationCount} variations`);
                variations = await this.geminiService.generateVariations(prompt, template.system_prompt, variationCount);
                content = variations.join('\n\n---VARIATION---\n\n');
                tokens = Math.ceil(content.length / 4);
            }
            else {
                this.logger.log('Generating single content');
                const result = await this.geminiService.generateContent(prompt, template.system_prompt);
                content = result.content;
                tokens = result.tokens;
                this.logger.log(`Received content from Gemini: ${content.length} chars, ${tokens} tokens`);
            }
            this.logger.log(`Updating generation record ${generation.id} with content`);
            const { data: updated, error: updateError } = await this.supabaseService.generations
                .update({
                generated_content: content,
                tokens_used: tokens,
                status: database_1.GenerationStatus.COMPLETED,
            })
                .eq('id', generation.id)
                .select()
                .single();
            if (updateError) {
                this.logger.error(`Failed to update generation: ${updateError.message}`);
                throw new Error(`Failed to update generation record: ${updateError.message}`);
            }
            if (!updated) {
                this.logger.error('Update returned no data');
                throw new Error('Failed to update generation record: no data returned');
            }
            this.logger.log(`Generation ${generation.id} completed successfully`);
            await this.supabaseService.workspaces
                .update({ usage_count: workspace.usage_count + 1 })
                .eq('id', workspaceId);
            return updated;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.logger.error(`Generation failed: ${errorMessage}`);
            await this.supabaseService.generations
                .update({
                status: database_1.GenerationStatus.FAILED,
                error_message: errorMessage,
            })
                .eq('id', generation.id);
            throw error;
        }
    }
    buildPrompt(template, inputData, brandVoiceGuide) {
        let prompt = '';
        for (const [key, value] of Object.entries(inputData)) {
            prompt += `${key}: ${value}\n`;
        }
        if (brandVoiceGuide) {
            prompt += '\n--- Brand Voice Guidelines ---\n';
            if (brandVoiceGuide.tone) {
                prompt += `Tone: ${brandVoiceGuide.tone}\n`;
            }
            if (brandVoiceGuide.style) {
                prompt += `Style: ${brandVoiceGuide.style}\n`;
            }
            if (brandVoiceGuide.terminology && brandVoiceGuide.terminology.length > 0) {
                prompt += `Preferred terminology: ${brandVoiceGuide.terminology.join(', ')}\n`;
            }
            if (brandVoiceGuide.avoid && brandVoiceGuide.avoid.length > 0) {
                prompt += `Avoid: ${brandVoiceGuide.avoid.join(', ')}\n`;
            }
        }
        return prompt;
    }
    async listGenerations(workspaceId) {
        const { data: generations, error } = await this.supabaseService.generations
            .select('*')
            .eq('workspace_id', workspaceId)
            .order('created_at', { ascending: false })
            .limit(MAX_GENERATIONS_PER_REQUEST);
        if (error) {
            throw new Error('Failed to fetch generations');
        }
        return (generations || []);
    }
    async getGeneration(id, workspaceId) {
        const { data: generationData, error } = await this.supabaseService.generations
            .select('*')
            .eq('id', id)
            .single();
        if (error || !generationData) {
            throw new common_1.NotFoundException('Generation not found');
        }
        const generation = generationData;
        if (generation.workspace_id !== workspaceId) {
            throw new common_1.ForbiddenException('Access denied to this generation');
        }
        return generation;
    }
    async deleteGeneration(id, workspaceId) {
        await this.getGeneration(id, workspaceId);
        await this.supabaseService.generations
            .delete()
            .eq('id', id);
    }
    async regenerateContent(generationId, workspaceId) {
        const originalGeneration = await this.getGeneration(generationId, workspaceId);
        return this.generateContent(workspaceId, originalGeneration.template_id, originalGeneration.input_data);
    }
};
exports.GenerationService = GenerationService;
exports.GenerationService = GenerationService = GenerationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.SupabaseService,
        gemini_service_1.GeminiService])
], GenerationService);
//# sourceMappingURL=generation.service.js.map