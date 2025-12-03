import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface BrandVoiceGuide {
  tone: string;
  style: string;
  terminology: string[];
  avoid: string[];
}

export enum PlanType {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
}

export enum ModuleType {
  COLD_EMAIL = 'cold_email',
  WEBSITE_COPY = 'website_copy',
  YOUTUBE_SCRIPTS = 'youtube_scripts',
  HR_DOCS = 'hr_docs',
}

export enum GenerationStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface InputField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number';
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface InputSchema {
  fields: InputField[];
}

// Row types
export interface WorkspaceRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  brand_voice_guide: BrandVoiceGuide | null;
  usage_limit: number;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionRow {
  id: string;
  workspace_id: string;
  stripe_subscription_id: string | null;
  plan_type: PlanType;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateRow {
  id: string;
  workspace_id: string | null;
  module_type: ModuleType;
  name: string;
  description: string | null;
  system_prompt: string;
  input_schema: InputSchema;
  output_format: string;
  tags: string[];
  is_custom: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerationRow {
  id: string;
  workspace_id: string;
  template_id: string;
  input_data: Record<string, unknown>;
  generated_content: string | null;
  tokens_used: number;
  status: GenerationStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationRow {
  id: string;
  workspace_id: string;
  module_type: ModuleType;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface GeneratedContent {
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  generated_content: GeneratedContent | null;
  created_at: string;
}

// Insert types (without auto-generated fields)
export type WorkspaceInsert = Omit<WorkspaceRow, 'id' | 'created_at' | 'updated_at'>;
export type SubscriptionInsert = Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'>;
export type TemplateInsert = Omit<TemplateRow, 'id' | 'created_at' | 'updated_at'>;
export type GenerationInsert = Omit<GenerationRow, 'id' | 'created_at' | 'updated_at'>;
export type ConversationInsert = Omit<ConversationRow, 'id' | 'created_at' | 'updated_at'>;
export type MessageInsert = Omit<MessageRow, 'id' | 'created_at'>;

// Update types (all fields optional)
export type WorkspaceUpdate = Partial<WorkspaceInsert>;
export type SubscriptionUpdate = Partial<SubscriptionInsert>;
export type TemplateUpdate = Partial<TemplateInsert>;
export type GenerationUpdate = Partial<GenerationInsert>;
export type ConversationUpdate = Partial<ConversationInsert>;

@Injectable()
export class SupabaseService implements OnModuleInit {
  private _client!: SupabaseClient;

  get client(): SupabaseClient {
    return this._client;
  }

  onModuleInit() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
    }

    this._client = createClient(supabaseUrl, supabaseKey);
  }

  get supabase(): SupabaseClient {
    return this._client;
  }

  // Workspace operations
  get workspaces() {
    return this.client.from('workspaces');
  }

  // Subscription operations
  get subscriptions() {
    return this.client.from('subscriptions');
  }

  // Template operations
  get templates() {
    return this.client.from('templates');
  }

  // Generation operations
  get generations() {
    return this.client.from('generations');
  }

  // Conversation operations
  get conversations() {
    return this.client.from('conversations');
  }

  // Message operations
  get messages() {
    return this.client.from('messages');
  }
}
