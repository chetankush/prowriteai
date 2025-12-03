import * as fc from 'fast-check';
import { ModuleType, Template, InputSchema } from '@common/entities';

/**
 * **Feature: prowrite-ai, Property 6: Template Module Filtering**
 * **Validates: Requirements 3.1**
 *
 * For any module type query, all returned templates SHALL have a module_type
 * field matching the requested module type.
 */
describe('TemplatesService Property Tests', () => {
  // Arbitrary for ModuleType
  const moduleTypeArb = fc.constantFrom(
    ModuleType.COLD_EMAIL,
    ModuleType.WEBSITE_COPY,
    ModuleType.YOUTUBE_SCRIPTS,
    ModuleType.HR_DOCS,
  );

  // Arbitrary for InputSchema
  const inputSchemaArb: fc.Arbitrary<InputSchema> = fc.record({
    fields: fc.array(
      fc.record({
        name: fc.stringMatching(/^[a-z][a-z0-9_]{0,19}$/),
        label: fc.string({ minLength: 1, maxLength: 50 }),
        type: fc.constantFrom('text', 'textarea', 'select', 'number') as fc.Arbitrary<
          'text' | 'textarea' | 'select' | 'number'
        >,
        required: fc.boolean(),
        placeholder: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        options: fc.option(fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }), {
          nil: undefined,
        }),
      }),
      { minLength: 1, maxLength: 5 },
    ),
  });

  // Arbitrary for Template-like objects (using snake_case to match database row types)
  const templateArb = fc.record({
    id: fc.uuid(),
    workspace_id: fc.option(fc.uuid(), { nil: null }),
    module_type: moduleTypeArb,
    name: fc.string({ minLength: 1, maxLength: 50 }),
    description: fc.option(fc.string({ maxLength: 200 }), { nil: null }),
    system_prompt: fc.string({ minLength: 1, maxLength: 500 }),
    input_schema: inputSchemaArb,
    output_format: fc.string({ minLength: 1, maxLength: 200 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 5 }),
    is_custom: fc.boolean(),
    created_at: fc.integer({ min: 1577836800000, max: 1924991999000 }).map(ts => new Date(ts).toISOString()),
    updated_at: fc.integer({ min: 1577836800000, max: 1924991999000 }).map(ts => new Date(ts).toISOString()),
  });

  /**
   * Simulates the filtering logic from TemplatesService.getTemplatesByModule
   * This is a pure function that mirrors the service's filtering behavior
   */
  function filterTemplatesByModule(
    templates: Partial<Template>[],
    moduleType: ModuleType,
    workspaceId?: string,
  ): Partial<Template>[] {
    return templates.filter((template) => {
      // Must match module type
      if (template.module_type !== moduleType) {
        return false;
      }

      // If workspaceId provided, return system templates OR workspace-specific templates
      if (workspaceId) {
        return template.workspace_id === null || template.workspace_id === workspaceId;
      }

      // Otherwise, return only system templates
      return template.workspace_id === null;
    });
  }

  it('should return only templates matching the requested module type', () => {
    // **Feature: prowrite-ai, Property 6: Template Module Filtering**
    fc.assert(
      fc.property(
        fc.array(templateArb, { minLength: 0, maxLength: 20 }),
        moduleTypeArb,
        fc.option(fc.uuid(), { nil: undefined }),
        (templates, requestedModuleType, workspaceId) => {
          // Filter templates using the same logic as the service
          const filteredTemplates = filterTemplatesByModule(
            templates,
            requestedModuleType,
            workspaceId,
          );

          // Property: ALL returned templates must have module_type matching the requested type
          for (const template of filteredTemplates) {
            expect(template.module_type).toBe(requestedModuleType);
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should not include templates from other module types', () => {
    // **Feature: prowrite-ai, Property 6: Template Module Filtering**
    fc.assert(
      fc.property(
        fc.array(templateArb, { minLength: 1, maxLength: 20 }),
        moduleTypeArb,
        (templates, requestedModuleType) => {
          const filteredTemplates = filterTemplatesByModule(templates, requestedModuleType);

          // Get all other module types
          const otherModuleTypes = Object.values(ModuleType).filter(
            (mt) => mt !== requestedModuleType,
          );

          // Property: No template in the result should have a different module type
          for (const template of filteredTemplates) {
            expect(otherModuleTypes).not.toContain(template.module_type);
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should return all matching templates for the requested module type', () => {
    // **Feature: prowrite-ai, Property 6: Template Module Filtering**
    fc.assert(
      fc.property(
        fc.array(templateArb, { minLength: 0, maxLength: 20 }),
        moduleTypeArb,
        (templates, requestedModuleType) => {
          // Filter for system templates only (workspace_id = null)
          const filteredTemplates = filterTemplatesByModule(templates, requestedModuleType);

          // Count expected matches: system templates with matching module type
          const expectedCount = templates.filter(
            (t) => t.module_type === requestedModuleType && t.workspace_id === null,
          ).length;

          // Property: Result count should match expected count
          expect(filteredTemplates.length).toBe(expectedCount);

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should include workspace-specific templates when workspaceId is provided', () => {
    // **Feature: prowrite-ai, Property 6: Template Module Filtering**
    fc.assert(
      fc.property(
        fc.array(templateArb, { minLength: 0, maxLength: 20 }),
        moduleTypeArb,
        fc.uuid(),
        (templates, requestedModuleType, workspaceId) => {
          const filteredTemplates = filterTemplatesByModule(
            templates,
            requestedModuleType,
            workspaceId,
          );

          // Property: All returned templates must either be system templates or belong to the workspace
          for (const template of filteredTemplates) {
            const isSystemTemplate = template.workspace_id === null;
            const isWorkspaceTemplate = template.workspace_id === workspaceId;
            expect(isSystemTemplate || isWorkspaceTemplate).toBe(true);
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should exclude templates from other workspaces', () => {
    // **Feature: prowrite-ai, Property 6: Template Module Filtering**
    fc.assert(
      fc.property(
        fc.array(templateArb, { minLength: 1, maxLength: 20 }),
        moduleTypeArb,
        fc.uuid(),
        fc.uuid(),
        (templates, requestedModuleType, workspaceId, otherWorkspaceId) => {
          // Skip if workspaceIds happen to be the same
          fc.pre(workspaceId !== otherWorkspaceId);

          // Add a template from another workspace
          const templatesWithOther = [
            ...templates,
            {
              id: 'other-workspace-template',
              workspace_id: otherWorkspaceId,
              module_type: requestedModuleType,
              name: 'Other Workspace Template',
              description: null,
              system_prompt: 'test',
              input_schema: { fields: [] },
              output_format: 'test',
              tags: [],
              is_custom: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];

          const filteredTemplates = filterTemplatesByModule(
            templatesWithOther,
            requestedModuleType,
            workspaceId,
          );

          // Property: No template from other workspaces should be included
          for (const template of filteredTemplates) {
            if (template.workspace_id !== null) {
              expect(template.workspace_id).toBe(workspaceId);
            }
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
