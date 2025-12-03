import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  SupabaseService,
  GenerationRow,
  WorkspaceRow,
  TemplateRow,
  GenerationStatus,
  BrandVoiceGuide,
} from '@common/database';
import { GeminiService } from './gemini.service';

// Custom exception for payment required (402)
class PaymentRequiredException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.PAYMENT_REQUIRED);
  }
}

const MAX_GENERATIONS_PER_REQUEST = 50;

@Injectable()
export class GenerationService {
  private readonly logger = new Logger(GenerationService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly geminiService: GeminiService,
  ) {}

  /**
   * Generate content using AI based on template and input data
   * Requirements: 4.1, 4.2, 4.3, 4.5
   */
  async generateContent(
    workspaceId: string,
    templateId: string,
    inputData: Record<string, unknown>,
    generateVariations: boolean = false,
    variationCount: number = 2,
  ): Promise<GenerationRow> {
    // Check usage limit (Requirement 4.5)
    const { data: workspaceData, error: workspaceError } = await this.supabaseService.workspaces
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspaceData) {
      throw new NotFoundException('Workspace not found');
    }

    const workspace = workspaceData as WorkspaceRow;

    if (workspace.usage_count >= workspace.usage_limit) {
      throw new PaymentRequiredException(
        'Usage limit reached. Please upgrade your plan to continue generating content.',
      );
    }

    // Get template
    const { data: templateData, error: templateError } = await this.supabaseService.templates
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError || !templateData) {
      throw new NotFoundException('Template not found');
    }

    const template = templateData as TemplateRow;

    // Create generation record with pending status
    const { data: generationData, error: createError } = await this.supabaseService.generations
      .insert({
        workspace_id: workspaceId,
        template_id: templateId,
        input_data: inputData,
        status: GenerationStatus.PENDING,
        tokens_used: 0,
        generated_content: null,
        error_message: null,
      })
      .select()
      .single();

    if (createError || !generationData) {
      throw new Error('Failed to create generation record');
    }

    const generation = generationData as GenerationRow;

    try {
      // Build prompt from template and input data
      const prompt = this.buildPrompt(template, inputData, workspace.brand_voice_guide);
      this.logger.log(`Built prompt for template: ${template.name}`);
      this.logger.debug(`Prompt: ${prompt.substring(0, 300)}...`);

      let content: string;
      let tokens: number;
      let variations: string[] | undefined;

      if (generateVariations && variationCount > 1) {
        // Generate A/B variations (Requirement 5.4)
        this.logger.log(`Generating ${variationCount} variations`);
        variations = await this.geminiService.generateVariations(
          prompt,
          template.system_prompt,
          variationCount,
        );
        content = variations.join('\n\n---VARIATION---\n\n');
        tokens = Math.ceil(content.length / 4); // Estimate tokens
      } else {
        // Generate single content (Requirement 4.1)
        this.logger.log('Generating single content');
        const result = await this.geminiService.generateContent(prompt, template.system_prompt);
        content = result.content;
        tokens = result.tokens;
        this.logger.log(`Received content from Gemini: ${content.length} chars, ${tokens} tokens`);
      }

      // Update generation record with success (Requirement 4.2)
      this.logger.log(`Updating generation record ${generation.id} with content`);
      const { data: updated, error: updateError } = await this.supabaseService.generations
        .update({
          generated_content: content,
          tokens_used: tokens,
          status: GenerationStatus.COMPLETED,
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

      // Increment workspace usage count (Requirement 4.3)
      await this.supabaseService.workspaces
        .update({ usage_count: workspace.usage_count + 1 })
        .eq('id', workspaceId);

      return updated as GenerationRow;
    } catch (error: unknown) {
      // Mark generation as failed (Requirement 4.4)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(`Generation failed: ${errorMessage}`);
      
      await this.supabaseService.generations
        .update({
          status: GenerationStatus.FAILED,
          error_message: errorMessage,
        })
        .eq('id', generation.id);

      throw error;
    }
  }

  /**
   * Build prompt from template and input data
   * Incorporates brand voice guide if available (Requirement 2.4)
   */
  private buildPrompt(
    template: TemplateRow,
    inputData: Record<string, unknown>,
    brandVoiceGuide?: BrandVoiceGuide | null,
  ): string {
    let prompt = '';

    // Add input data as context
    for (const [key, value] of Object.entries(inputData)) {
      prompt += `${key}: ${value}\n`;
    }

    // Add brand voice guide if available
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

  /**
   * List generations for a workspace with sorting
   * Requirements: 8.1, 8.5
   */
  async listGenerations(workspaceId: string): Promise<GenerationRow[]> {
    const { data: generations, error } = await this.supabaseService.generations
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .limit(MAX_GENERATIONS_PER_REQUEST);

    if (error) {
      throw new Error('Failed to fetch generations');
    }

    return (generations || []) as GenerationRow[];
  }

  /**
   * Get a single generation by ID with workspace authorization
   * Requirements: 8.2, 10.2
   */
  async getGeneration(id: string, workspaceId: string): Promise<GenerationRow> {
    const { data: generationData, error } = await this.supabaseService.generations
      .select('*')
      .eq('id', id)
      .single();

    if (error || !generationData) {
      throw new NotFoundException('Generation not found');
    }

    const generation = generationData as GenerationRow;

    // Check workspace authorization (Requirement 10.2)
    if (generation.workspace_id !== workspaceId) {
      throw new ForbiddenException('Access denied to this generation');
    }

    return generation;
  }

  /**
   * Delete a generation
   * Requirements: 8.4
   */
  async deleteGeneration(id: string, workspaceId: string): Promise<void> {
    // Verify ownership first
    await this.getGeneration(id, workspaceId);
    
    await this.supabaseService.generations
      .delete()
      .eq('id', id);
  }

  /**
   * Regenerate content with the same inputs
   * Requirement: 4.6
   */
  async regenerateContent(
    generationId: string,
    workspaceId: string,
  ): Promise<GenerationRow> {
    const originalGeneration = await this.getGeneration(generationId, workspaceId);

    return this.generateContent(
      workspaceId,
      originalGeneration.template_id,
      originalGeneration.input_data as Record<string, unknown>,
    );
  }
}
