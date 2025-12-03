import * as fc from 'fast-check';
import { ForbiddenException } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { BrandVoiceGuide, Workspace } from '@common/entities';
import { SupabaseService } from '@common/database';
import { UpdateWorkspaceDto } from './dto';

/**
 * **Feature: prowrite-ai, Property 3: Workspace Update Round-Trip**
 * **Validates: Requirements 2.2**
 *
 * For any workspace update operation, reading the workspace immediately after
 * update SHALL return values equivalent to those that were set.
 *
 * **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
 * **Validates: Requirements 10.2**
 *
 * For any API request attempting to access a workspace_id different from the
 * authenticated user's workspace, the response SHALL be 403 Forbidden.
 */
describe('WorkspaceService Property Tests', () => {
  let workspaceService: WorkspaceService;
  let mockSupabaseService: Partial<SupabaseService>;
  let storedWorkspace: Workspace;

  // Arbitrary for BrandVoiceGuide
  const brandVoiceGuideArb: fc.Arbitrary<BrandVoiceGuide> = fc.record({
    tone: fc.string({ minLength: 1, maxLength: 100 }),
    style: fc.string({ minLength: 1, maxLength: 100 }),
    terminology: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 0,
      maxLength: 20,
    }),
    avoid: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
      minLength: 0,
      maxLength: 20,
    }),
  });

  // Arbitrary for UpdateWorkspaceDto
  const updateWorkspaceDtoArb: fc.Arbitrary<UpdateWorkspaceDto> = fc.record(
    {
      name: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
      description: fc.option(fc.string({ minLength: 0, maxLength: 500 }), { nil: undefined }),
      brand_voice_guide: fc.option(brandVoiceGuideArb, { nil: undefined }),
    },
    { requiredKeys: [] },
  );

  beforeEach(() => {
    // Create a base workspace that will be "stored"
    storedWorkspace = {
      id: 'test-workspace-id',
      user_id: 'test-user-id',
      name: 'Original Name',
      description: 'Original Description',
      brand_voice_guide: null,
      usage_limit: 100,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mock Supabase service that simulates database behavior
    const mockWorkspacesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        return Promise.resolve({ data: { ...storedWorkspace }, error: null });
      }),
      update: jest.fn().mockImplementation((updateData: Partial<Workspace>) => {
        // Simulate database update
        storedWorkspace = { ...storedWorkspace, ...updateData, updated_at: new Date().toISOString() };
        return {
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { ...storedWorkspace }, error: null }),
            }),
          }),
        };
      }),
    };

    mockSupabaseService = {
      get workspaces() {
        return mockWorkspacesQuery as unknown as SupabaseService['workspaces'];
      },
    } as unknown as Partial<SupabaseService>;

    workspaceService = new WorkspaceService(mockSupabaseService as SupabaseService);
  });

  it('should return updated values after workspace update (round-trip)', async () => {
    // **Feature: prowrite-ai, Property 3: Workspace Update Round-Trip**
    await fc.assert(
      fc.asyncProperty(updateWorkspaceDtoArb, async (updateDto) => {
        const workspaceId = storedWorkspace.id;

        // Perform update
        const updatedWorkspace = await workspaceService.updateWorkspace(
          workspaceId,
          workspaceId,
          updateDto,
        );

        // Read workspace after update
        const readWorkspace = await workspaceService.getWorkspace(
          workspaceId,
          workspaceId,
        );

        // Verify updated values match what was set
        if (updateDto.name !== undefined && updateDto.name !== '') {
          expect(readWorkspace.name).toBe(updateDto.name);
          expect(updatedWorkspace.name).toBe(updateDto.name);
        }

        if (updateDto.description !== undefined) {
          expect(readWorkspace.description).toBe(updateDto.description || null);
          expect(updatedWorkspace.description).toBe(updateDto.description || null);
        }

        if (updateDto.brand_voice_guide !== undefined) {
          expect(readWorkspace.brand_voice_guide).toEqual(updateDto.brand_voice_guide);
          expect(updatedWorkspace.brand_voice_guide).toEqual(updateDto.brand_voice_guide);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve unchanged fields during partial update', async () => {
    // **Feature: prowrite-ai, Property 3: Workspace Update Round-Trip**
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }),
        async (newName) => {
          const workspaceId = storedWorkspace.id;
          const originalDescription = storedWorkspace.description;
          const originalBrandVoice = storedWorkspace.brand_voice_guide;

          // Update only the name
          const updateDto: UpdateWorkspaceDto = { name: newName };
          await workspaceService.updateWorkspace(workspaceId, workspaceId, updateDto);

          // Read workspace after update
          const readWorkspace = await workspaceService.getWorkspace(
            workspaceId,
            workspaceId,
          );

          // Name should be updated
          expect(readWorkspace.name).toBe(newName);

          // Other fields should be preserved
          expect(readWorkspace.description).toBe(originalDescription);
          expect(readWorkspace.brand_voice_guide).toEqual(originalBrandVoice);

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('should correctly update brand voice guide and retrieve it', async () => {
    // **Feature: prowrite-ai, Property 3: Workspace Update Round-Trip**
    await fc.assert(
      fc.asyncProperty(brandVoiceGuideArb, async (brandVoiceGuide) => {
        const workspaceId = storedWorkspace.id;

        // Update brand voice guide
        const updateDto: UpdateWorkspaceDto = {
          brand_voice_guide: brandVoiceGuide,
        };
        await workspaceService.updateWorkspace(workspaceId, workspaceId, updateDto);

        // Read workspace after update
        const readWorkspace = await workspaceService.getWorkspace(
          workspaceId,
          workspaceId,
        );

        // Brand voice guide should match exactly
        expect(readWorkspace.brand_voice_guide).toEqual(brandVoiceGuide);
        expect(readWorkspace.brand_voice_guide?.tone).toBe(brandVoiceGuide.tone);
        expect(readWorkspace.brand_voice_guide?.style).toBe(brandVoiceGuide.style);
        expect(readWorkspace.brand_voice_guide?.terminology).toEqual(brandVoiceGuide.terminology);
        expect(readWorkspace.brand_voice_guide?.avoid).toEqual(brandVoiceGuide.avoid);

        return true;
      }),
      { numRuns: 100 },
    );
  });

  /**
   * **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
   * **Validates: Requirements 10.2**
   */
  describe('Cross-Workspace Authorization', () => {
    it('should reject getWorkspace when requesting different workspace', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          async (targetWorkspaceId, requestingWorkspaceId) => {
            // Only test when IDs are different
            fc.pre(targetWorkspaceId !== requestingWorkspaceId);

            // Attempt to access a different workspace
            await expect(
              workspaceService.getWorkspace(targetWorkspaceId, requestingWorkspaceId),
            ).rejects.toThrow(ForbiddenException);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject updateWorkspace when updating different workspace', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          updateWorkspaceDtoArb,
          async (targetWorkspaceId, requestingWorkspaceId, updateDto) => {
            // Only test when IDs are different
            fc.pre(targetWorkspaceId !== requestingWorkspaceId);

            // Attempt to update a different workspace
            await expect(
              workspaceService.updateWorkspace(
                targetWorkspaceId,
                requestingWorkspaceId,
                updateDto,
              ),
            ).rejects.toThrow(ForbiddenException);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject getUsageStats when requesting different workspace', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.uuid(),
          async (targetWorkspaceId, requestingWorkspaceId) => {
            // Only test when IDs are different
            fc.pre(targetWorkspaceId !== requestingWorkspaceId);

            // Attempt to get usage stats for a different workspace
            await expect(
              workspaceService.getUsageStats(targetWorkspaceId, requestingWorkspaceId),
            ).rejects.toThrow(ForbiddenException);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow access when workspace IDs match', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      // This is the positive case - same workspace ID should be allowed
      const workspaceId = storedWorkspace.id;

      // Should not throw for matching workspace IDs
      const workspace = await workspaceService.getWorkspace(workspaceId, workspaceId);
      expect(workspace).toBeDefined();
      expect(workspace.id).toBe(workspaceId);

      const usageStats = await workspaceService.getUsageStats(workspaceId, workspaceId);
      expect(usageStats).toBeDefined();
      expect(usageStats.usage_count).toBeDefined();
    });
  });
});
