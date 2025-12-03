import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import {
  SupabaseService,
  TemplateRow,
  SubscriptionRow,
  ModuleType,
  PlanType,
  SubscriptionStatus,
  InputSchema,
} from '@common/database';
import { CreateTemplateDto } from './dto';

@Injectable()
export class TemplatesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Check if workspace has Pro+ subscription (Pro or Enterprise)
   */
  async hasProPlusSubscription(workspaceId: string): Promise<boolean> {
    const { data: subscriptionData } = await this.supabaseService.subscriptions
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('status', SubscriptionStatus.ACTIVE)
      .single();

    const subscription = subscriptionData as SubscriptionRow | null;

    if (!subscription) {
      return false;
    }

    return subscription.plan_type === PlanType.PRO || subscription.plan_type === PlanType.ENTERPRISE;
  }

  /**
   * Get all templates for a specific module type
   * Returns system templates (workspace_id = null) and optionally workspace-specific templates
   */
  async getTemplatesByModule(moduleType: ModuleType, workspaceId?: string): Promise<TemplateRow[]> {
    console.log('Fetching templates for module:', moduleType, 'workspace:', workspaceId);
    
    // First, try to get all templates for this module type
    const { data: templates, error } = await this.supabaseService.templates
      .select('*')
      .eq('module_type', moduleType)
      .order('created_at', { ascending: true });

    console.log('Templates query result:', { count: templates?.length, error });

    if (error) {
      console.error('Error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }

    // Filter in code: system templates (workspace_id = null) OR user's workspace templates
    const filtered = (templates || []).filter((t: TemplateRow) => 
      t.workspace_id === null || t.workspace_id === workspaceId
    );

    console.log('Filtered templates count:', filtered.length);

    return filtered as TemplateRow[];
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(id: string, workspaceId?: string): Promise<TemplateRow> {
    let query = this.supabaseService.templates
      .select('*')
      .eq('id', id);

    if (workspaceId) {
      query = query.or(`workspace_id.is.null,workspace_id.eq.${workspaceId}`);
    }

    const { data: template, error } = await query.single();

    if (error || !template) {
      throw new NotFoundException('Template not found');
    }

    return template as TemplateRow;
  }

  /**
   * Create a custom template for a workspace (Pro+ feature)
   * Requires Pro or Enterprise subscription
   */
  async createTemplate(dto: CreateTemplateDto, workspaceId: string): Promise<TemplateRow> {
    // Check if workspace has Pro+ subscription
    const hasProPlus = await this.hasProPlusSubscription(workspaceId);
    if (!hasProPlus) {
      throw new ForbiddenException('Custom templates require a Pro or Enterprise subscription');
    }

    const { data: template, error } = await this.supabaseService.templates
      .insert({
        workspace_id: workspaceId,
        module_type: dto.module_type as ModuleType,
        name: dto.name,
        description: dto.description || null,
        system_prompt: dto.system_prompt,
        input_schema: dto.input_schema as unknown as InputSchema,
        output_format: dto.output_format,
        tags: dto.tags || [],
        is_custom: true,
      })
      .select()
      .single();

    if (error || !template) {
      throw new Error('Failed to create template');
    }

    return template as TemplateRow;
  }

  /**
   * Create default system templates for seeding
   */
  async createDefaultTemplates(): Promise<void> {
    const { count } = await this.supabaseService.templates
      .select('*', { count: 'exact', head: true })
      .eq('is_custom', false);

    // Skip if templates already exist
    if (count && count > 0) {
      return;
    }

    const defaultTemplates = this.getDefaultTemplateDefinitions();

    for (const templateDef of defaultTemplates) {
      await this.supabaseService.templates.insert({
        workspace_id: null,
        module_type: templateDef.module_type as ModuleType,
        name: templateDef.name!,
        description: templateDef.description || null,
        system_prompt: templateDef.system_prompt!,
        input_schema: templateDef.input_schema as unknown as InputSchema,
        output_format: templateDef.output_format!,
        tags: templateDef.tags || [],
        is_custom: false,
      });
    }
  }

  /**
   * Get default template definitions for all modules
   */
  private getDefaultTemplateDefinitions(): Partial<TemplateRow>[] {
    return [
      ...this.getColdEmailTemplates(),
      ...this.getWebsiteCopyTemplates(),
      ...this.getHRDocsTemplates(),
      ...this.getYouTubeScriptsTemplates(),
    ];
  }

  private getColdEmailTemplates(): Partial<TemplateRow>[] {
    return [
      {
        module_type: ModuleType.COLD_EMAIL,
        name: 'Initial Outreach',
        description: 'First contact email for cold outreach campaigns',
        system_prompt: `You are an expert B2B sales copywriter. Generate a compelling cold outreach email that:
- Opens with a personalized hook based on the recipient's company or role
- Clearly articulates the value proposition
- Keeps the email concise (under 150 words)
- Ends with a clear, low-friction call to action
- Maintains a {{tone}} tone throughout

Format the output as:
SUBJECT: [subject line]
BODY:
[email body]`,
        input_schema: {
          fields: [
            { name: 'recipient_name', label: 'Recipient Name', type: 'text', required: true, placeholder: 'John Smith' },
            { name: 'recipient_company', label: 'Company', type: 'text', required: true, placeholder: 'Acme Corp' },
            { name: 'recipient_title', label: 'Job Title', type: 'text', required: true, placeholder: 'VP of Sales' },
            { name: 'value_proposition', label: 'Value Proposition', type: 'textarea', required: true, placeholder: 'Describe what you offer and the key benefit' },
            { name: 'tone', label: 'Tone', type: 'select', required: true, options: ['professional', 'casual', 'friendly', 'formal'] },
          ],
        } as InputSchema,
        output_format: 'SUBJECT: [subject]\nBODY:\n[body]',
        tags: ['outreach', 'sales', 'b2b'],
      },
      {
        module_type: ModuleType.COLD_EMAIL,
        name: 'Follow-Up Email',
        description: 'Follow-up email for prospects who haven\'t responded',
        system_prompt: `You are an expert B2B sales copywriter. Generate a follow-up email that:
- References the previous outreach without being pushy
- Provides additional value or a new angle
- Keeps the email brief (under 100 words)
- Includes a clear call to action
- Maintains a {{tone}} tone

Format the output as:
SUBJECT: [subject line]
BODY:
[email body]`,
        input_schema: {
          fields: [
            { name: 'recipient_name', label: 'Recipient Name', type: 'text', required: true, placeholder: 'John Smith' },
            { name: 'recipient_company', label: 'Company', type: 'text', required: true, placeholder: 'Acme Corp' },
            { name: 'recipient_title', label: 'Job Title', type: 'text', required: true, placeholder: 'VP of Sales' },
            { name: 'value_proposition', label: 'Value Proposition', type: 'textarea', required: true, placeholder: 'Describe what you offer and the key benefit' },
            { name: 'tone', label: 'Tone', type: 'select', required: true, options: ['professional', 'casual', 'friendly', 'formal'] },
            { name: 'follow_up_number', label: 'Follow-up Number', type: 'number', required: false, placeholder: '1' },
          ],
        } as InputSchema,
        output_format: 'SUBJECT: [subject]\nBODY:\n[body]',
        tags: ['follow-up', 'sales', 'b2b'],
      },
      {
        module_type: ModuleType.COLD_EMAIL,
        name: 'LinkedIn Connection Message',
        description: 'Short message for LinkedIn connection requests',
        system_prompt: `You are an expert at professional networking. Generate a LinkedIn connection message that:
- Is personalized to the recipient
- Explains why you want to connect
- Is under 300 characters (LinkedIn limit)
- Maintains a {{tone}} tone

Output only the message text, no formatting.`,
        input_schema: {
          fields: [
            { name: 'recipient_name', label: 'Recipient Name', type: 'text', required: true, placeholder: 'John Smith' },
            { name: 'recipient_company', label: 'Company', type: 'text', required: true, placeholder: 'Acme Corp' },
            { name: 'recipient_title', label: 'Job Title', type: 'text', required: true, placeholder: 'VP of Sales' },
            { name: 'value_proposition', label: 'Connection Reason', type: 'textarea', required: true, placeholder: 'Why do you want to connect?' },
            { name: 'tone', label: 'Tone', type: 'select', required: true, options: ['professional', 'casual', 'friendly', 'formal'] },
          ],
        } as InputSchema,
        output_format: '[message]',
        tags: ['linkedin', 'networking', 'social'],
      },
    ];
  }

  private getWebsiteCopyTemplates(): Partial<TemplateRow>[] {
    return [
      {
        module_type: ModuleType.WEBSITE_COPY,
        name: 'Landing Page',
        description: 'Complete landing page copy with headline, benefits, and CTA',
        system_prompt: `You are an expert conversion copywriter. Generate landing page copy that:
- Has a compelling headline that captures attention
- Includes a clear subheadline that explains the value
- Lists 3-5 key benefits with brief descriptions
- Has a strong call-to-action
- Includes an SEO meta description (under 160 characters)

Format the output as:
HEADLINE: [headline]
SUBHEADLINE: [subheadline]
BENEFITS:
- [benefit 1]: [description]
- [benefit 2]: [description]
- [benefit 3]: [description]
CTA: [call to action text]
META_DESCRIPTION: [SEO meta description]`,
        input_schema: {
          fields: [
            { name: 'product_service', label: 'Product/Service', type: 'textarea', required: true, placeholder: 'Describe your product or service' },
            { name: 'target_audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'Who is this for?' },
            { name: 'key_benefits', label: 'Key Benefits', type: 'textarea', required: true, placeholder: 'List the main benefits' },
            { name: 'unique_selling_point', label: 'Unique Selling Point', type: 'text', required: false, placeholder: 'What makes you different?' },
          ],
        } as InputSchema,
        output_format: 'HEADLINE: [headline]\nSUBHEADLINE: [subheadline]\nBENEFITS:\n[benefits]\nCTA: [cta]\nMETA_DESCRIPTION: [meta]',
        tags: ['landing-page', 'conversion', 'marketing'],
      },
      {
        module_type: ModuleType.WEBSITE_COPY,
        name: 'Product Description',
        description: 'Compelling product description for e-commerce or SaaS',
        system_prompt: `You are an expert product copywriter. Generate a product description that:
- Highlights key features and benefits
- Addresses the target audience's pain points
- Uses persuasive language without being pushy
- Is scannable with clear sections
- Includes an SEO meta description

Format the output as:
TITLE: [product title]
DESCRIPTION: [main description]
FEATURES:
- [feature 1]
- [feature 2]
- [feature 3]
META_DESCRIPTION: [SEO meta description]`,
        input_schema: {
          fields: [
            { name: 'product_service', label: 'Product Name & Details', type: 'textarea', required: true, placeholder: 'Describe your product' },
            { name: 'target_audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'Who is this product for?' },
            { name: 'key_benefits', label: 'Key Features/Benefits', type: 'textarea', required: true, placeholder: 'List the main features and benefits' },
          ],
        } as InputSchema,
        output_format: 'TITLE: [title]\nDESCRIPTION: [description]\nFEATURES:\n[features]\nMETA_DESCRIPTION: [meta]',
        tags: ['product', 'e-commerce', 'saas'],
      },
      {
        module_type: ModuleType.WEBSITE_COPY,
        name: 'About Page',
        description: 'Compelling about page copy that tells your company story',
        system_prompt: `You are an expert brand copywriter. Generate about page copy that:
- Tells a compelling company story
- Highlights the mission and values
- Introduces the team or founder
- Builds trust and credibility
- Includes an SEO meta description (under 160 characters)

Format the output as:
HEADLINE: [headline]
STORY: [company story]
MISSION: [mission statement]
VALUES:
- [value 1]: [description]
- [value 2]: [description]
- [value 3]: [description]
TEAM: [team/founder introduction]
META_DESCRIPTION: [SEO meta description]`,
        input_schema: {
          fields: [
            { name: 'product_service', label: 'Company/Product', type: 'textarea', required: true, placeholder: 'Describe your company and what you do' },
            { name: 'target_audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'Who are your customers?' },
            { name: 'key_benefits', label: 'Mission & Values', type: 'textarea', required: true, placeholder: 'Describe your mission and core values' },
            { name: 'founding_story', label: 'Founding Story', type: 'textarea', required: false, placeholder: 'How did the company start?' },
          ],
        } as InputSchema,
        output_format: 'HEADLINE: [headline]\nSTORY: [story]\nMISSION: [mission]\nVALUES:\n[values]\nTEAM: [team]\nMETA_DESCRIPTION: [meta]',
        tags: ['about-page', 'branding', 'company'],
      },
    ];
  }

  private getHRDocsTemplates(): Partial<TemplateRow>[] {
    return [
      {
        module_type: ModuleType.HR_DOCS,
        name: 'Job Description',
        description: 'Professional job description with responsibilities and requirements',
        system_prompt: `You are an expert HR professional. Generate a job description that:
- Has a clear, searchable job title
- Describes the role and its impact
- Lists key responsibilities
- Specifies required and preferred qualifications
- Reflects the company culture
- Is inclusive and avoids biased language

Format the output as:
TITLE: [job title]
ABOUT_THE_ROLE: [role description]
RESPONSIBILITIES:
- [responsibility 1]
- [responsibility 2]
- [responsibility 3]
REQUIREMENTS:
- [requirement 1]
- [requirement 2]
- [requirement 3]
PREFERRED:
- [preferred qualification 1]
- [preferred qualification 2]
CULTURE: [company culture statement]`,
        input_schema: {
          fields: [
            { name: 'role_title', label: 'Role Title', type: 'text', required: true, placeholder: 'Senior Software Engineer' },
            { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea', required: true, placeholder: 'List the main responsibilities' },
            { name: 'requirements', label: 'Requirements', type: 'textarea', required: true, placeholder: 'List required qualifications' },
            { name: 'company_culture', label: 'Company Culture', type: 'textarea', required: true, placeholder: 'Describe your company culture' },
            { name: 'department', label: 'Department', type: 'text', required: false, placeholder: 'Engineering' },
          ],
        } as InputSchema,
        output_format: 'TITLE: [title]\nABOUT_THE_ROLE: [about]\nRESPONSIBILITIES:\n[responsibilities]\nREQUIREMENTS:\n[requirements]\nPREFERRED:\n[preferred]\nCULTURE: [culture]',
        tags: ['job-description', 'hiring', 'recruitment'],
      },
      {
        module_type: ModuleType.HR_DOCS,
        name: 'Offer Letter',
        description: 'Professional job offer letter template',
        system_prompt: `You are an expert HR professional. Generate a professional offer letter that:
- Congratulates the candidate
- Clearly states the position and start date
- Outlines compensation and benefits
- Includes next steps
- Maintains a warm but professional tone

Format the output as:
SUBJECT: [email subject]
BODY:
[offer letter body]`,
        input_schema: {
          fields: [
            { name: 'candidate_name', label: 'Candidate Name', type: 'text', required: true, placeholder: 'Jane Doe' },
            { name: 'role_title', label: 'Position Title', type: 'text', required: true, placeholder: 'Senior Software Engineer' },
            { name: 'start_date', label: 'Start Date', type: 'text', required: true, placeholder: 'January 15, 2025' },
            { name: 'compensation', label: 'Compensation Details', type: 'textarea', required: true, placeholder: 'Salary, equity, benefits' },
            { name: 'company_culture', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Corp' },
          ],
        } as InputSchema,
        output_format: 'SUBJECT: [subject]\nBODY:\n[body]',
        tags: ['offer-letter', 'hiring', 'onboarding'],
      },
      {
        module_type: ModuleType.HR_DOCS,
        name: 'Performance Review',
        description: 'Structured performance review document for employee evaluations',
        system_prompt: `You are an expert HR professional. Generate a performance review document that:
- Provides a balanced assessment of performance
- Highlights key achievements and strengths
- Identifies areas for improvement constructively
- Sets clear goals for the next review period
- Maintains a professional and supportive tone

Format the output as:
EMPLOYEE: [employee name]
REVIEW_PERIOD: [review period]
OVERALL_RATING: [rating]
ACHIEVEMENTS:
- [achievement 1]
- [achievement 2]
- [achievement 3]
STRENGTHS:
- [strength 1]
- [strength 2]
AREAS_FOR_IMPROVEMENT:
- [area 1]
- [area 2]
GOALS:
- [goal 1]
- [goal 2]
- [goal 3]
SUMMARY: [overall summary and recommendations]`,
        input_schema: {
          fields: [
            { name: 'employee_name', label: 'Employee Name', type: 'text', required: true, placeholder: 'John Smith' },
            { name: 'role_title', label: 'Position Title', type: 'text', required: true, placeholder: 'Software Engineer' },
            { name: 'review_period', label: 'Review Period', type: 'text', required: true, placeholder: 'Q1 2025' },
            { name: 'achievements', label: 'Key Achievements', type: 'textarea', required: true, placeholder: 'List notable accomplishments' },
            { name: 'areas_for_improvement', label: 'Areas for Improvement', type: 'textarea', required: true, placeholder: 'List areas that need development' },
            { name: 'company_culture', label: 'Company Values', type: 'textarea', required: false, placeholder: 'Company values to align feedback with' },
          ],
        } as InputSchema,
        output_format: 'EMPLOYEE: [employee]\nREVIEW_PERIOD: [period]\nOVERALL_RATING: [rating]\nACHIEVEMENTS:\n[achievements]\nSTRENGTHS:\n[strengths]\nAREAS_FOR_IMPROVEMENT:\n[areas]\nGOALS:\n[goals]\nSUMMARY: [summary]',
        tags: ['performance-review', 'evaluation', 'hr'],
      },
    ];
  }

  private getYouTubeScriptsTemplates(): Partial<TemplateRow>[] {
    return [
      {
        module_type: ModuleType.YOUTUBE_SCRIPTS,
        name: 'Tutorial Video Script',
        description: 'Script for educational/tutorial YouTube videos',
        system_prompt: `You are an expert YouTube content creator. Generate a tutorial video script that:
- Has a hook in the first 10 seconds
- Clearly explains the topic step by step
- Includes timestamps for sections
- Has a strong call to action at the end
- Is engaging and conversational

Format the output as:
TITLE: [video title]
HOOK: [opening hook - first 10 seconds]
INTRO: [introduction]
SECTIONS:
[00:00] [section 1]
[timestamp] [section 2]
[timestamp] [section 3]
OUTRO: [closing and CTA]`,
        input_schema: {
          fields: [
            { name: 'topic', label: 'Video Topic', type: 'text', required: true, placeholder: 'How to build a REST API' },
            { name: 'target_audience', label: 'Target Audience', type: 'text', required: true, placeholder: 'Beginner developers' },
            { name: 'key_points', label: 'Key Points to Cover', type: 'textarea', required: true, placeholder: 'List the main points' },
            { name: 'video_length', label: 'Target Length (minutes)', type: 'number', required: false, placeholder: '10' },
          ],
        } as InputSchema,
        output_format: 'TITLE: [title]\nHOOK: [hook]\nINTRO: [intro]\nSECTIONS:\n[sections]\nOUTRO: [outro]',
        tags: ['tutorial', 'educational', 'youtube'],
      },
    ];
  }
}
