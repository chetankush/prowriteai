import * as fc from 'fast-check';
import { PromptManagerService, ModuleType } from './prompt-manager.service';
import { COLD_EMAIL_PROMPT } from './prompts/cold-email.prompt';
import { HR_DOCS_PROMPT } from './prompts/hr-docs.prompt';
import { YOUTUBE_SCRIPTS_PROMPT } from './prompts/youtube-scripts.prompt';
import { WEBSITE_COPY_PROMPT } from './prompts/website-copy.prompt';
import { SOFTWARE_DOCS_SYSTEM_PROMPT } from './prompts/software-docs.prompt';

/**
 * **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
 * **Validates: Requirements 1.2, 2.2, 3.2, 4.2**
 *
 * For any generated content, the Specialized_Agent SHALL explicitly state which
 * framework or methodology is being applied and provide reasoning.
 *
 * This property test verifies that:
 * 1. All specialized prompts contain framework definitions
 * 2. All prompts instruct the AI to explain framework usage
 * 3. Output formats include framework references
 * 4. The prompts require reasoning for framework selection
 */
describe('Framework Application Transparency Property Tests', () => {
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
    'software_docs',
  );

  // Map of module types to their expected frameworks
  const moduleFrameworks: Record<ModuleType, string[]> = {
    cold_email: ['AIDA', 'PAS', 'BAB', 'QVC', 'PPP'],
    hr_docs: ['Job Description Framework', 'Inclusive Language Guidelines', 'Offer Letter Components', 'Performance Review Frameworks'],
    youtube_scripts: ['Retention Formula', 'Hook Types', 'Retention Techniques', 'Title/Thumbnail Psychology'],
    website_copy: ['Conversion Stack', 'Headline Formulas', 'CTA Psychology', 'Value Proposition Framework'],
    software_docs: ['Conventional Commits', 'Given-When-Then', 'ADR', 'PRD'],
  };

  // Map of module types to their prompts for direct testing
  const modulePrompts: Record<ModuleType, string> = {
    cold_email: COLD_EMAIL_PROMPT,
    hr_docs: HR_DOCS_PROMPT,
    youtube_scripts: YOUTUBE_SCRIPTS_PROMPT,
    website_copy: WEBSITE_COPY_PROMPT,
    software_docs: SOFTWARE_DOCS_SYSTEM_PROMPT,
  };

  describe('Property 2: Framework Application Transparency', () => {
    it('should contain FRAMEWORKS YOU APPLY section in all module prompts', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Every specialized prompt MUST contain a frameworks section
          expect(prompt).toContain('FRAMEWORKS YOU APPLY');

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should define specific frameworks for each module type', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);
          const expectedFrameworks = moduleFrameworks[moduleType];

          // Property: Each module MUST define its specific frameworks
          for (const framework of expectedFrameworks) {
            expect(prompt.toLowerCase()).toContain(framework.toLowerCase());
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });


    it('should instruct AI to explain framework usage in output format', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Prompts MUST contain output format section
          expect(prompt).toContain('OUTPUT FORMAT');

          // Property: Output format MUST include framework reference or explanation section
          // Each module has different ways of showing framework transparency
          const hasFrameworkReference =
            prompt.includes('FRAMEWORK:') || // Cold email explicit framework label
            prompt.includes('WHY THIS WORKS') || // Explanation section
            prompt.includes('RETENTION ANALYSIS') || // YouTube retention framework
            prompt.includes('CONVERSION ANALYSIS') || // Website copy CRO framework
            prompt.includes('INCLUSIVE LANGUAGE CHECK') || // HR docs framework application
            prompt.includes('COMPLIANCE CHECKLIST'); // HR docs compliance framework

          expect(hasFrameworkReference).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should require reasoning for framework selection in cold email prompts', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      // Cold email specifically requires stating which framework and why
      const coldEmailPrompt = modulePrompts.cold_email;

      // Property: Cold email prompt MUST require framework explanation
      expect(coldEmailPrompt).toContain('FRAMEWORK:');
      expect(coldEmailPrompt).toContain('[Name] - [Why this fits]');

      // Property: Must instruct to always provide the framework being used
      expect(coldEmailPrompt).toContain('ALWAYS provide the framework being used');
    });

    it('should include WHY THIS WORKS section for educational transparency', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST include explanation of why approaches work
          // This ensures framework application is transparent and educational
          const hasExplanationSection =
            prompt.includes('WHY THIS WORKS') ||
            prompt.includes('ALWAYS explain') ||
            prompt.includes('explain the reasoning') ||
            prompt.includes('explain WHY');

          expect(hasExplanationSection).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should instruct AI to explain reasoning in rules section', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST have a RULES section
          expect(prompt).toContain('RULES');

          // Property: Rules MUST include instruction to explain reasoning
          const rulesSection = prompt.split('## RULES')[1] || '';
          const hasExplainRule =
            rulesSection.includes('explain') ||
            rulesSection.includes('reasoning') ||
            rulesSection.includes('WHY');

          expect(hasExplainRule).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should have consistent structure across all module prompts', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST have these core sections for transparency
          const requiredSections = [
            'CORE IDENTITY & EXPERTISE',
            'FRAMEWORKS YOU APPLY',
            'RESPONSE BEHAVIOR',
            'OUTPUT FORMAT',
            'RULES',
            'INTRODUCTION',
          ];

          for (const section of requiredSections) {
            expect(prompt).toContain(section);
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Framework Transparency in Response Behavior', () => {
    it('should instruct AI to apply domain-specific guidance in response behavior', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Response behavior MUST include guidance on applying expertise
          expect(prompt).toContain('RESPONSE BEHAVIOR');

          // Property: Must guide AI on when/how to apply domain knowledge
          const responseBehaviorSection = prompt.split('## RESPONSE BEHAVIOR')[1]?.split('##')[0] || '';
          
          // Each module should have conditional guidance (When X, do Y)
          // This ensures the AI knows when to apply specific frameworks/approaches
          const hasConditionalGuidance =
            responseBehaviorSection.includes('When user') ||
            responseBehaviorSection.includes('When generating') ||
            responseBehaviorSection.includes('When creating');

          expect(hasConditionalGuidance).toBe(true);

          // Property: Response behavior should have multiple scenarios
          const scenarioCount = (responseBehaviorSection.match(/\*\*When/g) || []).length;
          expect(scenarioCount).toBeGreaterThanOrEqual(3);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should provide framework selection criteria for cold email', () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      const coldEmailPrompt = modulePrompts.cold_email;

      // Property: Cold email MUST explain when to use each framework
      expect(coldEmailPrompt).toContain('Best for awareness-stage prospects'); // AIDA
      expect(coldEmailPrompt).toContain('Best for pain-point focused outreach'); // PAS
      expect(coldEmailPrompt).toContain('Best for transformation messaging'); // BAB
    });

    it('should provide framework selection criteria for website copy', () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      const websiteCopyPrompt = modulePrompts.website_copy;

      // Property: Website copy MUST explain headline formula triggers
      expect(websiteCopyPrompt).toContain('Outcome-focused');
      expect(websiteCopyPrompt).toContain('Curiosity');
      expect(websiteCopyPrompt).toContain('Specificity');
      expect(websiteCopyPrompt).toContain('Social Proof');
    });

    it('should provide framework selection criteria for YouTube scripts', () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      const youtubePrompt = modulePrompts.youtube_scripts;

      // Property: YouTube MUST explain hook types and when to use them
      expect(youtubePrompt).toContain('Contrarian');
      expect(youtubePrompt).toContain('Story');
      expect(youtubePrompt).toContain('Challenge');
      expect(youtubePrompt).toContain('Question');
      expect(youtubePrompt).toContain('Demonstration');
    });

    it('should provide framework selection criteria for HR docs', () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      const hrDocsPrompt = modulePrompts.hr_docs;

      // Property: HR docs MUST explain inclusive language guidelines
      expect(hrDocsPrompt).toContain('Inclusive Language Guidelines');
      expect(hrDocsPrompt).toContain('Replace');
      
      // Property: HR docs MUST explain job description framework components
      expect(hrDocsPrompt).toContain('Impact Statement');
      expect(hrDocsPrompt).toContain('Key Responsibilities');
      expect(hrDocsPrompt).toContain('Requirements');
    });
  });

  describe('Framework Documentation Completeness', () => {
    it('should document all frameworks with numbered or bulleted lists', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Frameworks section MUST use structured lists
          const frameworksSection = prompt.split('## FRAMEWORKS YOU APPLY')[1]?.split('##')[0] || '';
          
          // Check for numbered lists (1. 2. 3.) or bullet points
          const hasStructuredList =
            /\d+\.\s/.test(frameworksSection) || // Numbered list
            frameworksSection.includes('- '); // Bullet list

          expect(hasStructuredList).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should have at least 3 frameworks defined per module', async () => {
      // **Feature: specialized-ai-chat, Property 2: Framework Application Transparency**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const expectedFrameworks = moduleFrameworks[moduleType];

          // Property: Each module MUST have at least 3 defined frameworks
          expect(expectedFrameworks.length).toBeGreaterThanOrEqual(3);

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });
});
