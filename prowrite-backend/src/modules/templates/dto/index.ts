import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsNotEmpty,
  MinLength,
  MaxLength,
  ValidateNested,
  IsBoolean,
  ArrayMaxSize,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModuleType, InputSchema } from '@common/database';
import { IsValidInputSchema } from '@common/validators';

/**
 * DTO for creating new templates.
 * Validates all required fields with appropriate constraints.
 * 
 * **Validates: Requirements 10.5, 3.4**
 */
export class CreateTemplateDto {
  @IsEnum(ModuleType, {
    message: `module_type must be one of: ${Object.values(ModuleType).join(', ')}`,
  })
  @IsNotEmpty({ message: 'module_type is required' })
  module_type!: ModuleType;

  @IsString({ message: 'name must be a string' })
  @IsNotEmpty({ message: 'name is required' })
  @MinLength(1, { message: 'name cannot be empty' })
  @MaxLength(100, { message: 'name cannot exceed 100 characters' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @MaxLength(500, { message: 'description cannot exceed 500 characters' })
  description?: string;

  @IsString({ message: 'system_prompt must be a string' })
  @IsNotEmpty({ message: 'system_prompt is required' })
  @MinLength(10, { message: 'system_prompt must be at least 10 characters' })
  @MaxLength(10000, { message: 'system_prompt cannot exceed 10000 characters' })
  system_prompt!: string;

  @IsObject({ message: 'input_schema must be an object' })
  @IsNotEmpty({ message: 'input_schema is required' })
  @Validate(IsValidInputSchema, { message: 'input_schema must have a valid fields array' })
  input_schema!: InputSchema;

  @IsString({ message: 'output_format must be a string' })
  @IsNotEmpty({ message: 'output_format is required' })
  @MinLength(1, { message: 'output_format cannot be empty' })
  @MaxLength(1000, { message: 'output_format cannot exceed 1000 characters' })
  output_format!: string;

  @IsOptional()
  @IsArray({ message: 'tags must be an array' })
  @IsString({ each: true, message: 'each tag must be a string' })
  @ArrayMaxSize(10, { message: 'tags cannot exceed 10 items' })
  tags?: string[];
}

export class TemplateResponseDto {
  id!: string;
  workspace_id!: string | null;
  module_type!: ModuleType;
  name!: string;
  description!: string | null;
  system_prompt!: string;
  input_schema!: InputSchema;
  output_format!: string;
  tags!: string[];
  is_custom!: boolean;
  created_at!: Date;
  updated_at!: Date;
}
