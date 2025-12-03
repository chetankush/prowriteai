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
var GeminiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const generative_ai_1 = require("@google/generative-ai");
const PREFERRED_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro',
];
let GeminiService = GeminiService_1 = class GeminiService {
    configService;
    logger = new common_1.Logger(GeminiService_1.name);
    genAI;
    generationConfig;
    selectedModel = 'gemini-1.5-flash';
    constructor(configService) {
        this.configService = configService;
        const apiKey = this.configService.get('GEMINI_API_KEY');
        if (!apiKey || apiKey === '[GET_FROM_GOOGLE_AI_STUDIO]') {
            this.logger.warn('GEMINI_API_KEY not configured - AI generation will not work');
            this.logger.warn('Get a free API key from: https://aistudio.google.com/app/apikey');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey || '');
        this.generationConfig = {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
        };
    }
    async onModuleInit() {
        await this.discoverAvailableModel();
    }
    async discoverAvailableModel() {
        try {
            this.logger.log('Discovering available Gemini models...');
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.configService.get('GEMINI_API_KEY')}`);
            if (response.ok) {
                const data = await response.json();
                const availableModels = data.models || [];
                this.logger.log(`Found ${availableModels.length} models`);
                const modelNames = availableModels.map((m) => m.name);
                this.logger.debug(`Available models: ${modelNames.slice(0, 10).join(', ')}...`);
                for (const preferred of PREFERRED_MODELS) {
                    const found = availableModels.find((m) => m.name === `models/${preferred}` || m.name === preferred);
                    if (found) {
                        this.selectedModel = found.name.replace('models/', '');
                        this.logger.log(`Selected model (exact match): ${this.selectedModel}`);
                        return;
                    }
                }
                for (const preferred of PREFERRED_MODELS) {
                    const found = availableModels.find((m) => m.name.includes(preferred) &&
                        m.supportedGenerationMethods?.includes('generateContent'));
                    if (found) {
                        this.selectedModel = found.name.replace('models/', '');
                        this.logger.log(`Selected model (partial match): ${this.selectedModel}`);
                        return;
                    }
                }
                const textModel = availableModels.find((m) => m.supportedGenerationMethods?.includes('generateContent'));
                if (textModel) {
                    this.selectedModel = textModel.name.replace('models/', '');
                    this.logger.log(`Using fallback model: ${this.selectedModel}`);
                    return;
                }
            }
            else {
                this.logger.warn(`Model discovery API returned ${response.status}`);
            }
            this.logger.warn('Could not discover models, using default: gemini-1.5-flash');
        }
        catch (error) {
            this.logger.warn(`Model discovery failed: ${error}. Using default model.`);
        }
    }
    async generateContent(prompt, systemInstruction) {
        try {
            this.logger.log(`Generating content with model: ${this.selectedModel}`);
            this.logger.debug(`Prompt: ${prompt.substring(0, 200)}...`);
            this.logger.debug(`System instruction length: ${systemInstruction.length}`);
            const modelWithInstruction = this.genAI.getGenerativeModel({
                model: this.selectedModel,
                systemInstruction: systemInstruction,
            });
            this.logger.log('Calling Gemini API...');
            const result = await modelWithInstruction.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: this.generationConfig,
            });
            this.logger.log('Gemini API response received');
            const response = result.response;
            const content = response.text();
            this.logger.log(`Generated content length: ${content.length}`);
            this.logger.debug(`Content preview: ${content.substring(0, 200)}...`);
            const tokens = this.calculateTokenUsage(response);
            this.logger.log(`Tokens used: ${tokens}`);
            return {
                content,
                tokens,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Gemini API error: ${errorMessage}`, errorStack);
            if (error instanceof Error && 'response' in error) {
                this.logger.error(`Error response: ${JSON.stringify(error.response)}`);
            }
            throw new common_1.ServiceUnavailableException(`AI service error: ${errorMessage}`);
        }
    }
    async generateVariations(prompt, systemInstruction, count = 2) {
        if (count < 1) {
            return [];
        }
        if (count === 1) {
            const result = await this.generateContent(prompt, systemInstruction);
            return [result.content];
        }
        const variations = [];
        const maxAttempts = count * 3;
        let attempts = 0;
        const variationInstruction = `${systemInstruction}

IMPORTANT: Generate a unique and distinct version. Be creative with different:
- Word choices and phrasing
- Sentence structures
- Opening hooks
- Call-to-action approaches
Each version should feel fresh while maintaining the same core message.`;
        while (variations.length < count && attempts < maxAttempts) {
            attempts++;
            try {
                const modelWithInstruction = this.genAI.getGenerativeModel({
                    model: this.selectedModel,
                    systemInstruction: variationInstruction,
                });
                const variationConfig = {
                    ...this.generationConfig,
                    temperature: 0.9 + attempts * 0.02,
                };
                const result = await modelWithInstruction.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: variationConfig,
                });
                const content = result.response.text();
                if (this.isDistinctVariation(content, variations)) {
                    variations.push(content);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                this.logger.warn(`Variation attempt ${attempts} failed: ${errorMessage}`);
            }
        }
        if (variations.length < count) {
            this.logger.warn(`Only generated ${variations.length} distinct variations out of ${count} requested`);
        }
        return variations;
    }
    isDistinctVariation(newContent, existingVariations) {
        if (existingVariations.length === 0) {
            return true;
        }
        const normalizedNew = this.normalizeForComparison(newContent);
        for (const existing of existingVariations) {
            const normalizedExisting = this.normalizeForComparison(existing);
            if (normalizedNew === normalizedExisting) {
                return false;
            }
            const similarity = this.calculateSimilarity(normalizedNew, normalizedExisting);
            if (similarity > 0.9) {
                return false;
            }
        }
        return true;
    }
    normalizeForComparison(content) {
        return content.toLowerCase().replace(/\s+/g, ' ').trim();
    }
    calculateSimilarity(str1, str2) {
        const words1 = new Set(str1.split(' ').filter((w) => w.length > 2));
        const words2 = new Set(str2.split(' ').filter((w) => w.length > 2));
        if (words1.size === 0 && words2.size === 0) {
            return 1;
        }
        const intersection = new Set([...words1].filter((x) => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        return intersection.size / union.size;
    }
    calculateTokenUsage(response) {
        try {
            const resp = response;
            const usageMetadata = resp.usageMetadata;
            if (usageMetadata) {
                const promptTokens = usageMetadata.promptTokenCount || 0;
                const candidateTokens = usageMetadata.candidatesTokenCount || 0;
                return promptTokens + candidateTokens;
            }
            const text = resp.text?.() || '';
            return Math.ceil(text.length / 4);
        }
        catch {
            return 0;
        }
    }
    async *generateContentStream(prompt, systemInstruction) {
        try {
            this.logger.log(`Starting streaming generation with model: ${this.selectedModel}`);
            const modelWithInstruction = this.genAI.getGenerativeModel({
                model: this.selectedModel,
                systemInstruction: systemInstruction,
            });
            const result = await modelWithInstruction.generateContentStream({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: this.generationConfig,
            });
            for await (const chunk of result.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    yield { type: 'text', content: chunkText };
                }
            }
            yield { type: 'done' };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Streaming error: ${errorMessage}`);
            yield { type: 'error', error: errorMessage };
        }
    }
};
exports.GeminiService = GeminiService;
exports.GeminiService = GeminiService = GeminiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], GeminiService);
//# sourceMappingURL=gemini.service.js.map