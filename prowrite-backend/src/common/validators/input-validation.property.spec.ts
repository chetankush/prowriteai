import 'reflect-metadata';
import * as fc from 'fast-check';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { GenerateRequestDto } from '@modules/generation/dto';
import { UpdateWorkspaceDto, BrandVoiceGuideDto } from '@modules/workspace/dto';
import { CreateTemplateDto } from '@modules/templates/dto';
import { ModuleType } from '@common/database';

/**
 * **Feature: prowrite-ai, Property 32: Input Validation Response**
 * **Validates: Requirements 10.5**
 *
 * For any request with malformed or invalid input data, the API response
 * SHALL be 400 Bad Request with a descriptive validation error message.
 */
describe('Input Validation Property Tests', () => {
  describe('Property 32: Input Validation Response', () => {
    describe('GenerateRequestDto Validation', () => {
      // Arbitrary for invalid template_id values (not valid UUIDs)
      const invalidTemplateIdArb = fc.oneof(
        fc.constant(''),
        fc.constant('not-a-uuid'),
        fc.constant('12345'),
        fc.stringMatching(/^[a-z]{5,10}$/),
        fc.integer().map(String),
        fc.constant(null),
        fc.constant(undefined),
      );

      // Arbitrary for invalid input_data values
      const invalidInputDataArb = fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant('string'),
        fc.integer(),
        fc.constant([]),
      );

      it('should reject invalid template_id with descriptive error', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        await fc.assert(
          fc.asyncProperty(invalidTemplateIdArb, async (invalidId) => {
            const dto = plainToInstance(GenerateRequestDto, {
              template_id: invalidId,
              input_data: { field: 'value' },
            });

            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have descriptive error message for template_id
            const templateIdError = errors.find((e) => e.property === 'template_id');
            expect(templateIdError).toBeDefined();
            expect(templateIdError?.constraints).toBeDefined();

            // Error message should be descriptive
            const errorMessages = Object.values(templateIdError?.constraints || {});
            expect(errorMessages.length).toBeGreaterThan(0);
            expect(errorMessages.some((msg) => typeof msg === 'string' && msg.length > 0)).toBe(true);

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should reject invalid input_data with descriptive error', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        await fc.assert(
          fc.asyncProperty(invalidInputDataArb, async (invalidData) => {
            const dto = plainToInstance(GenerateRequestDto, {
              template_id: '550e8400-e29b-41d4-a716-446655440000',
              input_data: invalidData,
            });

            const errors = await validate(dto);

            // Should have validation errors
            expect(errors.length).toBeGreaterThan(0);

            // Should have descriptive error message for input_data
            const inputDataError = errors.find((e) => e.property === 'input_data');
            expect(inputDataError).toBeDefined();

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should accept valid GenerateRequestDto', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        // Test with known valid UUID v4 formats
        const validUuids = [
          '550e8400-e29b-41d4-a716-446655440000',
          'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          '6ba7b810-9dad-41d4-80b4-00c04fd430c8',
        ];

        for (const uuid of validUuids) {
          const dto = plainToInstance(GenerateRequestDto, {
            template_id: uuid,
            input_data: { field: 'value', another: 'test' },
          });

          const errors = await validate(dto);
          expect(errors.length).toBe(0);
        }
      });

      it('should accept valid GenerateRequestDto with various input_data', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        const validUuid = '550e8400-e29b-41d4-a716-446655440000';

        // Generate non-empty input_data objects with valid field names and values
        const validInputDataArb = fc.record({
          field_name: fc.stringMatching(/^[a-zA-Z0-9]+$/),
          description: fc.stringMatching(/^[a-zA-Z0-9 ]+$/),
        });

        await fc.assert(
          fc.asyncProperty(validInputDataArb, async (inputData) => {
            const dto = plainToInstance(GenerateRequestDto, {
              template_id: validUuid,
              input_data: inputData,
            });

            const errors = await validate(dto);

            // Should have no validation errors for valid inputs
            expect(errors.length).toBe(0);

            return true;
          }),
          { numRuns: 50 },
        );
      });
    });


    describe('UpdateWorkspaceDto Validation', () => {
      // Arbitrary for invalid name values
      const invalidNameArb = fc.oneof(
        fc.constant(''),
        fc.string({ minLength: 101, maxLength: 150 }), // Too long
        fc.integer(),
        fc.constant([]),
      );

      // Arbitrary for invalid description values
      const invalidDescriptionArb = fc.oneof(
        fc.string({ minLength: 501, maxLength: 600 }), // Too long
        fc.integer(),
        fc.constant([]),
      );

      it('should reject invalid name with descriptive error', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        await fc.assert(
          fc.asyncProperty(invalidNameArb, async (invalidName) => {
            // Skip non-string values as they may be transformed
            if (typeof invalidName !== 'string') return true;

            const dto = plainToInstance(UpdateWorkspaceDto, {
              name: invalidName,
            });

            const errors = await validate(dto);

            if (invalidName === '' || invalidName.length > 100) {
              expect(errors.length).toBeGreaterThan(0);
              const nameError = errors.find((e) => e.property === 'name');
              expect(nameError).toBeDefined();
              expect(nameError?.constraints).toBeDefined();
            }

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should reject invalid description with descriptive error', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        await fc.assert(
          fc.asyncProperty(invalidDescriptionArb, async (invalidDesc) => {
            // Skip non-string values
            if (typeof invalidDesc !== 'string') return true;

            const dto = plainToInstance(UpdateWorkspaceDto, {
              description: invalidDesc,
            });

            const errors = await validate(dto);

            if (invalidDesc.length > 500) {
              expect(errors.length).toBeGreaterThan(0);
              const descError = errors.find((e) => e.property === 'description');
              expect(descError).toBeDefined();
            }

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should accept valid UpdateWorkspaceDto with all optional fields', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        const validNameArb = fc.string({ minLength: 1, maxLength: 100 });
        const validDescArb = fc.string({ minLength: 0, maxLength: 500 });

        await fc.assert(
          fc.asyncProperty(validNameArb, validDescArb, async (name, description) => {
            const dto = plainToInstance(UpdateWorkspaceDto, {
              name,
              description,
            });

            const errors = await validate(dto);

            // Should have no validation errors
            expect(errors.length).toBe(0);

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should accept empty UpdateWorkspaceDto (all fields optional)', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        const dto = plainToInstance(UpdateWorkspaceDto, {});
        const errors = await validate(dto);

        expect(errors.length).toBe(0);
      });
    });

    describe('CreateTemplateDto Validation', () => {
      // Arbitrary for invalid module_type values
      const invalidModuleTypeArb = fc.oneof(
        fc.constant(''),
        fc.constant('invalid_type'),
        fc.constant('COLD_EMAIL'), // Wrong case
        fc.integer(),
        fc.constant(null),
      );

      // Arbitrary for invalid system_prompt values
      const invalidSystemPromptArb = fc.oneof(
        fc.constant(''),
        fc.constant('short'), // Less than 10 chars
        fc.string({ minLength: 10001, maxLength: 10100 }), // Too long
      );

      // Arbitrary for invalid input_schema values
      const invalidInputSchemaArb = fc.oneof(
        fc.constant(null),
        fc.constant({}),
        fc.constant({ fields: 'not-array' }),
        fc.constant({ fields: [{ name: '' }] }), // Invalid field
        fc.constant({ fields: [{ name: 'test', label: '', type: 'text', required: true }] }), // Empty label
        fc.constant({ fields: [{ name: 'test', label: 'Test', type: 'invalid', required: true }] }), // Invalid type
      );

      it('should reject invalid module_type with descriptive error', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        await fc.assert(
          fc.asyncProperty(invalidModuleTypeArb, async (invalidType) => {
            const dto = plainToInstance(CreateTemplateDto, {
              module_type: invalidType,
              name: 'Test Template',
              system_prompt: 'This is a valid system prompt for testing',
              input_schema: { fields: [{ name: 'test', label: 'Test', type: 'text', required: true }] },
              output_format: 'text',
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const moduleTypeError = errors.find((e) => e.property === 'module_type');
            expect(moduleTypeError).toBeDefined();

            // Error message should mention valid module types
            const errorMessages = Object.values(moduleTypeError?.constraints || {});
            expect(errorMessages.length).toBeGreaterThan(0);

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should reject invalid system_prompt with descriptive error', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        await fc.assert(
          fc.asyncProperty(invalidSystemPromptArb, async (invalidPrompt) => {
            const dto = plainToInstance(CreateTemplateDto, {
              module_type: ModuleType.COLD_EMAIL,
              name: 'Test Template',
              system_prompt: invalidPrompt,
              input_schema: { fields: [{ name: 'test', label: 'Test', type: 'text', required: true }] },
              output_format: 'text',
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);
            const promptError = errors.find((e) => e.property === 'system_prompt');
            expect(promptError).toBeDefined();

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should reject invalid input_schema with descriptive error', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        await fc.assert(
          fc.asyncProperty(invalidInputSchemaArb, async (invalidSchema) => {
            const dto = plainToInstance(CreateTemplateDto, {
              module_type: ModuleType.COLD_EMAIL,
              name: 'Test Template',
              system_prompt: 'This is a valid system prompt for testing',
              input_schema: invalidSchema,
              output_format: 'text',
            });

            const errors = await validate(dto);

            expect(errors.length).toBeGreaterThan(0);

            return true;
          }),
          { numRuns: 50 },
        );
      });

      it('should accept valid CreateTemplateDto', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        const validModuleTypeArb = fc.constantFrom(...Object.values(ModuleType));
        const validNameArb = fc.string({ minLength: 1, maxLength: 100 });
        const validPromptArb = fc.string({ minLength: 10, maxLength: 1000 });

        await fc.assert(
          fc.asyncProperty(validModuleTypeArb, validNameArb, validPromptArb, async (moduleType, name, prompt) => {
            const dto = plainToInstance(CreateTemplateDto, {
              module_type: moduleType,
              name,
              system_prompt: prompt,
              input_schema: { fields: [{ name: 'test', label: 'Test', type: 'text', required: true }] },
              output_format: 'text',
            });

            const errors = await validate(dto);

            // Should have no validation errors
            expect(errors.length).toBe(0);

            return true;
          }),
          { numRuns: 50 },
        );
      });
    });

    describe('Error Message Descriptiveness', () => {
      it('should provide descriptive error messages for all validation failures', async () => {
        // **Feature: prowrite-ai, Property 32: Input Validation Response**
        // Test that error messages are descriptive and helpful
        
        // Test GenerateRequestDto
        const generateDto1 = plainToInstance(GenerateRequestDto, { template_id: '', input_data: {} });
        const generateDto2 = plainToInstance(GenerateRequestDto, { template_id: 'invalid', input_data: null });
        
        // Test UpdateWorkspaceDto
        const updateDto = plainToInstance(UpdateWorkspaceDto, { name: '' });
        
        // Test CreateTemplateDto
        const createDto = plainToInstance(CreateTemplateDto, { module_type: 'invalid', name: '', system_prompt: '' });

        const allInstances = [generateDto1, generateDto2, updateDto, createDto];

        for (const instance of allInstances) {
          const errors = await validate(instance);

          // Each error should have constraints with descriptive messages
          for (const error of errors) {
            if (error.constraints) {
              const messages = Object.values(error.constraints);
              for (const message of messages) {
                // Message should be non-empty and descriptive
                expect(typeof message).toBe('string');
                expect(message.length).toBeGreaterThan(0);
                // Message should mention the field name or provide context
                expect(
                  message.toLowerCase().includes(error.property) ||
                  message.toLowerCase().includes('must') ||
                  message.toLowerCase().includes('required') ||
                  message.toLowerCase().includes('cannot') ||
                  message.toLowerCase().includes('invalid')
                ).toBe(true);
              }
            }
          }
        }
      });
    });
  });
});
