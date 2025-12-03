import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BrandVoiceGuide } from '@common/database';

/**
 * DTO for brand voice guide configuration.
 * Validates tone, style, terminology, and avoid fields.
 * 
 * **Validates: Requirements 2.3**
 */
export class BrandVoiceGuideDto implements BrandVoiceGuide {
  @IsString({ message: 'tone must be a string' })
  @MinLength(1, { message: 'tone cannot be empty' })
  @MaxLength(100, { message: 'tone cannot exceed 100 characters' })
  tone!: string;

  @IsString({ message: 'style must be a string' })
  @MinLength(1, { message: 'style cannot be empty' })
  @MaxLength(100, { message: 'style cannot exceed 100 characters' })
  style!: string;

  @IsArray({ message: 'terminology must be an array' })
  @IsString({ each: true, message: 'each terminology item must be a string' })
  terminology!: string[];

  @IsArray({ message: 'avoid must be an array' })
  @IsString({ each: true, message: 'each avoid item must be a string' })
  avoid!: string[];
}

/**
 * DTO for workspace update requests.
 * All fields are optional for partial updates.
 * 
 * **Validates: Requirements 10.5**
 */
export class UpdateWorkspaceDto {
  @IsOptional()
  @IsString({ message: 'name must be a string' })
  @MinLength(1, { message: 'name cannot be empty' })
  @MaxLength(100, { message: 'name cannot exceed 100 characters' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(500, { message: 'description cannot exceed 500 characters' })
  description?: string;

  @IsOptional()
  @ValidateNested({ message: 'brand_voice_guide must be a valid object' })
  @Type(() => BrandVoiceGuideDto)
  brand_voice_guide?: BrandVoiceGuideDto;
}

export class WorkspaceResponseDto {
  id!: string;
  user_id!: string;
  name!: string;
  description!: string | null;
  brand_voice_guide!: BrandVoiceGuide | null;
  usage_limit!: number;
  usage_count!: number;
  created_at!: Date;
  updated_at!: Date;
}

export class UsageStatsDto {
  usage_count!: number;
  usage_limit!: number;
  remaining!: number;
  percentage_used!: number;
}
