import { BadRequestException } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { InputSchema, InputField, ModuleType } from '@common/database';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Custom validator for ModuleType enum values.
 * Validates that the value is one of the valid module types.
 * 
 * **Validates: Requirements 3.4, 10.5**
 */
@ValidatorConstraint({ name: 'isValidModuleType', async: false })
export class IsValidModuleType implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (typeof value !== 'string') {
      return false;
    }
    return Object.values(ModuleType).includes(value as ModuleType);
  }

  defaultMessage(args: ValidationArguments): string {
    const validTypes = Object.values(ModuleType).join(', ');
    return `module_type must be one of: ${validTypes}`;
  }
}

/**
 * Custom validator for InputSchema structure.
 * Validates that the input schema has a valid fields array with proper field definitions.
 * 
 * **Validates: Requirements 3.4, 10.5**
 */
@ValidatorConstraint({ name: 'isValidInputSchema', async: false })
export class IsValidInputSchema implements ValidatorConstraintInterface {
  validate(value: unknown, args: ValidationArguments): boolean {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const schema = value as InputSchema;

    // Check if fields array exists
    if (!schema.fields || !Array.isArray(schema.fields)) {
      return false;
    }

    // Validate each field in the schema
    for (const field of schema.fields) {
      if (!this.isValidField(field)) {
        return false;
      }
    }

    // Check for duplicate field names
    const fieldNames = schema.fields.map((f) => f.name);
    if (new Set(fieldNames).size !== fieldNames.length) {
      return false;
    }

    return true;
  }

  private isValidField(field: unknown): field is InputField {
    if (!field || typeof field !== 'object') {
      return false;
    }

    const f = field as Record<string, unknown>;

    // Required properties
    if (typeof f.name !== 'string' || f.name.trim() === '') {
      return false;
    }
    if (typeof f.label !== 'string' || f.label.trim() === '') {
      return false;
    }
    if (!['text', 'textarea', 'select', 'number'].includes(f.type as string)) {
      return false;
    }
    if (typeof f.required !== 'boolean') {
      return false;
    }

    // Optional properties validation
    if (f.placeholder !== undefined && typeof f.placeholder !== 'string') {
      return false;
    }
    if (f.options !== undefined) {
      if (!Array.isArray(f.options) || !f.options.every((o) => typeof o === 'string')) {
        return false;
      }
    }
    if (f.validation !== undefined) {
      if (typeof f.validation !== 'object') {
        return false;
      }
      const v = f.validation as Record<string, unknown>;
      if (v.minLength !== undefined && typeof v.minLength !== 'number') {
        return false;
      }
      if (v.maxLength !== undefined && typeof v.maxLength !== 'number') {
        return false;
      }
      if (v.pattern !== undefined && typeof v.pattern !== 'string') {
        return false;
      }
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return 'input_schema must have a valid fields array with proper field definitions (name, label, type, required)';
  }
}

/**
 * Validates input data against a template's input schema.
 * Ensures all required fields are present and non-empty.
 * 
 * @param inputSchema - The template's input schema defining required fields
 * @param inputData - The user-submitted input data
 * @returns ValidationResult with valid flag and any error messages
 */
export function validateTemplateInput(
  inputSchema: InputSchema,
  inputData: Record<string, unknown>,
): ValidationResult {
  const errors: string[] = [];

  if (!inputSchema || !inputSchema.fields) {
    return { valid: true, errors: [] };
  }

  for (const field of inputSchema.fields) {
    if (field.required) {
      const value = inputData[field.name];
      
      // Check if field is missing
      if (value === undefined || value === null) {
        errors.push(`Missing required field: ${field.name}`);
        continue;
      }

      // Check if field is empty string (for text/textarea types)
      if (typeof value === 'string' && value.trim() === '') {
        errors.push(`Required field cannot be empty: ${field.name}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates input data and throws BadRequestException if validation fails.
 * 
 * @param inputSchema - The template's input schema defining required fields
 * @param inputData - The user-submitted input data
 * @throws BadRequestException if any required field is missing
 */
export function validateTemplateInputOrThrow(
  inputSchema: InputSchema,
  inputData: Record<string, unknown>,
): void {
  const result = validateTemplateInput(inputSchema, inputData);
  
  if (!result.valid) {
    throw new BadRequestException(result.errors.join('; '));
  }
}

/**
 * Gets the list of required field names from an input schema.
 * 
 * @param inputSchema - The template's input schema
 * @returns Array of required field names
 */
export function getRequiredFieldNames(inputSchema: InputSchema): string[] {
  if (!inputSchema || !inputSchema.fields) {
    return [];
  }
  
  return inputSchema.fields
    .filter((field) => field.required)
    .map((field) => field.name);
}
