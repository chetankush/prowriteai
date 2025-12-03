import * as fc from 'fast-check';
import { WorkspaceGuard } from './workspace.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { TokenPayload } from './auth.guard';

/**
 * **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
 * **Validates: Requirements 10.2**
 *
 * For any API request attempting to access a workspace_id different from the
 * authenticated user's workspace, the response SHALL be 403 Forbidden.
 */
describe('WorkspaceGuard Property Tests', () => {
  let workspaceGuard: WorkspaceGuard;

  beforeEach(() => {
    workspaceGuard = new WorkspaceGuard();
  });

  // Helper to create mock ExecutionContext
  const createMockContext = (
    user: TokenPayload | undefined,
    params?: Record<string, string>,
    body?: Record<string, unknown>,
    query?: Record<string, string>,
  ): ExecutionContext => {
    const mockRequest = {
      user,
      params: params || {},
      body: body || {},
      query: query || {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  describe('Property 30: Cross-Workspace Authorization', () => {
    it('should reject requests when workspace_id in params differs from user workspace', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // User's workspace_id
          fc.uuid(), // Requested workspace_id in params
          fc.emailAddress(),
          async (userWorkspaceId, requestedWorkspaceId, email) => {
            // Only test when IDs are different
            fc.pre(userWorkspaceId !== requestedWorkspaceId);

            const user: TokenPayload = {
              sub: fc.sample(fc.uuid(), 1)[0],
              email,
              workspace_id: userWorkspaceId,
            };

            const context = createMockContext(
              user,
              { workspace_id: requestedWorkspaceId },
            );

            await expect(workspaceGuard.canActivate(context)).rejects.toThrow(
              ForbiddenException,
            );

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject requests when workspace_id in body differs from user workspace', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // User's workspace_id
          fc.uuid(), // Requested workspace_id in body
          fc.emailAddress(),
          async (userWorkspaceId, requestedWorkspaceId, email) => {
            // Only test when IDs are different
            fc.pre(userWorkspaceId !== requestedWorkspaceId);

            const user: TokenPayload = {
              sub: fc.sample(fc.uuid(), 1)[0],
              email,
              workspace_id: userWorkspaceId,
            };

            const context = createMockContext(
              user,
              {},
              { workspace_id: requestedWorkspaceId },
            );

            await expect(workspaceGuard.canActivate(context)).rejects.toThrow(
              ForbiddenException,
            );

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject requests when workspace_id in query differs from user workspace', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // User's workspace_id
          fc.uuid(), // Requested workspace_id in query
          fc.emailAddress(),
          async (userWorkspaceId, requestedWorkspaceId, email) => {
            // Only test when IDs are different
            fc.pre(userWorkspaceId !== requestedWorkspaceId);

            const user: TokenPayload = {
              sub: fc.sample(fc.uuid(), 1)[0],
              email,
              workspace_id: userWorkspaceId,
            };

            const context = createMockContext(
              user,
              {},
              {},
              { workspace_id: requestedWorkspaceId },
            );

            await expect(workspaceGuard.canActivate(context)).rejects.toThrow(
              ForbiddenException,
            );

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow requests when workspace_id matches user workspace', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // Same workspace_id for both
          fc.emailAddress(),
          async (workspaceId, email) => {
            const user: TokenPayload = {
              sub: fc.sample(fc.uuid(), 1)[0],
              email,
              workspace_id: workspaceId,
            };

            // Test with workspace_id in params
            const contextParams = createMockContext(
              user,
              { workspace_id: workspaceId },
            );
            const resultParams = await workspaceGuard.canActivate(contextParams);
            expect(resultParams).toBe(true);

            // Test with workspace_id in body
            const contextBody = createMockContext(
              user,
              {},
              { workspace_id: workspaceId },
            );
            const resultBody = await workspaceGuard.canActivate(contextBody);
            expect(resultBody).toBe(true);

            // Test with workspace_id in query
            const contextQuery = createMockContext(
              user,
              {},
              {},
              { workspace_id: workspaceId },
            );
            const resultQuery = await workspaceGuard.canActivate(contextQuery);
            expect(resultQuery).toBe(true);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow requests when no workspace_id is specified', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      // When no workspace_id is in the request, the endpoint will use the user's own workspace
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.emailAddress(),
          async (workspaceId, email) => {
            const user: TokenPayload = {
              sub: fc.sample(fc.uuid(), 1)[0],
              email,
              workspace_id: workspaceId,
            };

            // No workspace_id in params, body, or query
            const context = createMockContext(user, {}, {}, {});
            const result = await workspaceGuard.canActivate(context);
            expect(result).toBe(true);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should reject requests when user is not authenticated', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (workspaceId) => {
          // No user attached (AuthGuard should have run first)
          const context = createMockContext(
            undefined,
            { workspace_id: workspaceId },
          );

          await expect(workspaceGuard.canActivate(context)).rejects.toThrow(
            ForbiddenException,
          );

          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should reject requests when user has no workspace_id', async () => {
      // **Feature: prowrite-ai, Property 30: Cross-Workspace Authorization**
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.emailAddress(),
          async (requestedWorkspaceId, email) => {
            // User with missing workspace_id
            const user = {
              sub: fc.sample(fc.uuid(), 1)[0],
              email,
              workspace_id: '', // Empty workspace_id
            } as TokenPayload;

            const context = createMockContext(
              user,
              { workspace_id: requestedWorkspaceId },
            );

            await expect(workspaceGuard.canActivate(context)).rejects.toThrow(
              ForbiddenException,
            );

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
