import * as fc from 'fast-check';
import {
  validateTemplateInput,
  validateTemplateInputOrThrow,
  getRequiredFieldNames,
} from './template-input.validator';
import { InputSchema, InputField } from '@common/entities';
import { BadRequestException } from '@nestjs/common';

/**
 * **Feature: prowrite-ai, Property 8: Required Field Validation**
 * **Validates: Requirements 3.4**
 */
describe('Template Input Validator Property Tests', () => {
  const fieldTypeArb = fc.constantFrom('text', 'textarea', 'select', 'number') as fc.Arbitrary<
    'text' | 'textarea' | 'select' | 'number'
  >;

  const fieldNameArb = fc.stringMatching(/^[a-z][a-z0-9_]{0,19}$/);

  const requiredFieldArb: fc.Arbitrary<InputField> = fc.record({
    name: fieldNameArb,
    label: fc.string({ minLength: 1, maxLength: 50 }),
    type: fieldTypeArb,
    required: fc.constant(true),
    placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    options: fc.option(
      fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
      { nil: undefined },
    ),
  });

  const optionalFieldArb: fc.Arbitrary<InputField> = fc.record({
    name: fieldNameArb,
    label: fc.string({ minLength: 1, maxLength: 50 }),
    type: fieldTypeArb,
    required: fc.constant(false),
    placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    options: fc.option(
      fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
      { nil: undefined },
    ),
  });

  const inputSchemaWithRequiredFieldsArb: fc.Arbitrary<InputSchema> = fc
    .tuple(
      fc.array(requiredFieldArb, { minLength: 1, maxLength: 3 }),
      fc.array(optionalFieldArb, { minLength: 0, maxLength: 2 }),
    )
    .map(([requiredFields, optionalFields]) => ({
      fields: [...requiredFields, ...optionalFields],
    }))
    .filter((schema) => {
      const names = schema.fields.map((f) => f.name);
      return new Set(names).size === names.length;
    });


  describe('Property 8: Required Field Validation', () => {
    it('should return validation error when any required field is missing', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      fc.assert(
        fc.property(inputSchemaWithRequiredFieldsArb, (schema) => {
          const requiredFieldNames = getRequiredFieldNames(schema);
          expect(requiredFieldNames.length).toBeGreaterThan(0);

          for (const fieldToOmit of requiredFieldNames) {
            const inputData: Record<string, unknown> = {};
            for (const field of schema.fields) {
              if (field.name !== fieldToOmit) {
                inputData[field.name] = field.type === 'number' ? 42 : 'valid value';
              }
            }

            const result = validateTemplateInput(schema, inputData);

            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some((e) => e.includes(fieldToOmit))).toBe(true);
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should return validation error when required field is null', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      fc.assert(
        fc.property(inputSchemaWithRequiredFieldsArb, (schema) => {
          const requiredFieldNames = getRequiredFieldNames(schema);

          for (const fieldToNullify of requiredFieldNames) {
            const inputData: Record<string, unknown> = {};
            for (const field of schema.fields) {
              if (field.name === fieldToNullify) {
                inputData[field.name] = null;
              } else {
                inputData[field.name] = field.type === 'number' ? 42 : 'valid value';
              }
            }

            const result = validateTemplateInput(schema, inputData);

            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes(fieldToNullify))).toBe(true);
          }

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should return validation error when required string field is empty', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      fc.assert(
        fc.property(
          inputSchemaWithRequiredFieldsArb,
          fc.constantFrom('', '   ', '\t', '\n'),
          (schema, emptyValue) => {
            const requiredStringFields = schema.fields.filter(
              (f) => f.required && (f.type === 'text' || f.type === 'textarea'),
            );

            if (requiredStringFields.length === 0) {
              return true;
            }

            const fieldToEmpty = requiredStringFields[0];

            const inputData: Record<string, unknown> = {};
            for (const field of schema.fields) {
              if (field.name === fieldToEmpty.name) {
                inputData[field.name] = emptyValue;
              } else {
                inputData[field.name] = field.type === 'number' ? 42 : 'valid value';
              }
            }

            const result = validateTemplateInput(schema, inputData);

            expect(result.valid).toBe(false);
            expect(result.errors.some((e) => e.includes(fieldToEmpty.name))).toBe(true);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should throw BadRequestException when validation fails', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      fc.assert(
        fc.property(inputSchemaWithRequiredFieldsArb, (schema) => {
          const requiredFieldNames = getRequiredFieldNames(schema);
          const fieldToOmit = requiredFieldNames[0];

          const inputData: Record<string, unknown> = {};
          for (const field of schema.fields) {
            if (field.name !== fieldToOmit) {
              inputData[field.name] = field.type === 'number' ? 42 : 'valid value';
            }
          }

          expect(() => validateTemplateInputOrThrow(schema, inputData)).toThrow(BadRequestException);

          return true;
        }),
        { numRuns: 100 },
      );
    });


    it('should pass validation when all required fields are provided', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      fc.assert(
        fc.property(inputSchemaWithRequiredFieldsArb, (schema) => {
          const inputData: Record<string, unknown> = {};
          for (const field of schema.fields) {
            inputData[field.name] = field.type === 'number' ? 42 : 'valid value';
          }

          const result = validateTemplateInput(schema, inputData);

          expect(result.valid).toBe(true);
          expect(result.errors.length).toBe(0);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should pass validation when optional fields are missing', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      fc.assert(
        fc.property(inputSchemaWithRequiredFieldsArb, (schema) => {
          const inputData: Record<string, unknown> = {};
          for (const field of schema.fields) {
            if (field.required) {
              inputData[field.name] = field.type === 'number' ? 42 : 'valid value';
            }
          }

          const result = validateTemplateInput(schema, inputData);

          expect(result.valid).toBe(true);
          expect(result.errors.length).toBe(0);

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should handle empty schema gracefully', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      const emptySchema: InputSchema = { fields: [] };
      const result = validateTemplateInput(emptySchema, {});

      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should handle null/undefined schema gracefully', () => {
      // **Feature: prowrite-ai, Property 8: Required Field Validation**
      const result1 = validateTemplateInput(null as unknown as InputSchema, {});
      const result2 = validateTemplateInput(undefined as unknown as InputSchema, {});

      expect(result1.valid).toBe(true);
      expect(result2.valid).toBe(true);
    });
  });
});
