import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerationConfig } from '@google/generative-ai';

export interface GenerationResult {
  content: string;
  tokens: number;
}

export interface StreamChunk {
  type: 'text' | 'done' | 'error';
  content?: string;
  error?: string;
}

// Preferred models in order of preference (free tier models)
const PREFERRED_MODELS = [
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
  'gemini-1.0-pro',
];

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly generationConfig: GenerationConfig;
  private selectedModel: string = 'gemini-1.5-flash';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey || apiKey === '[GET_FROM_GOOGLE_AI_STUDIO]') {
      this.logger.warn('GEMINI_API_KEY not configured - AI generation will not work');
      this.logger.warn('Get a free API key from: https://aistudio.google.com/app/apikey');
    }

    this.genAI = new GoogleGenerativeAI(apiKey || '');

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

  /**
   * Discover available models and select the best one
   */
  private async discoverAvailableModel(): Promise<void> {
    try {
      this.logger.log('Discovering available Gemini models...');

      // Try to list models
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${this.configService.get<string>('GEMINI_API_KEY')}`,
      );

      if (response.ok) {
        const data = await response.json();
        const availableModels = data.models || [];

        this.logger.log(`Found ${availableModels.length} models`);
        
        // Log available model names for debugging
        const modelNames = availableModels.map((m: { name: string }) => m.name);
        this.logger.debug(`Available models: ${modelNames.slice(0, 10).join(', ')}...`);

        // Find the first preferred model that's available (exact match preferred)
        for (const preferred of PREFERRED_MODELS) {
          const found = availableModels.find(
            (m: { name: string }) =>
              m.name === `models/${preferred}` || m.name === preferred,
          );
          if (found) {
            // Extract just the model name from "models/gemini-xxx"
            this.selectedModel = found.name.replace('models/', '');
            this.logger.log(`Selected model (exact match): ${this.selectedModel}`);
            return;
          }
        }
        
        // Try partial match if no exact match found
        for (const preferred of PREFERRED_MODELS) {
          const found = availableModels.find(
            (m: { name: string; supportedGenerationMethods?: string[] }) =>
              m.name.includes(preferred) && 
              m.supportedGenerationMethods?.includes('generateContent'),
          );
          if (found) {
            this.selectedModel = found.name.replace('models/', '');
            this.logger.log(`Selected model (partial match): ${this.selectedModel}`);
            return;
          }
        }

        // If no preferred model found, use the first available text generation model
        const textModel = availableModels.find(
          (m: { supportedGenerationMethods?: string[] }) =>
            m.supportedGenerationMethods?.includes('generateContent'),
        );
        if (textModel) {
          this.selectedModel = textModel.name.replace('models/', '');
          this.logger.log(`Using fallback model: ${this.selectedModel}`);
          return;
        }
      } else {
        this.logger.warn(`Model discovery API returned ${response.status}`);
      }

      this.logger.warn('Could not discover models, using default: gemini-1.5-flash');
    } catch (error) {
      this.logger.warn(`Model discovery failed: ${error}. Using default model.`);
    }
  }

  /**
   * Generate content using Gemini API with system instruction
   */
  async generateContent(
    prompt: string,
    systemInstruction: string,
  ): Promise<GenerationResult> {
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

      // Calculate token usage from response metadata
      const tokens = this.calculateTokenUsage(response);
      this.logger.log(`Tokens used: ${tokens}`);

      return {
        content,
        tokens,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Gemini API error: ${errorMessage}`, errorStack);
      
      // Log more details about the error
      if (error instanceof Error && 'response' in error) {
        this.logger.error(`Error response: ${JSON.stringify((error as { response?: unknown }).response)}`);
      }
      
      throw new ServiceUnavailableException(
        `AI service error: ${errorMessage}`,
      );
    }
  }

  /**
   * Generate multiple distinct variations for A/B testing
   */
  async generateVariations(
    prompt: string,
    systemInstruction: string,
    count: number = 2,
  ): Promise<string[]> {
    if (count < 1) {
      return [];
    }

    if (count === 1) {
      const result = await this.generateContent(prompt, systemInstruction);
      return [result.content];
    }

    const variations: string[] = [];
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

        const variationConfig: GenerationConfig = {
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
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn(`Variation attempt ${attempts} failed: ${errorMessage}`);
      }
    }

    if (variations.length < count) {
      this.logger.warn(
        `Only generated ${variations.length} distinct variations out of ${count} requested`,
      );
    }

    return variations;
  }

  private isDistinctVariation(
    newContent: string,
    existingVariations: string[],
  ): boolean {
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

  private normalizeForComparison(content: string): string {
    return content.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(' ').filter((w) => w.length > 2));
    const words2 = new Set(str2.split(' ').filter((w) => w.length > 2));

    if (words1.size === 0 && words2.size === 0) {
      return 1;
    }

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  private calculateTokenUsage(response: unknown): number {
    try {
      const resp = response as { usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number }; text?: () => string };
      const usageMetadata = resp.usageMetadata;

      if (usageMetadata) {
        const promptTokens = usageMetadata.promptTokenCount || 0;
        const candidateTokens = usageMetadata.candidatesTokenCount || 0;
        return promptTokens + candidateTokens;
      }

      const text = resp.text?.() || '';
      return Math.ceil(text.length / 4);
    } catch {
      return 0;
    }
  }

  /**
   * Generate content using Gemini API with streaming support
   * Yields chunks of text as they are generated
   * Requirements: 5.2
   */
  async *generateContentStream(
    prompt: string,
    systemInstruction: string,
  ): AsyncGenerator<StreamChunk> {
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Streaming error: ${errorMessage}`);
      yield { type: 'error', error: errorMessage };
    }
  }
}
