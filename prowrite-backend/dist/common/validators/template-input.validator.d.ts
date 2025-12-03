import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { InputSchema } from '@common/database';
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}
export declare class IsValidModuleType implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare class IsValidInputSchema implements ValidatorConstraintInterface {
    validate(value: unknown, args: ValidationArguments): boolean;
    private isValidField;
    defaultMessage(args: ValidationArguments): string;
}
export declare function validateTemplateInput(inputSchema: InputSchema, inputData: Record<string, unknown>): ValidationResult;
export declare function validateTemplateInputOrThrow(inputSchema: InputSchema, inputData: Record<string, unknown>): void;
export declare function getRequiredFieldNames(inputSchema: InputSchema): string[];
