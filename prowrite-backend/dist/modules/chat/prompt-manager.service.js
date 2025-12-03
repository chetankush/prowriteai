"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptManagerService = void 0;
const common_1 = require("@nestjs/common");
const prompts_1 = require("./prompts");
let PromptManagerService = class PromptManagerService {
    prompts = new Map([
        [
            'cold_email',
            {
                systemPrompt: prompts_1.COLD_EMAIL_PROMPT,
                moduleType: 'cold_email',
                displayName: 'Cold Email Expert',
            },
        ],
        [
            'hr_docs',
            {
                systemPrompt: prompts_1.HR_DOCS_PROMPT,
                moduleType: 'hr_docs',
                displayName: 'HR Documents Expert',
            },
        ],
        [
            'youtube_scripts',
            {
                systemPrompt: prompts_1.YOUTUBE_SCRIPTS_PROMPT,
                moduleType: 'youtube_scripts',
                displayName: 'YouTube Scripts Expert',
            },
        ],
        [
            'website_copy',
            {
                systemPrompt: prompts_1.WEBSITE_COPY_PROMPT,
                moduleType: 'website_copy',
                displayName: 'Website Copy Expert',
            },
        ],
        [
            'software_docs',
            {
                systemPrompt: prompts_1.SOFTWARE_DOCS_SYSTEM_PROMPT,
                moduleType: 'software_docs',
                displayName: 'Software Documentation Expert',
            },
        ],
    ]);
    getPromptForModule(moduleType) {
        const config = this.prompts.get(moduleType);
        if (!config) {
            throw new Error(`Unsupported module type: ${moduleType}`);
        }
        return config;
    }
    getSystemPrompt(moduleType) {
        return this.getPromptForModule(moduleType).systemPrompt;
    }
    getAvailableModules() {
        return Array.from(this.prompts.keys());
    }
    isValidModuleType(moduleType) {
        return this.prompts.has(moduleType);
    }
    getPromptWithBrandVoice(moduleType, brandVoice) {
        const basePrompt = this.getSystemPrompt(moduleType);
        if (!brandVoice || (!brandVoice.tone && !brandVoice.style && !brandVoice.terminology?.length)) {
            return basePrompt;
        }
        const brandVoiceSection = this.buildBrandVoiceSection(brandVoice);
        return `${basePrompt}\n\n${brandVoiceSection}`;
    }
    buildBrandVoiceSection(brandVoice) {
        const parts = ['====', '## BRAND VOICE SETTINGS', ''];
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
};
exports.PromptManagerService = PromptManagerService;
exports.PromptManagerService = PromptManagerService = __decorate([
    (0, common_1.Injectable)()
], PromptManagerService);
//# sourceMappingURL=prompt-manager.service.js.map