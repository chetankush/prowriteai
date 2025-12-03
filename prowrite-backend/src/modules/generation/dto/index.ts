import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for content generation requests.
 * Validates template_id as UUID and input_data as non-empty object.
 * 
 * **Validates: Requirements 10.5**
 */
export class GenerateRequestDto {
  @IsString({ message: 'template_id must be a string' })
  @IsNotEmpty({ message: 'template_id is required' })
  @IsUUID('4', { message: 'template_id must be a valid UUID' })
  template_id!: string;

  @IsObject({ message: 'input_data must be an object' })
  @IsNotEmpty({ message: 'input_data is required' })
  input_data!: Record<string, unknown>;

  @IsOptional()
  @IsBoolean({ message: 'generate_variations must be a boolean' })
  generate_variations?: boolean;

  @IsOptional()
  @IsNumber({}, { message: 'variation_count must be a number' })
  @Min(1, { message: 'variation_count must be at least 1' })
  @Max(5, { message: 'variation_count cannot exceed 5' })
  @Type(() => Number)
  variation_count?: number;
}

export class GenerationResultDto {
  id!: string;
  content!: string;
  tokens!: number;
  variations?: string[];
}

export class GenerationResponseDto {
  id!: string;
  workspace_id!: string;
  template_id!: string;
  input_data!: Record<string, unknown>;
  generated_content!: string | null;
  tokens_used!: number;
  status!: string;
  error_message!: string | null;
  created_at!: Date;
  updated_at!: Date;
}
