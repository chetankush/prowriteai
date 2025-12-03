import { Injectable } from '@nestjs/common';
import {
  COLD_EMAIL_PROMPT,
  HR_DOCS_PROMPT,
  YOUTUBE_SCRIPTS_PROMPT,
  WEBSITE_COPY_PROMPT,
  SOFTWARE_DOCS_SYSTEM_PROMPT,
} from './prompts';

export type ModuleType =
  | 'cold_email'
  | 'hr_docs'
  | 'youtube_scripts'
  | 'website_copy'
  | 'software_docs';

export interface PromptConfig {
  systemPrompt: string;
  moduleType: ModuleType;
  displayName: string;
}

@Injectable()
export class PromptManagerService {
  private readonly prompts: Map<ModuleType, PromptConfig> = new Map([
    [
      'cold_email',
      {
        systemPrompt: COLD_EMAIL_PROMPT,
        moduleType: 'cold_email',
        displayName: 'Cold Email Expert',
      },
    ],
    [
      'hr_docs',
      {
        systemPrompt: HR_DOCS_PROMPT,
        moduleType: 'hr_docs',
        displayName: 'HR Documents Expert',
      },
    ],
    [
      'youtube_scripts',
      {
        systemPrompt: YOUTUBE_SCRIPTS_PROMPT,
        moduleType: 'youtube_scripts',
        displayName: 'YouTube Scripts Expert',
      },
    ],
    [
      'website_copy',
      {
        systemPrompt: WEBSITE_COPY_PROMPT,
        moduleType: 'website_copy',
        displayName: 'Website Copy Expert',
      },
    ],
    [
      'software_docs',
      {
        systemPrompt: SOFTWARE_DOCS_SYSTEM_PROMPT,
        moduleType: 'software_docs',
        displayName: 'Software Documentation Expert',
      },
    ],
  ]);

  /**
   * Get the specialized prompt configuration for a given module type
   * @param moduleType The content module type
   * @returns The prompt configuration for the module
   * @throws Error if module type is not supported
   */
  getPromptForModule(moduleType: ModuleType): PromptConfig {
    const config = this.prompts.get(moduleType);
    if (!config) {
      throw new Error(`Unsupported module type: ${moduleType}`);
    }
    return config;
  }

  /**
   * Get the system prompt string for a given module type
   * @param moduleType The content module type
   * @returns The system prompt string
   */
  getSystemPrompt(moduleType: ModuleType): string {
    return this.getPromptForModule(moduleType).systemPrompt;
  }

  /**
   * Get all available module types
   * @returns Array of supported module types
   */
  getAvailableModules(): ModuleType[] {
    return Array.from(this.prompts.keys());
  }

  /**
   * Check if a module type is supported
   * @param moduleType The module type to check
   * @returns True if the module type is supported
   */
  isValidModuleType(moduleType: string): moduleType is ModuleType {
    return this.prompts.has(moduleType as ModuleType);
  }

  /**
   * Inject brand voice settings into a system prompt
   * @param moduleType The content module type
   * @param brandVoice The brand voice settings to inject
   * @returns The system prompt with brand voice context
   */
  getPromptWithBrandVoice(
    moduleType: ModuleType,
    brandVoice?: {
      tone?: string;
      style?: string;
      terminology?: string[];
    },
  ): string {
    const basePrompt = this.getSystemPrompt(moduleType);

    if (!brandVoice || (!brandVoice.tone && !brandVoice.style && !brandVoice.terminology?.length)) {
      return basePrompt;
    }

    const brandVoiceSection = this.buildBrandVoiceSection(brandVoice);
    return `${basePrompt}\n\n${brandVoiceSection}`;
  }

  private buildBrandVoiceSection(brandVoice: {
    tone?: string;
    style?: string;
    terminology?: string[];
  }): string {
    const parts: string[] = ['====', '## BRAND VOICE SETTINGS', ''];
    parts.push('Apply these brand voice preferences to all generated content:');
    parts.push('');

    if (brandVoice.tone) {
      parts.push(`**Tone:** ${brandVoice.tone}`);
    }

    if (brandVoice.style) {
      parts.push(`**Style:** ${brandVoice.style}`);
    }

    if (brandVoice.terminology && brandVoice.terminology.length > 0) {
      parts.push(`**Preferred Terminology:** ${brandVoice.terminology.join(', ')}`);
    }

    return parts.join('\n');
  }
}
