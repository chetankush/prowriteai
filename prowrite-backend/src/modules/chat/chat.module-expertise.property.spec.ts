import * as fc from 'fast-check';
import { PromptManagerService, ModuleType } from './prompt-manager.service';

/**
 * **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
 * **Validates: Requirements 1.1-1.6, 2.1-2.6, 3.1-3.6, 4.1-4.6**
 *
 * For any response in a Content_Module, the Specialized_Agent SHALL only provide
 * advice and content relevant to that module's domain.
 */
describe('Module-Specific Expertise Property Tests', () => {
  let promptManagerService: PromptManagerService;

  beforeEach(() => {
    promptManagerService = new PromptManagerService();
  });

  // Module type arbitrary
  const moduleTypeArbitrary = fc.constantFrom<ModuleType>(
    'cold_email',
    'hr_docs',
    'youtube_scripts',
    'website_copy',
    'software_docs',
  );

  // Define domain-specific keywords that MUST be present for each module
  const moduleRequiredKeywords: Record<ModuleType, string[]> = {
    cold_email: [
      'Cold Email Expert',
      'B2B sales',
      'cold outreach',
      'AIDA',
      'PAS',
      'subject line',
      'open rate',
      'email deliverability',
      'sales psychology',
    ],
    hr_docs: [
      'HR Expert',
      'HR documentation',
      'job description',
      'inclusive language',
      'employment law',
      'offer letter',
      'DEI',
      'candidate',
    ],
    youtube_scripts: [
      'YouTube Expert',
      'content strategist',
      'scriptwriter',
      'retention',
      'hook',
      'watch time',
      'CTR',
      'algorithm',
      'thumbnail',
    ],
    website_copy: [
      'Website Copy Expert',
      'conversion',
      'CRO',
      'landing page',
      'headline',
      'CTA',
      'SEO',
      'value proposition',
    ],
    software_docs: [
      'technical writer',
      'documentation',
      'API',
      'README',
      'PR',
      'commit',
      'test case',
      'release notes',
    ],
  };

  // Define keywords that should NOT appear in other modules (cross-contamination check)
  // Using highly specific phrases to avoid substring false positives
  const moduleExclusiveKeywords: Record<ModuleType, string[]> = {
    cold_email: [
      'email deliverability',
      'SPF, DKIM',
      'spam trigger words',
      'Challenger Sale',
      'Sandler',
      'MEDDIC',
      'cold outreach strategist',
    ],
    hr_docs: [
      'EEOC, ADA, FLSA',
      'at-will statement',
      'OKR-based',
      'rockstar/ninja/guru',
      'employment documentation specialist',
    ],
    youtube_scripts: [
      'pattern interrupt',
      'open loops',
      'B-roll/visual',
      'retention risk',
      'session time',
      'content strategist and scriptwriter',
    ],
    website_copy: [
      'Conversion Stack',
      'friction reducer',
      'microcopy',
      'meta description',
      'keyword density',
      'conversion-focused copywriter',
    ],
    software_docs: [
      'Architecture Decision Records',
      'Given-When-Then format',
      'Conventional commits format',
      'QA Sign-off Documents',
      'Technical Postmortems',
    ],
  };

  describe('Property 6: Module-Specific Expertise', () => {
    it('should contain domain-specific keywords for each module', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);
          const requiredKeywords = moduleRequiredKeywords[moduleType];

          // Property: Each module's prompt MUST contain its domain-specific keywords
          for (const keyword of requiredKeywords) {
            expect(prompt.toLowerCase()).toContain(keyword.toLowerCase());
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should NOT contain exclusive keywords from other modules', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Get exclusive keywords from OTHER modules
          const otherModules = Object.keys(moduleExclusiveKeywords).filter(
            (m) => m !== moduleType,
          ) as ModuleType[];

          for (const otherModule of otherModules) {
            const exclusiveKeywords = moduleExclusiveKeywords[otherModule];

            // Property: Module prompt should NOT contain exclusive keywords from other modules
            for (const keyword of exclusiveKeywords) {
              const containsKeyword = prompt.toLowerCase().includes(keyword.toLowerCase());
              if (containsKeyword) {
                // This would indicate cross-contamination of expertise
                throw new Error(
                  `Module ${moduleType} contains keyword "${keyword}" which is exclusive to ${otherModule}`,
                );
              }
            }
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should maintain consistent module identity in prompt config', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const config = promptManagerService.getPromptForModule(moduleType);

          // Property: Module type in config MUST match requested module type
          expect(config.moduleType).toBe(moduleType);

          // Property: Display name MUST be relevant to the module
          const expectedDisplayNames: Record<ModuleType, string> = {
            cold_email: 'Cold Email Expert',
            hr_docs: 'HR Documents Expert',
            youtube_scripts: 'YouTube Scripts Expert',
            website_copy: 'Website Copy Expert',
            software_docs: 'Software Documentation Expert',
          };
          expect(config.displayName).toBe(expectedDisplayNames[moduleType]);

          // Property: System prompt MUST be non-empty
          expect(config.systemPrompt.length).toBeGreaterThan(0);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should have unique introduction for each module', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Each module MUST have an INTRODUCTION section
          expect(prompt).toContain('## INTRODUCTION');

          // Property: Introduction MUST contain module-specific greeting
          const introductionKeywords: Record<ModuleType, string[]> = {
            cold_email: ['Cold Email Expert', 'pipeline', 'outreach'],
            hr_docs: ['HR Documentation Expert', 'inclusive', 'compliant'],
            youtube_scripts: ['YouTube Script Expert', 'views', 'retention'],
            website_copy: ['Website Copy Expert', 'converts', 'conversion'],
            software_docs: ['technical writer', 'documentation', 'developer'],
          };

          const keywords = introductionKeywords[moduleType];
          let foundKeywords = 0;
          for (const keyword of keywords) {
            if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
              foundKeywords++;
            }
          }

          // At least 2 of the 3 keywords should be present
          expect(foundKeywords).toBeGreaterThanOrEqual(2);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should have module-specific frameworks section', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Each module MUST have a FRAMEWORKS section
          expect(prompt).toContain('## FRAMEWORKS YOU APPLY');

          // Property: Frameworks section MUST contain module-specific frameworks
          const frameworkKeywords: Record<ModuleType, string[]> = {
            cold_email: ['AIDA', 'PAS', 'BAB', 'QVC', 'PPP'],
            hr_docs: ['Job Description Framework', 'Inclusive Language', 'Offer Letter Components'],
            youtube_scripts: ['Retention Formula', 'Hook Types', 'Retention Techniques'],
            website_copy: ['Conversion Stack', 'Headline Formulas', 'CTA Psychology'],
            software_docs: ['Conventional Commits', 'Given-When-Then', 'PRD', 'ADR'],
          };

          const frameworks = frameworkKeywords[moduleType];
          let foundFrameworks = 0;
          for (const framework of frameworks) {
            if (prompt.includes(framework)) {
              foundFrameworks++;
            }
          }

          // At least half of the frameworks should be present
          expect(foundFrameworks).toBeGreaterThanOrEqual(Math.floor(frameworks.length / 2));

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should have module-specific rules section', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          const prompt = promptManagerService.getSystemPrompt(moduleType);

          // Property: Each module MUST have a RULES section
          expect(prompt).toContain('## RULES');

          // Property: Rules section MUST contain module-specific constraints
          const ruleKeywords: Record<ModuleType, string[]> = {
            cold_email: ['spam trigger', '125 words', 'meeting in first email', 'question'],
            hr_docs: ['exclusionary language', 'age-related', 'salary transparency', 'legal advice'],
            youtube_scripts: ['open loops', 'hook', 'retention', 'title/thumbnail'],
            website_copy: ['features', 'jargon', 'scannable', 'social proof'],
            software_docs: ['concise', 'markdown', 'examples', 'clarifying questions'],
          };

          const rules = ruleKeywords[moduleType];
          let foundRules = 0;
          for (const rule of rules) {
            if (prompt.toLowerCase().includes(rule.toLowerCase())) {
              foundRules++;
            }
          }

          // At least half of the rule keywords should be present
          expect(foundRules).toBeGreaterThanOrEqual(Math.floor(rules.length / 2));

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should return only valid module types from getAvailableModules', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      const availableModules = promptManagerService.getAvailableModules();

      // Property: All returned modules MUST be valid module types
      const validModules: ModuleType[] = ['cold_email', 'hr_docs', 'youtube_scripts', 'website_copy', 'software_docs'];

      expect(availableModules).toHaveLength(validModules.length);
      for (const module of availableModules) {
        expect(validModules).toContain(module);
      }

      // Property: Each valid module MUST have a corresponding prompt
      for (const module of validModules) {
        expect(() => promptManagerService.getSystemPrompt(module)).not.toThrow();
      }
    });

    it('should throw error for invalid module types', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      const invalidModuleArbitrary = fc
        .string({ minLength: 1, maxLength: 50 })
        .filter(
          (s) =>
            !['cold_email', 'hr_docs', 'youtube_scripts', 'website_copy', 'software_docs'].includes(s) &&
            s.trim().length > 0,
        );

      await fc.assert(
        fc.asyncProperty(invalidModuleArbitrary, async (invalidModule) => {
          // Property: Invalid module types MUST throw an error
          expect(() =>
            promptManagerService.getSystemPrompt(invalidModule as ModuleType),
          ).toThrow(`Unsupported module type: ${invalidModule}`);

          return true;
        }),
        { numRuns: 50 },
      );
    });

    it('should validate module type correctly', async () => {
      // **Feature: specialized-ai-chat, Property 6: Module-Specific Expertise**
      await fc.assert(
        fc.asyncProperty(moduleTypeArbitrary, async (moduleType) => {
          // Property: Valid module types MUST return true from isValidModuleType
          expect(promptManagerService.isValidModuleType(moduleType)).toBe(true);

          return true;
        }),
        { numRuns: 100 },
      );

      // Test invalid module types
      const invalidModules = ['invalid', 'email', 'youtube', 'hr', 'website', ''];
      for (const invalid of invalidModules) {
        expect(promptManagerService.isValidModuleType(invalid)).toBe(false);
      }
    });
  });
});
