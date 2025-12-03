import { Injectable } from '@nestjs/common';
import { GeminiService } from '../generation/gemini.service';
import { TranslateTextDto, TranslatedVersion, TranslateResponse } from './dto';

@Injectable()
export class TranslateService {
  constructor(private readonly geminiService: GeminiService) {}

  /**
   * Translate text for multiple audiences in parallel
   */
  async translateForAllAudiences(dto: TranslateTextDto): Promise<TranslateResponse> {
    const translations = await Promise.all([
      this.translateForManager(dto),
      this.translateForExecutive(dto),
      this.translateForCustomer(dto),
      this.translateForTechnical(dto),
      this.translateForSlack(dto),
      this.translateForEmail(dto),
    ]);

    return {
      original: dto.text,
      translations,
      generatedAt: new Date(),
    };
  }

  /**
   * Translate for non-technical manager
   */
  async translateForManager(dto: TranslateTextDto): Promise<TranslatedVersion> {
    const prompt = `You are a communication expert. Take this technical/complex text and rewrite it for a NON-TECHNICAL MANAGER.

Original text:
"""
${dto.text}
"""
${dto.context ? `Context: ${dto.context}` : ''}

Rules:
- Remove all jargon and technical terms
- Focus on IMPACT and OUTCOMES
- Use simple, clear language
- Keep it concise (2-4 sentences max)
- Highlight what matters to a manager: timeline, resources, risks, results

Just output the rewritten text, nothing else.`;

    const result = await this.geminiService.generateContent(prompt, 'You are a communication expert specializing in translating technical content for different audiences.');

    return {
      audience: 'Manager',
      description: 'Non-technical, impact-focused',
      icon: '👔',
      content: result.content.trim(),
    };
  }

  /**
   * Translate for C-level executive
   */
  async translateForExecutive(dto: TranslateTextDto): Promise<TranslatedVersion> {
    const prompt = `You are a communication expert. Take this text and rewrite it for a C-LEVEL EXECUTIVE (CEO, CTO, CFO).

Original text:
"""
${dto.text}
"""
${dto.context ? `Context: ${dto.context}` : ''}

Rules:
- Maximum 2-3 sentences
- Focus on business impact, revenue, risk, or strategic value
- No technical details whatsoever
- Use executive language: ROI, efficiency, competitive advantage
- Be direct and confident

Just output the rewritten text, nothing else.`;

    const result = await this.geminiService.generateContent(prompt, 'You are a communication expert specializing in translating technical content for different audiences.');

    return {
      audience: 'Executive',
      description: 'Business impact, strategic',
      icon: '🎯',
      content: result.content.trim(),
    };
  }

  /**
   * Translate for external customer
   */
  async translateForCustomer(dto: TranslateTextDto): Promise<TranslatedVersion> {
    const prompt = `You are a communication expert. Take this text and rewrite it for an EXTERNAL CUSTOMER.

Original text:
"""
${dto.text}
"""
${dto.context ? `Context: ${dto.context}` : ''}

Rules:
- Friendly, professional tone
- Focus on how it affects THEM (the customer)
- No internal jargon or technical details
- Be reassuring and positive
- If it's about a problem, focus on the solution

Just output the rewritten text, nothing else.`;

    const result = await this.geminiService.generateContent(prompt, 'You are a communication expert specializing in translating technical content for different audiences.');

    return {
      audience: 'Customer',
      description: 'Friendly, customer-focused',
      icon: '🤝',
      content: result.content.trim(),
    };
  }

  /**
   * Keep technical but make it clearer
   */
  async translateForTechnical(dto: TranslateTextDto): Promise<TranslatedVersion> {
    const prompt = `You are a senior engineer. Take this text and rewrite it for OTHER TECHNICAL TEAM MEMBERS.

Original text:
"""
${dto.text}
"""
${dto.context ? `Context: ${dto.context}` : ''}

Rules:
- Keep technical accuracy
- Make it clearer and better structured
- Add context if missing
- Use bullet points if helpful
- Include actionable next steps if relevant

Just output the rewritten text, nothing else.`;

    const result = await this.geminiService.generateContent(prompt, 'You are a communication expert specializing in translating technical content for different audiences.');

    return {
      audience: 'Technical Team',
      description: 'Clear, structured, actionable',
      icon: '💻',
      content: result.content.trim(),
    };
  }

  /**
   * Translate for Slack message
   */
  async translateForSlack(dto: TranslateTextDto): Promise<TranslatedVersion> {
    const prompt = `You are a communication expert. Take this text and rewrite it as a SLACK MESSAGE.

Original text:
"""
${dto.text}
"""
${dto.context ? `Context: ${dto.context}` : ''}

Rules:
- Casual, conversational tone
- Use emoji sparingly but effectively
- Keep it short (Slack messages should be scannable)
- Use *bold* for emphasis
- Break into short lines if needed

Just output the rewritten text, nothing else.`;

    const result = await this.geminiService.generateContent(prompt, 'You are a communication expert specializing in translating technical content for different audiences.');

    return {
      audience: 'Slack Message',
      description: 'Casual, scannable',
      icon: '💬',
      content: result.content.trim(),
    };
  }

  /**
   * Translate for formal email
   */
  async translateForEmail(dto: TranslateTextDto): Promise<TranslatedVersion> {
    const prompt = `You are a communication expert. Take this text and rewrite it as a PROFESSIONAL EMAIL body.

Original text:
"""
${dto.text}
"""
${dto.context ? `Context: ${dto.context}` : ''}

Rules:
- Professional, polished tone
- Well-structured with clear paragraphs
- Include a clear call-to-action if relevant
- Appropriate for sending to colleagues or stakeholders
- Don't include subject line or greeting, just the body

Just output the rewritten text, nothing else.`;

    const result = await this.geminiService.generateContent(prompt, 'You are a communication expert specializing in translating technical content for different audiences.');

    return {
      audience: 'Email',
      description: 'Professional, polished',
      icon: '📧',
      content: result.content.trim(),
    };
  }

  /**
   * Translate for a specific single audience
   */
  async translateForAudience(
    dto: TranslateTextDto,
    audience: string,
  ): Promise<TranslatedVersion> {
    const audienceMap: Record<string, () => Promise<TranslatedVersion>> = {
      manager: () => this.translateForManager(dto),
      executive: () => this.translateForExecutive(dto),
      customer: () => this.translateForCustomer(dto),
      technical: () => this.translateForTechnical(dto),
      slack: () => this.translateForSlack(dto),
      email: () => this.translateForEmail(dto),
    };

    const translator = audienceMap[audience.toLowerCase()];
    if (!translator) {
      throw new Error(`Unknown audience: ${audience}`);
    }

    return translator();
  }
}
