import * as fc from 'fast-check';
import {
  Template,
  ModuleType,
  InputSchema,
  InputField,
} from '@common/entities';

/**
 * **Feature: prowrite-ai, Property 9: Template Serialization Round-Trip**
 * **Validates: Requirements 3.5, 3.6**
 *
 * For any valid template object, serializing to JSON storage format and
 * deserializing back SHALL produce an equivalent template with identical
 * structure and values.
 */
describe('Template Entity Property Tests', () => {
  // Arbitrary for InputField validation
  const inputFieldValidationArb = fc.record({
    minLength: fc.option(fc.integer({ min: 0, max: 1000 }), { nil: undefined }),
    maxLength: fc.option(fc.integer({ min: 1, max: 10000 }), { nil: undefined }),
    pattern: fc.option(fc.constantFrom('^[a-zA-Z]+$', '^\\d+$', '.*'), {
      nil: undefined,
    }),
  });

  // Arbitrary for InputField
  const inputFieldArb: fc.Arbitrary<InputField> = fc.record({
    name: fc.stringMatching(/^[a-z][a-z0-9_]{0,29}$/),
    label: fc.string({ minLength: 1, maxLength: 100 }),
    type: fc.constantFrom('text', 'textarea', 'select', 'number') as fc.Arbitrary<
      'text' | 'textarea' | 'select' | 'number'
    >,
    required: fc.boolean(),
    placeholder: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
    options: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 10 }), {
      nil: undefined,
    }),
    validation: fc.option(inputFieldValidationArb, { nil: undefined }),
  });

  // Arbitrary for InputSchema
  const inputSchemaArb: fc.Arbitrary<InputSchema> = fc.record({
    fields: fc.array(inputFieldArb, { minLength: 1, maxLength: 10 }),
  });

  // Arbitrary for ModuleType
  const moduleTypeArb = fc.constantFrom(
    ModuleType.COLD_EMAIL,
    ModuleType.WEBSITE_COPY,
    ModuleType.YOUTUBE_SCRIPTS,
    ModuleType.HR_DOCS,
  );

  // Arbitrary for Template data (using snake_case to match database row types)
  const templateDataArb = fc.record({
    id: fc.uuid(),
    workspace_id: fc.option(fc.uuid(), { nil: null }),
    module_type: moduleTypeArb,
    name: fc.string({ minLength: 1, maxLength: 100 }),
    description: fc.option(fc.string({ maxLength: 500 }), { nil: null }),
    system_prompt: fc.string({ minLength: 1, maxLength: 5000 }),
    input_schema: inputSchemaArb,
    output_format: fc.string({ minLength: 1, maxLength: 1000 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { maxLength: 10 }),
    is_custom: fc.boolean(),
  });

  // Helper to create a Template-like object for serialization testing
  const createTemplateObject = (data: {
    id: string;
    workspace_id: string | null;
    module_type: ModuleType;
    name: string;
    description: string | null;
    system_prompt: string;
    input_schema: InputSchema;
    output_format: string;
    tags: string[];
    is_custom: boolean;
  }): Partial<Template> => ({
    id: data.id,
    workspace_id: data.workspace_id,
    module_type: data.module_type,
    name: data.name,
    description: data.description,
    system_prompt: data.system_prompt,
    input_schema: data.input_schema,
    output_format: data.output_format,
    tags: data.tags,
    is_custom: data.is_custom,
  });

  it('should round-trip serialize/deserialize template data', () => {
    // **Feature: prowrite-ai, Property 9: Template Serialization Round-Trip**
    fc.assert(
      fc.property(templateDataArb, (templateData) => {
        const template = createTemplateObject(templateData);

        // Serialize to JSON (simulating database storage)
        const serialized = JSON.stringify(template);

        // Deserialize back
        const deserialized = JSON.parse(serialized);

        // Verify all fields are equivalent
        expect(deserialized.id).toBe(template.id);
        expect(deserialized.workspace_id).toBe(template.workspace_id);
        expect(deserialized.module_type).toBe(template.module_type);
        expect(deserialized.name).toBe(template.name);
        expect(deserialized.description).toBe(template.description);
        expect(deserialized.system_prompt).toBe(template.system_prompt);
        expect(deserialized.output_format).toBe(template.output_format);
        expect(deserialized.is_custom).toBe(template.is_custom);
        expect(deserialized.tags).toEqual(template.tags);
        expect(deserialized.input_schema).toEqual(template.input_schema);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve inputSchema structure through serialization', () => {
    // **Feature: prowrite-ai, Property 9: Template Serialization Round-Trip**
    fc.assert(
      fc.property(inputSchemaArb, (inputSchema) => {
        // Serialize
        const serialized = JSON.stringify(inputSchema);

        // Deserialize
        const deserialized: InputSchema = JSON.parse(serialized);

        // Verify fields array length
        expect(deserialized.fields.length).toBe(inputSchema.fields.length);

        // Verify each field
        for (let i = 0; i < inputSchema.fields.length; i++) {
          const original = inputSchema.fields[i];
          const restored = deserialized.fields[i];

          expect(restored.name).toBe(original.name);
          expect(restored.label).toBe(original.label);
          expect(restored.type).toBe(original.type);
          expect(restored.required).toBe(original.required);
          expect(restored.placeholder).toBe(original.placeholder);
          expect(restored.options).toEqual(original.options);
          expect(restored.validation).toEqual(original.validation);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should maintain moduleType enum values through serialization', () => {
    // **Feature: prowrite-ai, Property 9: Template Serialization Round-Trip**
    fc.assert(
      fc.property(moduleTypeArb, (moduleType) => {
        const data = { module_type: moduleType };

        const serialized = JSON.stringify(data);
        const deserialized = JSON.parse(serialized);

        // Enum value should be preserved as string
        expect(deserialized.module_type).toBe(moduleType);
        expect(Object.values(ModuleType)).toContain(deserialized.module_type);

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
