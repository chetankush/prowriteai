import { Injectable } from '@nestjs/common';
import { GeminiService } from '../generation/gemini.service';
import {
  GenerateIncidentCommsDto,
  IncidentCommunication,
  IncidentCommsResponse,
  UpdateIncidentDto,
} from './dto';

@Injectable()
export class IncidentService {
  constructor(private readonly geminiService: GeminiService) {}

  /**
   * Generate all incident communications from a single input
   */
  async generateAllCommunications(
    dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommsResponse> {
    const communications: IncidentCommunication[] = await Promise.all([
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

  /**
   * Generate Slack message for engineering team
   */
  async generateSlackEngineering(
    dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommunication> {
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

  /**
   * Generate Slack message for company-wide announcement
   */
  async generateSlackCompany(
    dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommunication> {
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

  /**
   * Generate customer-facing email
   */
  async generateCustomerEmail(
    dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommunication> {
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

  /**
   * Generate status page update
   */
  async generateStatusPage(
    dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommunication> {
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

  /**
   * Generate executive summary
   */
  async generateExecutiveSummary(
    dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommunication> {
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

  /**
   * Generate postmortem template
   */
  async generatePostmortemTemplate(
    dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommunication> {
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

  /**
   * Generate update communications when incident status changes
   */
  async generateUpdateCommunications(
    originalDto: GenerateIncidentCommsDto,
    updateDto: UpdateIncidentDto,
  ): Promise<IncidentCommsResponse> {
    const updatedDto: GenerateIncidentCommsDto = {
      ...originalDto,
      status: updateDto.status || originalDto.status,
      eta: updateDto.eta || originalDto.eta,
      rootCause: updateDto.rootCause || originalDto.rootCause,
      resolution: updateDto.resolution || originalDto.resolution,
    };

    return this.generateAllCommunications(updatedDto);
  }

  private getSeverityEmoji(severity: string): string {
    const emojis: Record<string, string> = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢',
    };
    return emojis[severity] || '⚪';
  }

  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      investigating: '🔍',
      identified: '🎯',
      monitoring: '👀',
      resolved: '✅',
    };
    return emojis[status] || '📋';
  }
}
