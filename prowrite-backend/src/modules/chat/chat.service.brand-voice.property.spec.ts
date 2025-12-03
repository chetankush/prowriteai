import * as fc from 'fast-check';
import { PromptManagerService, ModuleType } from './prompt-manager.service';
import { ChatService } from './chat.service';
import { BrandVoiceGuide } from '@common/database';

/**
 * **Feature: specialized-ai-chat, Property 5: Brand Voice Integration**
 * **Validates: Requirements 5.6**
 *
 * For any content generation where Brand_Voice settings exist, the generated
 * content SHALL reflect the user's defined tone, style, and terminology preferences.
 */
describe('ChatService Brand Voice Integration Property Tests', () => {
  let promptManagerService: PromptManagerService;

  beforeEach(() => {
    promptManagerService = new PromptManagerService();
  });

  // Arbitrary for generating valid module types
  const moduleTypeArbitrary = fc.constantFrom<ModuleType>(
    'cold_email',
    'hr_docs',
    'youtube_scripts',
    'website_copy',
  );

  // Arbitrary for generating non-empty strings (for tone and style)
  const nonEmptyStringArbitrary = fc.string({ minLength: 1, maxLength: 100 }).filter(
    (s) => s.trim().length > 0,
  );

  // Arbitrary for generating terminology arrays
  const terminologyArbitrary = fc.array(
    fc.string({ minLength: 1, maxLength: 50 }).filter((s) => s.trim().length > 0),
    { minLength: 1, maxLength: 10 },
  );

  // Arbitrary for generating complete brand voice settings
  const brandVoiceArbitrary = fc.record({
    tone: nonEmptyStringArbitrary,
    style: nonEmptyStringArbitrary,
    terminology: terminologyArbitrary,
  });

  // Arbitrary for partial brand voice (some fields may be undefined)
  const partialBrandVoiceArbitrary = fc.record({
    tone: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
    style: fc.option(nonEmptyStringArbitrary, { nil: undefined }),
    terminology: fc.option(terminologyArbitrary, { nil: undefined }),
  });

  describe('Property 5: Brand Voice Integration', () => {
    it('should include brand voice section in prompt when brand voice settings exist', async () => {
      // **Feature: specialized-ai-chat, Property 5: Brand Voice Integration**
      await fc.assert(
        fc.asyncProperty(
          moduleTypeArbitrary,
          brandVoiceArbitrary,
          async (moduleType, brandVoice) => {
            const promptWithBrandVoice = promptManagerService.getPromptWithBrandVoice(
              moduleType,
              brandVoice,
            );

            // Property: When brand voice exists, the prompt MUST contain brand voice section
            expect(promptWithBrandVoice).toContain('BRAND VOICE SETTINGS');

            // Property: Tone MUST be included in the prompt
            expect(promptWithBrandVoice).toContain(`**Tone:** ${brandVoice.tone}`);

            // Property: Style MUST be included in the prompt
            expect(promptWithBrandVoice).toContain(`**Style:** ${brandVoice.style}`);

            // Property: All terminology items MUST be included
            expect(promptWithBrandVoice).toContain('**Preferred Terminology:**');
            for (const term of brandVoice.terminology) {
              expect(promptWithBrandVoice).toContain(term);
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should include only provided brand voice fields in prompt', async () => {
      // **Feature: specialized-ai-chat, Property 5: Brand Voice Integration**
      await fc.assert(
        fc.asyncProperty(
          moduleTypeArbitrary,
          partialBrandVoiceArbitrary,
          async (moduleType, brandVoice) => {
            // Skip if all fields are undefined (no brand voice)
            const hasAnyField =
              brandVoice.tone !== undefined ||
              brandVoice.style !== undefined ||
              (brandVoice.terminology !== undefined && brandVoice.terminology.length > 0);

            if (!hasAnyField) {
              return true; // Skip this case - tested separately
            }

            const promptWithBrandVoice = promptManagerService.getPromptWithBrandVoice(
              moduleType,
              brandVoice,
            );

            // Property: Brand voice section should be present when any field exists
            expect(promptWithBrandVoice).toContain('BRAND VOICE SETTINGS');

            // Property: Tone should be included only if provided
            if (brandVoice.tone !== undefined) {
              expect(promptWithBrandVoice).toContain(`**Tone:** ${brandVoice.tone}`);
            } else {
              expect(promptWithBrandVoice).not.toContain('**Tone:**');
            }

            // Property: Style should be included only if provided
            if (brandVoice.style !== undefined) {
              expect(promptWithBrandVoice).toContain(`**Style:** ${brandVoice.style}`);
            } else {
              expect(promptWithBrandVoice).not.toContain('**Style:**');
            }

            // Property: Terminology should be included only if provided and non-empty
            if (brandVoice.terminology !== undefined && brandVoice.terminology.length > 0) {
              expect(promptWithBrandVoice).toContain('**Preferred Terminology:**');
            } else {
              expect(promptWithBrandVoice).not.toContain('**Preferred Terminology:**');
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should NOT include brand voice section when no brand voice settings exist', async () => {
      // **Feature: specialized-ai-chat, Property 5: Brand Voice Integration**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          // Test with undefined brand voice
          const promptWithoutBrandVoice = promptManagerService.getPromptWithBrandVoice(
            moduleType,
            undefined,
          );

          // Property: No brand voice section when brand voice is undefined
          expect(promptWithoutBrandVoice).not.toContain('BRAND VOICE SETTINGS');

          // Test with empty brand voice object
          const promptWithEmptyBrandVoice = promptManagerService.getPromptWithBrandVoice(
            moduleType,
            {},
          );

          // Property: No brand voice section when brand voice is empty
          expect(promptWithEmptyBrandVoice).not.toContain('BRAND VOICE SETTINGS');

          // Test with empty terminology array
          const promptWithEmptyTerminology = promptManagerService.getPromptWithBrandVoice(
            moduleType,
            { terminology: [] },
          );

          // Property: No brand voice section when only empty terminology provided
          expect(promptWithEmptyTerminology).not.toContain('BRAND VOICE SETTINGS');

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should preserve base prompt when adding brand voice', async () => {
      // **Feature: specialized-ai-chat, Property 5: Brand Voice Integration**
      await fc.assert(
        fc.asyncProperty(
          moduleTypeArbitrary,
          brandVoiceArbitrary,
          async (moduleType, brandVoice) => {
            const basePrompt = promptManagerService.getSystemPrompt(moduleType);
            const promptWithBrandVoice = promptManagerService.getPromptWithBrandVoice(
              moduleType,
              brandVoice,
            );

            // Property: The base prompt MUST be fully preserved
            expect(promptWithBrandVoice).toContain(basePrompt);

            // Property: Brand voice section should come AFTER the base prompt
            const basePromptIndex = promptWithBrandVoice.indexOf(basePrompt);
            const brandVoiceIndex = promptWithBrandVoice.indexOf('BRAND VOICE SETTINGS');

            expect(basePromptIndex).toBe(0); // Base prompt starts at beginning
            expect(brandVoiceIndex).toBeGreaterThan(basePrompt.length - 1);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('ChatService buildPromptWithContext Brand Voice Integration', () => {
    let chatService: ChatService;

    beforeEach(() => {
      // Create ChatService with minimal mocks
      const mockSupabaseService = {
        conversations: { select: jest.fn(), insert: jest.fn(), update: jest.fn(), delete: jest.fn() },
        messages: { select: jest.fn(), insert: jest.fn() },
      };
      const mockGeminiService = {
        generateContent: jest.fn(),
      };
      const mockWorkspaceService = {
        checkUsageLimit: jest.fn().mockResolvedValue(true),
        incrementUsage: jest.fn().mockResolvedValue(undefined),
      };

      chatService = new ChatService(
        mockSupabaseService as any,
        promptManagerService,
        mockGeminiService as any,
        mockWorkspaceService as any,
      );
    });

    // Arbitrary for generating conversation context
    const chatMessageArbitrary = fc.record({
      role: fc.constantFrom<'user' | 'assistant'>('user', 'assistant'),
      content: fc.string({ minLength: 1, maxLength: 500 }),
    });

    const conversationContextArbitrary = fc.array(chatMessageArbitrary, {
      minLength: 0,
      maxLength: 10,
    });

    // Arbitrary for full BrandVoiceGuide (matching database type)
    const fullBrandVoiceGuideArbitrary: fc.Arbitrary<BrandVoiceGuide> = fc.record({
      tone: nonEmptyStringArbitrary,
      style: nonEmptyStringArbitrary,
      terminology: terminologyArbitrary,
      avoid: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
    });

    it('should integrate brand voice into system prompt via buildPromptWithContext', async () => {
      // **Feature: specialized-ai-chat, Property 5: Brand Voice Integration**
      await fc.assert(
        fc.asyncProperty(
          moduleTypeArbitrary,
          fc.string({ minLength: 1, maxLength: 200 }), // user message
          conversationContextArbitrary,
          fullBrandVoiceGuideArbitrary,
          async (moduleType, userMessage, context, brandVoice) => {
            const { systemPrompt, userPrompt } = chatService.buildPromptWithContext(
              moduleType as any, // Cast to ModuleType from database
              userMessage,
              context,
              brandVoice,
            );

            // Property: System prompt MUST contain brand voice settings
            expect(systemPrompt).toContain('BRAND VOICE SETTINGS');
            expect(systemPrompt).toContain(`**Tone:** ${brandVoice.tone}`);
            expect(systemPrompt).toContain(`**Style:** ${brandVoice.style}`);

            // Property: User prompt should contain the user message
            expect(userPrompt).toContain(userMessage);

            // Property: If context exists, it should be in user prompt
            if (context.length > 0) {
              expect(userPrompt).toContain('Previous Conversation');
            }

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should NOT include brand voice in system prompt when brand voice is null', async () => {
      // **Feature: specialized-ai-chat, Property 5: Brand Voice Integration**
      await fc.assert(
        fc.asyncProperty(
          moduleTypeArbitrary,
          fc.string({ minLength: 1, maxLength: 200 }),
          conversationContextArbitrary,
          async (moduleType, userMessage, context) => {
            const { systemPrompt } = chatService.buildPromptWithContext(
              moduleType as any,
              userMessage,
              context,
              null, // No brand voice
            );

            // Property: System prompt should NOT contain brand voice section
            expect(systemPrompt).not.toContain('BRAND VOICE SETTINGS');

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
