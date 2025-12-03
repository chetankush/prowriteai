import { ModuleType, InputSchema } from '@common/database';
export declare class CreateTemplateDto {
    module_type: ModuleType;
    name: string;
    description?: string;
    system_prompt: string;
    input_schema: InputSchema;
    output_format: string;
    tags?: string[];
}
export declare class TemplateResponseDto {
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
    created_at: Date;
    updated_at: Date;
}
