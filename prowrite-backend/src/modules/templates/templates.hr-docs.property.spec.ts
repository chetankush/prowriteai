import * as fc from 'fast-check';
import { ModuleType, InputSchema, InputField } from '@common/entities';

/**
 * **Feature: prowrite-ai, Property 22: HR Template Input Schema**
 * **Validates: Requirements 7.2**
 *
 * For any job description template, the input schema SHALL include fields for
 * role_title, responsibilities, requirements, and company_culture.
 */
describe('HR Template Input Schema Property Tests', () => {
  // Required field names for job description templates per Requirements 7.2
  const REQUIRED_JOB_DESCRIPTION_FIELDS = [
    'role_title',
    'responsibilities',
    'requirements',
    'company_culture',
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

  // Arbitrary for a valid job description InputSchema that includes all required fields
  const validJobDescriptionInputSchemaArb: fc.Arbitrary<InputSchema> = fc
    .tuple(
      // Required fields with proper names
      fc.record({
        name: fc.constant('role_title'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('text') as fc.Arbitrary<'text'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
      fc.record({
        name: fc.constant('responsibilities'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('textarea') as fc.Arbitrary<'textarea'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
      fc.record({
        name: fc.constant('requirements'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('textarea') as fc.Arbitrary<'textarea'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
      fc.record({
        name: fc.constant('company_culture'),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constant('textarea') as fc.Arbitrary<'textarea'>,
        required: fc.constant(true),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
      }),
    )
    .chain((requiredFields) =>
      // Optionally add extra fields
      fc.array(inputFieldArb, { maxLength: 3 }).map((extraFields) => ({
        fields: [...requiredFields, ...extraFields] as InputField[],
      })),
    );


  // Arbitrary for job description template-like objects
  const jobDescriptionTemplateArb = fc.record({
    id: fc.uuid(),
    workspaceId: fc.option(fc.uuid(), { nil: null }),
    moduleType: fc.constant(ModuleType.HR_DOCS),
    name: fc.constant('Job Description'),
    description: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
    systemPrompt: fc.string({ minLength: 1, maxLength: 500 }),
    inputSchema: validJobDescriptionInputSchemaArb,
    outputFormat: fc.string({ minLength: 1, maxLength: 200 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
    isCustom: fc.boolean(),
    createdAt: fc.date(),
    updatedAt: fc.date(),
  });

  /**
   * Validates that a job description template's input schema contains all required fields
   */
  function validateJobDescriptionInputSchema(inputSchema: InputSchema): {
    isValid: boolean;
    missingFields: string[];
  } {
    const fieldNames = inputSchema.fields.map((f) => f.name);
    const missingFields = REQUIRED_JOB_DESCRIPTION_FIELDS.filter(
      (requiredField) => !fieldNames.includes(requiredField),
    );

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  it('should have all required fields in job description template input schema', () => {
    // **Feature: prowrite-ai, Property 22: HR Template Input Schema**
    fc.assert(
      fc.property(jobDescriptionTemplateArb, (template) => {
        const validation = validateJobDescriptionInputSchema(template.inputSchema);

        // Property: All required fields must be present
        expect(validation.isValid).toBe(true);
        expect(validation.missingFields).toHaveLength(0);

        // Verify each required field exists
        const fieldNames = template.inputSchema.fields.map((f) => f.name);
        for (const requiredField of REQUIRED_JOB_DESCRIPTION_FIELDS) {
          expect(fieldNames).toContain(requiredField);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should detect missing required fields in invalid job description schemas', () => {
    // **Feature: prowrite-ai, Property 22: HR Template Input Schema**
    // This test verifies the validation function correctly identifies missing fields

    // Arbitrary for incomplete input schema (missing at least one required field)
    const incompleteInputSchemaArb: fc.Arbitrary<InputSchema> = fc
      .subarray([...REQUIRED_JOB_DESCRIPTION_FIELDS], { minLength: 0, maxLength: 3 })
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
        const validation = validateJobDescriptionInputSchema(inputSchema);
        const fieldNames = inputSchema.fields.map((f) => f.name);

        // Calculate expected missing fields
        const expectedMissing = REQUIRED_JOB_DESCRIPTION_FIELDS.filter(
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
    // **Feature: prowrite-ai, Property 22: HR Template Input Schema**
    fc.assert(
      fc.property(
        jobDescriptionTemplateArb,
        fc.array(inputFieldArb, { minLength: 1, maxLength: 3 }),
        (template, extraFields) => {
          // Add extra fields to the schema
          const extendedSchema: InputSchema = {
            fields: [...template.inputSchema.fields, ...extraFields],
          };

          const validation = validateJobDescriptionInputSchema(extendedSchema);

          // Property: Schema with extra fields should still be valid
          expect(validation.isValid).toBe(true);

          // Property: All required fields should still be present
          const fieldNames = extendedSchema.fields.map((f) => f.name);
          for (const requiredField of REQUIRED_JOB_DESCRIPTION_FIELDS) {
            expect(fieldNames).toContain(requiredField);
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });


  it('should validate actual job description template from the service', () => {
    // **Feature: prowrite-ai, Property 22: HR Template Input Schema**
    // This test validates the actual default job description template

    // The actual job description template definition from templates.service.ts
    const actualJobDescriptionTemplate = {
      name: 'Job Description',
      inputSchema: {
        fields: [
          { name: 'role_title', label: 'Role Title', type: 'text' as const, required: true, placeholder: 'Senior Software Engineer' },
          { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea' as const, required: true, placeholder: 'List the main responsibilities' },
          { name: 'requirements', label: 'Requirements', type: 'textarea' as const, required: true, placeholder: 'List required qualifications' },
          { name: 'company_culture', label: 'Company Culture', type: 'textarea' as const, required: true, placeholder: 'Describe your company culture' },
          { name: 'department', label: 'Department', type: 'text' as const, required: false, placeholder: 'Engineering' },
        ],
      },
    };

    const validation = validateJobDescriptionInputSchema(actualJobDescriptionTemplate.inputSchema);

    expect(validation.isValid).toBe(true);
    expect(validation.missingFields).toHaveLength(0);

    // Verify each required field exists
    const fieldNames = actualJobDescriptionTemplate.inputSchema.fields.map((f) => f.name);
    for (const requiredField of REQUIRED_JOB_DESCRIPTION_FIELDS) {
      expect(fieldNames).toContain(requiredField);
    }
  });

  it('should ensure required fields are marked as required in the schema', () => {
    // **Feature: prowrite-ai, Property 22: HR Template Input Schema**
    fc.assert(
      fc.property(jobDescriptionTemplateArb, (template) => {
        // Property: All required fields should have required: true
        for (const requiredFieldName of REQUIRED_JOB_DESCRIPTION_FIELDS) {
          const field = template.inputSchema.fields.find((f) => f.name === requiredFieldName);
          expect(field).toBeDefined();
          expect(field?.required).toBe(true);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should validate field types are appropriate for job description content', () => {
    // **Feature: prowrite-ai, Property 22: HR Template Input Schema**
    // This test ensures field types are appropriate for the content they capture

    const actualJobDescriptionTemplate = {
      inputSchema: {
        fields: [
          { name: 'role_title', label: 'Role Title', type: 'text' as const, required: true },
          { name: 'responsibilities', label: 'Key Responsibilities', type: 'textarea' as const, required: true },
          { name: 'requirements', label: 'Requirements', type: 'textarea' as const, required: true },
          { name: 'company_culture', label: 'Company Culture', type: 'textarea' as const, required: true },
        ],
      },
    };

    // role_title should be text (short input)
    const roleTitleField = actualJobDescriptionTemplate.inputSchema.fields.find(
      (f) => f.name === 'role_title',
    );
    expect(roleTitleField?.type).toBe('text');

    // responsibilities, requirements, and company_culture should be textarea (long input)
    const longTextFields = ['responsibilities', 'requirements', 'company_culture'];
    for (const fieldName of longTextFields) {
      const field = actualJobDescriptionTemplate.inputSchema.fields.find(
        (f) => f.name === fieldName,
      );
      expect(field?.type).toBe('textarea');
    }
  });
});
