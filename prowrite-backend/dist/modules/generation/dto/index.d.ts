export declare class GenerateRequestDto {
    template_id: string;
    input_data: Record<string, unknown>;
    generate_variations?: boolean;
    variation_count?: number;
}
export declare class GenerationResultDto {
    id: string;
    content: string;
    tokens: number;
    variations?: string[];
}
export declare class GenerationResponseDto {
    id: string;
    workspace_id: string;
    template_id: string;
    input_data: Record<string, unknown>;
    generated_content: string | null;
    tokens_used: number;
    status: string;
    error_message: string | null;
    created_at: Date;
    updated_at: Date;
}
