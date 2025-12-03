import { BrandVoiceGuide } from '@common/database';
export declare class BrandVoiceGuideDto implements BrandVoiceGuide {
    tone: string;
    style: string;
    terminology: string[];
    avoid: string[];
}
export declare class UpdateWorkspaceDto {
    name?: string;
    description?: string;
    brand_voice_guide?: BrandVoiceGuideDto;
}
export declare class WorkspaceResponseDto {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    brand_voice_guide: BrandVoiceGuide | null;
    usage_limit: number;
    usage_count: number;
    created_at: Date;
    updated_at: Date;
}
export declare class UsageStatsDto {
    usage_count: number;
    usage_limit: number;
    remaining: number;
    percentage_used: number;
}
