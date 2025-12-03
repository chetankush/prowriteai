import { OnModuleInit } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
export interface BrandVoiceGuide {
    tone: string;
    style: string;
    terminology: string[];
    avoid: string[];
}
export declare enum PlanType {
    FREE = "free",
    STARTER = "starter",
    PRO = "pro",
    ENTERPRISE = "enterprise"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELED = "canceled",
    PAST_DUE = "past_due"
}
export declare enum ModuleType {
    COLD_EMAIL = "cold_email",
    WEBSITE_COPY = "website_copy",
    YOUTUBE_SCRIPTS = "youtube_scripts",
    HR_DOCS = "hr_docs"
}
export declare enum GenerationStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed"
}
export declare enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant"
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
export type WorkspaceInsert = Omit<WorkspaceRow, 'id' | 'created_at' | 'updated_at'>;
export type SubscriptionInsert = Omit<SubscriptionRow, 'id' | 'created_at' | 'updated_at'>;
export type TemplateInsert = Omit<TemplateRow, 'id' | 'created_at' | 'updated_at'>;
export type GenerationInsert = Omit<GenerationRow, 'id' | 'created_at' | 'updated_at'>;
export type ConversationInsert = Omit<ConversationRow, 'id' | 'created_at' | 'updated_at'>;
export type MessageInsert = Omit<MessageRow, 'id' | 'created_at'>;
export type WorkspaceUpdate = Partial<WorkspaceInsert>;
export type SubscriptionUpdate = Partial<SubscriptionInsert>;
export type TemplateUpdate = Partial<TemplateInsert>;
export type GenerationUpdate = Partial<GenerationInsert>;
export type ConversationUpdate = Partial<ConversationInsert>;
export declare class SupabaseService implements OnModuleInit {
    private _client;
    get client(): SupabaseClient;
    onModuleInit(): void;
    get supabase(): SupabaseClient;
    get workspaces(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "workspaces", unknown>;
    get subscriptions(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "subscriptions", unknown>;
    get templates(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "templates", unknown>;
    get generations(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "generations", unknown>;
    get conversations(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "conversations", unknown>;
    get messages(): import("@supabase/postgrest-js").PostgrestQueryBuilder<any, any, any, "messages", unknown>;
}
