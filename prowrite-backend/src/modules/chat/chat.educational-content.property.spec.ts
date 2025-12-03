import * as fc from 'fast-check';
import { PromptManagerService, ModuleType } from './prompt-manager.service';
import { COLD_EMAIL_PROMPT } from './prompts/cold-email.prompt';
import { HR_DOCS_PROMPT } from './prompts/hr-docs.prompt';
import { YOUTUBE_SCRIPTS_PROMPT } from './prompts/youtube-scripts.prompt';
import { WEBSITE_COPY_PROMPT } from './prompts/website-copy.prompt';
import { SOFTWARE_DOCS_SYSTEM_PROMPT } from './prompts/software-docs.prompt';

/**
 * **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
 * **Validates: Requirements 6.1, 6.3, 6.4**
 *
 * For any content generation response, the output SHALL include explanatory
 * elements that teach the user why certain approaches work.
 *
 * Requirements:
 * - 6.1: Include brief explanations of why certain approaches work
 * - 6.3: Cite specific frameworks, studies, or industry standards
 * - 6.4: Provide detailed educational explanations when asked "why"
 */
describe('Educational Content Inclusion Property Tests', () => {
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

  // Map of module types to their prompts for direct testing
  const modulePrompts: Record<ModuleType, string> = {
    cold_email: COLD_EMAIL_PROMPT,
    hr_docs: HR_DOCS_PROMPT,
    youtube_scripts: YOUTUBE_SCRIPTS_PROMPT,
    website_copy: WEBSITE_COPY_PROMPT,
    software_docs: SOFTWARE_DOCS_SYSTEM_PROMPT,
  };

  // Educational section markers that should appear in output formats
  const educationalSectionMarkers = [
    'WHY THIS WORKS',
    'IMPROVEMENTS TO CONSIDER',
    'INCLUSIVE LANGUAGE CHECK',
    'COMPLIANCE CHECKLIST',
    'RETENTION ANALYSIS',
    'CONVERSION ANALYSIS',
    'CANDIDATE APPEAL SCORE',
  ];

  describe('Property 3: Educational Content Inclusion', () => {
    it('should instruct AI to explain reasoning in all module prompts', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST instruct AI to explain reasoning
          const hasExplainInstruction =
            prompt.includes('explain') ||
            prompt.includes('reasoning') ||
            prompt.includes('WHY');

          expect(hasExplainInstruction).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should include educational output sections in all module prompts', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST have at least one educational section marker
          const hasEducationalSection = educationalSectionMarkers.some(
            (marker) => prompt.includes(marker),
          );

          expect(hasEducationalSection).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });


    it('should have RULES section requiring explanation of reasoning', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST have a RULES section
          expect(prompt).toContain('RULES');

          // Property: Rules MUST include instruction to explain reasoning
          const rulesSection = prompt.split('## RULES')[1] || '';
          const hasExplainRule =
            rulesSection.toLowerCase().includes('explain') ||
            rulesSection.toLowerCase().includes('reasoning');

          expect(hasExplainRule).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should include WHY THIS WORKS section in output format for applicable modules', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      // Cold email and website copy specifically require WHY THIS WORKS
      const modulesWithWhySection: ModuleType[] = ['cold_email', 'website_copy'];

      for (const moduleType of modulesWithWhySection) {
        const prompt = modulePrompts[moduleType];

        // Property: These modules MUST include WHY THIS WORKS in output format
        expect(prompt).toContain('WHY THIS WORKS');
      }
    });

    it('should include analysis sections for educational feedback', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST include some form of analysis/feedback section
          const hasAnalysisSection =
            prompt.includes('ANALYSIS') ||
            prompt.includes('CHECK') ||
            prompt.includes('SCORE') ||
            prompt.includes('WHY THIS WORKS');

          expect(hasAnalysisSection).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Framework and Study Citations', () => {
    it('should reference specific frameworks in all module prompts', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST contain FRAMEWORKS YOU APPLY section
          expect(prompt).toContain('FRAMEWORKS YOU APPLY');

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should cite psychology principles in cold email prompt', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const coldEmailPrompt = modulePrompts.cold_email;

      // Property: Cold email MUST cite specific psychology principles
      expect(coldEmailPrompt).toContain('psychology');
      expect(coldEmailPrompt).toContain('Zeigarnik effect');
    });

    it('should cite compliance standards in HR docs prompt', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const hrDocsPrompt = modulePrompts.hr_docs;

      // Property: HR docs MUST cite compliance standards
      expect(hrDocsPrompt).toContain('EEOC');
      expect(hrDocsPrompt).toContain('ADA');
      expect(hrDocsPrompt).toContain('FLSA');
    });

    it('should cite algorithm and retention concepts in YouTube prompt', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const youtubePrompt = modulePrompts.youtube_scripts;

      // Property: YouTube MUST cite algorithm and retention concepts
      expect(youtubePrompt).toContain('algorithm');
      expect(youtubePrompt).toContain('retention');
      expect(youtubePrompt).toContain('CTR');
    });

    it('should cite conversion and UX principles in website copy prompt', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const websiteCopyPrompt = modulePrompts.website_copy;

      // Property: Website copy MUST cite conversion and UX principles
      expect(websiteCopyPrompt).toContain('conversion');
      expect(websiteCopyPrompt).toContain('CRO');
      expect(websiteCopyPrompt).toContain('UX');
    });
  });

  describe('Educational Response Behavior', () => {
    it('should instruct AI to provide educational explanations when asked why', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Prompts MUST have RESPONSE BEHAVIOR section
          expect(prompt).toContain('RESPONSE BEHAVIOR');

          // Property: Response behavior MUST guide AI on providing explanations
          // This can be through explicit explanation instructions OR through
          // guidance on providing strategic/psychological reasoning
          const responseBehaviorSection =
            prompt.split('## RESPONSE BEHAVIOR')[1]?.split('##')[0] || '';

          const hasExplanatoryGuidance =
            responseBehaviorSection.toLowerCase().includes('explain') ||
            responseBehaviorSection.toLowerCase().includes('reasoning') ||
            responseBehaviorSection.toLowerCase().includes('why') ||
            responseBehaviorSection.toLowerCase().includes('cite') ||
            responseBehaviorSection.toLowerCase().includes('psychology') ||
            responseBehaviorSection.toLowerCase().includes('suggest');

          expect(hasExplanatoryGuidance).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should instruct AI to cite sources when providing feedback', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const coldEmailPrompt = modulePrompts.cold_email;

      // Property: Cold email MUST instruct to cite psychology when giving feedback
      expect(coldEmailPrompt).toContain('Cite psychology');
    });

    it('should instruct AI to explain reasoning behind recommendations', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST instruct to explain reasoning
          const hasReasoningInstruction =
            prompt.includes('explain your reasoning') ||
            prompt.includes('explain the reasoning') ||
            prompt.includes('ALWAYS explain') ||
            prompt.includes('explain WHY');

          expect(hasReasoningInstruction).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });

  describe('Output Format Educational Elements', () => {
    it('should have structured output format with educational sections', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST have OUTPUT FORMAT section
          expect(prompt).toContain('OUTPUT FORMAT');

          // Property: Output format MUST include educational elements
          const outputFormatSection =
            prompt.split('## OUTPUT FORMAT')[1]?.split('## RULES')[0] || '';

          // Each module should have at least one educational element in output
          const hasEducationalElement =
            outputFormatSection.includes('WHY') ||
            outputFormatSection.includes('ANALYSIS') ||
            outputFormatSection.includes('CHECK') ||
            outputFormatSection.includes('SCORE') ||
            outputFormatSection.includes('IMPROVEMENTS');

          expect(hasEducationalElement).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should include improvement suggestions section in applicable modules', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const coldEmailPrompt = modulePrompts.cold_email;

      // Property: Cold email MUST include improvements section
      expect(coldEmailPrompt).toContain('IMPROVEMENTS TO CONSIDER');
    });

    it('should include checklist sections for compliance-focused modules', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const hrDocsPrompt = modulePrompts.hr_docs;

      // Property: HR docs MUST include compliance checklist
      expect(hrDocsPrompt).toContain('COMPLIANCE CHECKLIST');
      expect(hrDocsPrompt).toContain('INCLUSIVE LANGUAGE CHECK');
    });

    it('should include retention analysis for YouTube scripts', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const youtubePrompt = modulePrompts.youtube_scripts;

      // Property: YouTube MUST include retention analysis
      expect(youtubePrompt).toContain('RETENTION ANALYSIS');
    });

    it('should include conversion analysis for website copy', () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      const websiteCopyPrompt = modulePrompts.website_copy;

      // Property: Website copy MUST include conversion analysis
      expect(websiteCopyPrompt).toContain('CONVERSION ANALYSIS');
    });
  });

  describe('Learning-Oriented Introduction', () => {
    it('should have introduction that sets educational expectation', async () => {
      // **Feature: specialized-ai-chat, Property 3: Educational Content Inclusion**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: All prompts MUST have INTRODUCTION section
          expect(prompt).toContain('INTRODUCTION');

          // Property: Introduction MUST set expectation for educational content
          // This can be through explicit learning language OR through
          // references to expertise, psychology, data, or methodology
          const introSection = prompt.split('## INTRODUCTION')[1] || '';

          const hasEducationalExpectation =
            introSection.toLowerCase().includes('explain') ||
            introSection.toLowerCase().includes('best practices') ||
            introSection.toLowerCase().includes('why') ||
            introSection.toLowerCase().includes('learn') ||
            introSection.toLowerCase().includes('psychology') ||
            introSection.toLowerCase().includes('data') ||
            introSection.toLowerCase().includes('expert');

          expect(hasEducationalExpectation).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );
    });
  });
});
