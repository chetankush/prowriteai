import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface GenerationResult {
    content: string;
    tokens: number;
}
export interface StreamChunk {
    type: 'text' | 'done' | 'error';
    content?: string;
    error?: string;
}
export declare class GeminiService implements OnModuleInit {
    private readonly configService;
    private readonly logger;
    private readonly genAI;
    private readonly generationConfig;
    private selectedModel;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    private discoverAvailableModel;
    generateContent(prompt: string, systemInstruction: string): Promise<GenerationResult>;
    generateVariations(prompt: string, systemInstruction: string, count?: number): Promise<string[]>;
    private isDistinctVariation;
    private normalizeForComparison;
    private calculateSimilarity;
    private calculateTokenUsage;
    generateContentStream(prompt: string, systemInstruction: string): AsyncGenerator<StreamChunk>;
}
