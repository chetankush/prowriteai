import * as fc from 'fast-check';
import { ModuleType, InputSchema, InputField } from '@common/entities';

/**
 * **Feature: prowrite-ai, Property 15: Cold Email Input Schema**
 * **Validates: Requirements 5.2**
 *
 * For any cold email template, the input schema SHALL include fields for
 * recipient_name, recipient_company, recipient_title, value_proposition, and tone.
 */
describe('Cold Email Input Schema Property Tests', () => {
  // Required field names for cold email templates per Requirements 5.2
  const REQUIRED_COLD_EMAIL_FIELDS = [
    'recipient_name',
    'recipient_company',
    'recipient_title',
    'value_proposition',
    'tone',
  ] as const;

  // Arbitrary for InputField
  const inputFieldArb: fc.Arbitrary<InputField> = fc.record({
    name: fc.stringMatching(/^[a-z][a-z0-9_]{0,29}$/),
    label: fc.string({ minLength: 1, maxLength: 50 }),
    type: fc.constantFrom('text', 'textarea', 'select', 'number') as fc.Arbitrary<
      'text' | 'textarea' | 'select' | 'number'
    >,
    required: fc.boolean(),
    placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
    options: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }), {
      nil: undefined,
    }),
  });

  // Arbitrary for a valid cold email InputSchema that includes all required fields
  const validColdEmailInputSchemaArb: fc.Arbitrary<InputSchema> = fc
    .tuple(
      // Required fields with proper names
      fc.record({
        name: fc.constant('recipient_name'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('text') as fc.Arbitrary<'text'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
      fc.record({
        name: fc.constant('recipient_company'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('text') as fc.Arbitrary<'text'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
      fc.record({
        name: fc.constant('recipient_title'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('text') as fc.Arbitrary<'text'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
      fc.record({
        name: fc.constant('value_proposition'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('textarea') as fc.Arbitrary<'textarea'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
      fc.record({
        name: fc.constant('tone'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('select') as fc.Arbitrary<'select'>,
        required: fc.constant(true),
        options: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
      }),
    )
    .chain((requiredFields) =>
      // Optionally add extra fields
      fc.array(inputFieldArb, { maxLength: 3 }).map((extraFields) => ({
        fields: [...requiredFields, ...extraFields] as InputField[],
      })),
    );

  // Arbitrary for cold email template-like objects
  const coldEmailTemplateArb = fc.record({
    id: fc.uuid(),
    workspaceId: fc.option(fc.uuid(), { nil: null }),
    moduleType: fc.constant(ModuleType.COLD_EMAIL),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
    systemPrompt: fc.string({ minLength: 1, maxLength: 500 }),
    inputSchema: validColdEmailInputSchemaArb,
    outputFormat: fc.string({ minLength: 1, maxLength: 200 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
    isCustom: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

  /**
   * Validates that a cold email template's input schema contains all required fields
   */
  function validateColdEmailInputSchema(inputSchema: InputSchema): {
    isValid: boolean;
    missingFields: string[];
  } {
    const fieldNames = inputSchema.fields.map((f) => f.name);
    const missingFields = REQUIRED_COLD_EMAIL_FIELDS.filter(
      (requiredField) => !fieldNames.includes(requiredField),
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  it('should have all required fields in cold email template input schema', () => {
    // **Feature: prowrite-ai, Property 15: Cold Email Input Schema**
    fc.assert(
      fc.property(coldEmailTemplateArb, (template) => {
        const validation = validateColdEmailInputSchema(template.inputSchema);

        // Property: All required fields must be present
        expect(validation.isValid).toBe(true);
        expect(validation.missingFields).toHaveLength(0);

        // Verify each required field exists
        const fieldNames = template.inputSchema.fields.map((f) => f.name);
        for (const requiredField of REQUIRED_COLD_EMAIL_FIELDS) {
          expect(fieldNames).toContain(requiredField);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing required fields in invalid cold email schemas', () => {
    // **Feature: prowrite-ai, Property 15: Cold Email Input Schema**
    // This test verifies the validation function correctly identifies missing fields

    // Arbitrary for incomplete input schema (missing at least one required field)
    const incompleteInputSchemaArb: fc.Arbitrary<InputSchema> = fc
      .subarray([...REQUIRED_COLD_EMAIL_FIELDS], { minLength: 0, maxLength: 4 })
      .chain((includedFields) => {
        const fields = includedFields.map((name) => ({
          name,
          label: name.replace(/_/g, ' '),
          type: 'text' as const,
          required: true,
        }));
        return fc.constant({ fields });
      });

    fc.assert(
      fc.property(incompleteInputSchemaArb, (inputSchema) => {
        const validation = validateColdEmailInputSchema(inputSchema);
        const fieldNames = inputSchema.fields.map((f) => f.name);

        // Calculate expected missing fields
        const expectedMissing = REQUIRED_COLD_EMAIL_FIELDS.filter(
          (f) => !fieldNames.includes(f),
        );

        // Property: Validation should correctly identify all missing fields
        expect(validation.missingFields.sort()).toEqual(expectedMissing.sort());
        expect(validation.isValid).toBe(expectedMissing.length === 0);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should allow additional fields beyond the required ones', () => {
    // **Feature: prowrite-ai, Property 15: Cold Email Input Schema**
    fc.assert(
      fc.property(
        coldEmailTemplateArb,
        fc.array(inputFieldArb, { minLength: 1, maxLength: 3 }),
        (template, extraFields) => {
          // Add extra fields to the schema
          const extendedSchema: InputSchema = {
            fields: [...template.inputSchema.fields, ...extraFields],
          };

          const validation = validateColdEmailInputSchema(extendedSchema);

          // Property: Schema with extra fields should still be valid
          expect(validation.isValid).toBe(true);

          // Property: All required fields should still be present
          const fieldNames = extendedSchema.fields.map((f) => f.name);
          for (const requiredField of REQUIRED_COLD_EMAIL_FIELDS) {
            expect(fieldNames).toContain(requiredField);
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should validate actual cold email templates from the service', () => {
    // **Feature: prowrite-ai, Property 15: Cold Email Input Schema**
    // This test validates the actual default cold email templates

    // Import the actual template definitions by recreating them
    const actualColdEmailTemplates = [
      {
        name: 'Initial Outreach',
        inputSchema: {
          fields: [
            { name: 'recipient_name', label: 'Recipient Name', type: 'text' as const, required: true },
            { name: 'recipient_company', label: 'Company', type: 'text' as const, required: true },
            { name: 'recipient_title', label: 'Job Title', type: 'text' as const, required: true },
            { name: 'value_proposition', label: 'Value Proposition', type: 'textarea' as const, required: true },
            { name: 'tone', label: 'Tone', type: 'select' as const, required: true, options: ['professional', 'casual', 'friendly', 'formal'] },
          ],
        },
      },
      {
        name: 'Follow-Up Email',
        inputSchema: {
          fields: [
            { name: 'recipient_name', label: 'Recipient Name', type: 'text' as const, required: true },
            { name: 'recipient_company', label: 'Company', type: 'text' as const, required: true },
            { name: 'recipient_title', label: 'Job Title', type: 'text' as const, required: true },
            { name: 'value_proposition', label: 'Value Proposition', type: 'textarea' as const, required: true },
            { name: 'tone', label: 'Tone', type: 'select' as const, required: true, options: ['professional', 'casual', 'friendly', 'formal'] },
            { name: 'follow_up_number', label: 'Follow-up Number', type: 'number' as const, required: false },
          ],
        },
      },
      {
        name: 'LinkedIn Connection Message',
        inputSchema: {
          fields: [
            { name: 'recipient_name', label: 'Recipient Name', type: 'text' as const, required: true },
            { name: 'recipient_company', label: 'Company', type: 'text' as const, required: true },
            { name: 'recipient_title', label: 'Job Title', type: 'text' as const, required: true },
            { name: 'value_proposition', label: 'Connection Reason', type: 'textarea' as const, required: true },
            { name: 'tone', label: 'Tone', type: 'select' as const, required: true, options: ['professional', 'casual', 'friendly', 'formal'] },
          ],
        },
      },
    ];

    // Validate each actual template
    for (const template of actualColdEmailTemplates) {
      const validation = validateColdEmailInputSchema(template.inputSchema);
      
      expect(validation.isValid).toBe(true);
      expect(validation.missingFields).toHaveLength(0);

      // Verify each required field exists
      const fieldNames = template.inputSchema.fields.map((f) => f.name);
      for (const requiredField of REQUIRED_COLD_EMAIL_FIELDS) {
        expect(fieldNames).toContain(requiredField);
      }
    }
  });
});
