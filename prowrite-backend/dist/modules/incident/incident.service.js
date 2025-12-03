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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentService = void 0;
const common_1 = require("@nestjs/common");
const gemini_service_1 = require("../generation/gemini.service");
let IncidentService = class IncidentService {
    geminiService;
    constructor(geminiService) {
        this.geminiService = geminiService;
    }
    async generateAllCommunications(dto) {
        const communications = await Promise.all([
            this.generateSlackEngineering(dto),
            this.generateSlackCompany(dto),
            this.generateCustomerEmail(dto),
            this.generateStatusPage(dto),
            this.generateExecutiveSummary(dto),
            this.generatePostmortemTemplate(dto),
        ]);
        return {
            incident: {
                title: dto.title,
                severity: dto.severity,
                status: dto.status,
            },
            communications,
            generatedAt: new Date(),
        };
    }
    async generateSlackEngineering(dto) {
        const severityEmoji = this.getSeverityEmoji(dto.severity);
        const statusEmoji = this.getStatusEmoji(dto.status);
        const prompt = `Generate a Slack message for the ENGINEERING team about this incident.
Keep it technical, actionable, and concise. Use Slack formatting (bold with *, code blocks with \`\`\`).

Incident Details:
- Title: ${dto.title}
- Severity: ${dto.severity}
- Status: ${dto.status}
- Description: ${dto.description}
- Impact: ${dto.impact}
- Affected Services: ${dto.affectedServices?.join(', ') || 'Not specified'}
- ETA: ${dto.eta || 'TBD'}
${dto.rootCause ? `- Root Cause: ${dto.rootCause}` : ''}
${dto.resolution ? `- Resolution: ${dto.resolution}` : ''}

Format:
${severityEmoji} *[SEVERITY] INCIDENT: [Title]*
${statusEmoji} Status: [Status]

*Impact:* [Brief impact]

*What we know:*
• [Technical details]

*Current actions:*
• [What's being done]

*ETA:* [Time estimate]

cc: @oncall @[relevant-team]`;
        const result = await this.geminiService.generateContent(prompt, 'You are an expert incident communication specialist.');
        return {
            type: 'slack_engineering',
            title: 'Slack - Engineering Team',
            content: result.content,
            audience: 'Engineering team, on-call, SRE',
            tone: 'Technical, urgent, actionable',
        };
    }
    async generateSlackCompany(dto) {
        const prompt = `Generate a Slack message for the ENTIRE COMPANY about this incident.
Keep it non-technical, reassuring, and informative. Avoid jargon.

Incident Details:
- Title: ${dto.title}
- Severity: ${dto.severity}
- Status: ${dto.status}
- Impact: ${dto.impact}
- ETA: ${dto.eta || 'TBD'}

Format:
🔔 *Service Update: [Simple title]*

*What's happening:*
[Non-technical explanation]

*Who's affected:*
[Impact in simple terms]

*What we're doing:*
[Reassuring action being taken]

*Expected resolution:*
[Time estimate]

We'll keep you updated. Questions? Reach out to #[channel].`;
        const result = await this.geminiService.generateContent(prompt, 'You are an expert incident communication specialist.');
        return {
            type: 'slack_company',
            title: 'Slack - Company Wide',
            content: result.content,
            audience: 'All employees',
            tone: 'Non-technical, reassuring, informative',
        };
    }
    async generateCustomerEmail(dto) {
        const companyName = dto.companyName || '[Company Name]';
        const prompt = `Generate a professional customer email about this incident.
Be apologetic, transparent, and reassuring. No technical jargon.

Incident Details:
- Title: ${dto.title}
- Severity: ${dto.severity}
- Status: ${dto.status}
- Impact: ${dto.impact}
- ETA: ${dto.eta || 'TBD'}
- Company: ${companyName}

Format:
Subject: Service Update - [Brief description]

Dear Valued Customer,

[Opening - acknowledge the issue]

[What's happening - simple terms]

[Impact on customers]

[What we're doing to fix it]

[Expected resolution time]

[Apology and commitment]

We appreciate your patience and will provide updates as we have them.

Best regards,
The ${companyName} Team`;
        const result = await this.geminiService.generateContent(prompt, 'You are an expert incident communication specialist.');
        return {
            type: 'customer_email',
            title: 'Customer Email',
            content: result.content,
            audience: 'Customers, external stakeholders',
            tone: 'Professional, apologetic, transparent',
        };
    }
    async generateStatusPage(dto) {
        const prompt = `Generate a status page update for this incident.
Keep it brief, factual, and professional. Status page style.

Incident Details:
- Title: ${dto.title}
- Severity: ${dto.severity}
- Status: ${dto.status}
- Impact: ${dto.impact}
- Affected Services: ${dto.affectedServices?.join(', ') || 'Core services'}
- ETA: ${dto.eta || 'TBD'}
${dto.rootCause ? `- Root Cause: ${dto.rootCause}` : ''}

Format:
**[Status] - [Title]**
Posted: [Current time placeholder]

[One paragraph description of the issue]

**Affected Services:** [List]

**Current Status:** [What's happening now]

**Next Update:** [When to expect update]`;
        const result = await this.geminiService.generateContent(prompt, 'You are an expert incident communication specialist.');
        return {
            type: 'status_page',
            title: 'Status Page Update',
            content: result.content,
            audience: 'Public, customers checking status',
            tone: 'Brief, factual, professional',
        };
    }
    async generateExecutiveSummary(dto) {
        const prompt = `Generate an executive summary for leadership about this incident.
Focus on business impact, customer impact, and resolution timeline. No deep technical details.

Incident Details:
- Title: ${dto.title}
- Severity: ${dto.severity}
- Status: ${dto.status}
- Description: ${dto.description}
- Impact: ${dto.impact}
- ETA: ${dto.eta || 'TBD'}
${dto.rootCause ? `- Root Cause: ${dto.rootCause}` : ''}

Format:
## Executive Summary: [Title]

**Severity:** ${dto.severity.toUpperCase()}
**Status:** ${dto.status}
**Business Impact:** [High/Medium/Low]

### Situation
[2-3 sentences on what happened]

### Customer Impact
[Who is affected and how]

### Business Impact
[Revenue, reputation, SLA implications]

### Resolution
[What's being done, timeline]

### Next Steps
[Immediate actions, follow-up]`;
        const result = await this.geminiService.generateContent(prompt, 'You are an expert incident communication specialist.');
        return {
            type: 'executive_summary',
            title: 'Executive Summary',
            content: result.content,
            audience: 'C-suite, leadership, board',
            tone: 'Business-focused, concise, impact-oriented',
        };
    }
    async generatePostmortemTemplate(dto) {
        const prompt = `Generate a blameless postmortem template pre-filled with this incident's details.
Follow industry best practices for incident postmortems.

Incident Details:
- Title: ${dto.title}
- Severity: ${dto.severity}
- Description: ${dto.description}
- Impact: ${dto.impact}
${dto.rootCause ? `- Root Cause: ${dto.rootCause}` : ''}
${dto.resolution ? `- Resolution: ${dto.resolution}` : ''}

Format:
# Incident Postmortem: [Title]

**Date:** [Date placeholder]
**Severity:** ${dto.severity.toUpperCase()}
**Duration:** [To be filled]
**Author:** [To be filled]

## Summary
[Brief summary of what happened]

## Impact
- **Users Affected:** [Number/percentage]
- **Duration:** [How long]
- **Services Affected:** ${dto.affectedServices?.join(', ') || '[List services]'}

## Timeline
| Time | Event |
|------|-------|
| [Time] | Issue first detected |
| [Time] | Team alerted |
| [Time] | Root cause identified |
| [Time] | Fix deployed |
| [Time] | Service restored |

## Root Cause Analysis
[Detailed technical explanation - to be filled]

## Resolution
[What was done to fix it]

## Lessons Learned
### What went well
- [To be filled]

### What could be improved
- [To be filled]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Action 1] | [Name] | [Date] | Open |
| [Action 2] | [Name] | [Date] | Open |

## Prevention
[How to prevent this from happening again]`;
        const result = await this.geminiService.generateContent(prompt, 'You are an expert incident communication specialist.');
        return {
            type: 'postmortem_template',
            title: 'Postmortem Template',
            content: result.content,
            audience: 'Engineering team, management',
            tone: 'Blameless, thorough, action-oriented',
        };
    }
    async generateUpdateCommunications(originalDto, updateDto) {
        const updatedDto = {
            ...originalDto,
            status: updateDto.status || originalDto.status,
            eta: updateDto.eta || originalDto.eta,
            rootCause: updateDto.rootCause || originalDto.rootCause,
            resolution: updateDto.resolution || originalDto.resolution,
        };
        return this.generateAllCommunications(updatedDto);
    }
    getSeverityEmoji(severity) {
        const emojis = {
            critical: '🔴',
            high: '🟠',
            medium: '🟡',
            low: '🟢',
        };
        return emojis[severity] || '⚪';
    }
    getStatusEmoji(status) {
        const emojis = {
            investigating: '🔍',
            identified: '🎯',
            monitoring: '👀',
            resolved: '✅',
        };
        return emojis[status] || '📋';
    }
};
exports.IncidentService = IncidentService;
exports.IncidentService = IncidentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gemini_service_1.GeminiService])
], IncidentService);
//# sourceMappingURL=incident.service.js.map