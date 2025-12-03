"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidInputSchema = exports.IsValidModuleType = void 0;
exports.validateTemplateInput = validateTemplateInput;
exports.validateTemplateInputOrThrow = validateTemplateInputOrThrow;
exports.getRequiredFieldNames = getRequiredFieldNames;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const database_1 = require("../database");
let IsValidModuleType = class IsValidModuleType {
    validate(value, args) {
        if (typeof value !== 'string') {
            return false;
        }
        return Object.values(database_1.ModuleType).includes(value);
    }
    defaultMessage(args) {
        const validTypes = Object.values(database_1.ModuleType).join(', ');
        return `module_type must be one of: ${validTypes}`;
    }
};
exports.IsValidModuleType = IsValidModuleType;
exports.IsValidModuleType = IsValidModuleType = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidModuleType', async: false })
], IsValidModuleType);
let IsValidInputSchema = class IsValidInputSchema {
    validate(value, args) {
        if (!value || typeof value !== 'object') {
            return false;
        }
        const schema = value;
        if (!schema.fields || !Array.isArray(schema.fields)) {
            return false;
        }
        for (const field of schema.fields) {
            if (!this.isValidField(field)) {
                return false;
            }
        }
        const fieldNames = schema.fields.map((f) => f.name);
        if (new Set(fieldNames).size !== fieldNames.length) {
            return false;
        }
        return true;
    }
    isValidField(field) {
        if (!field || typeof field !== 'object') {
            return false;
        }
        const f = field;
        if (typeof f.name !== 'string' || f.name.trim() === '') {
            return false;
        }
        if (typeof f.label !== 'string' || f.label.trim() === '') {
            return false;
        }
        if (!['text', 'textarea', 'select', 'number'].includes(f.type)) {
            return false;
        }
        if (typeof f.required !== 'boolean') {
            return false;
        }
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
            const v = f.validation;
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
    defaultMessage(args) {
        return 'input_schema must have a valid fields array with proper field definitions (name, label, type, required)';
    }
};
exports.IsValidInputSchema = IsValidInputSchema;
exports.IsValidInputSchema = IsValidInputSchema = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidInputSchema', async: false })
], IsValidInputSchema);
function validateTemplateInput(inputSchema, inputData) {
    const errors = [];
    if (!inputSchema || !inputSchema.fields) {
        return { valid: true, errors: [] };
    }
    for (const field of inputSchema.fields) {
        if (field.required) {
            const value = inputData[field.name];
            if (value === undefined || value === null) {
                errors.push(`Missing required field: ${field.name}`);
                continue;
            }
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
function validateTemplateInputOrThrow(inputSchema, inputData) {
    const result = validateTemplateInput(inputSchema, inputData);
    if (!result.valid) {
        throw new common_1.BadRequestException(result.errors.join('; '));
    }
}
function getRequiredFieldNames(inputSchema) {
    if (!inputSchema || !inputSchema.fields) {
        return [];
    }
    return inputSchema.fields
        .filter((field) => field.required)
        .map((field) => field.name);
}
//# sourceMappingURL=template-input.validator.js.map