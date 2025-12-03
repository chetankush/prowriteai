import * as fc from 'fast-check';
import { AuthService } from './auth.service';
import { Workspace, Subscription, PlanType, SubscriptionStatus } from '@common/entities';
import { SupabaseService } from '@common/database';
import { JwtService } from '@nestjs/jwt';
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * **Feature: prowrite-ai, Property 1: New User Workspace Creation**
 * **Validates: Requirements 1.4**
 * 
 * For any newly created user account, the system SHALL create exactly one workspace
 * with default settings and one free subscription associated with that workspace.
 */
describe('AuthService Property Tests', () => {
  // Track created entities for verification
  let createdWorkspaces: Workspace[];
  let createdSubscriptions: Subscription[];
  let authService: AuthService;

  beforeEach(() => {
    createdWorkspaces = [];
    createdSubscriptions = [];

    const mockWorkspacesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockImplementation((data: Partial<Workspace>) => {
        const workspace = {
          id: `workspace-${Date.now()}-${Math.random()}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Workspace;
        createdWorkspaces.push(workspace);
        return {
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: workspace, error: null }),
          }),
        };
      }),
    };

    const mockSubscriptionsQuery = {
      insert: jest.fn().mockImplementation((data: Partial<Subscription>) => {
        const subscription = {
          id: `subscription-${Date.now()}-${Math.random()}`,
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Subscription;
        createdSubscriptions.push(subscription);
        return Promise.resolve({ data: subscription, error: null });
      }),
    };

    const mockSupabaseService = {
      get workspaces() {
        return mockWorkspacesQuery as unknown as SupabaseService['workspaces'];
      },
      get subscriptions() {
        return mockSubscriptionsQuery as unknown as SupabaseService['subscriptions'];
      },
    } as unknown as SupabaseService;

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    // Create AuthService instance with mocked dependencies
    authService = new AuthService(
      mockJwtService as unknown as JwtService,
      mockSupabaseService,
    );
  });

  // Arbitrary for generating valid Supabase user data
  const supabaseUserArbitrary = fc.record({
    id: fc.uuid(),
    email: fc.emailAddress(),
  });

  describe('Property 1: New User Workspace Creation', () => {
    it('should create exactly one workspace with default settings for any new user', async () => {
      // **Feature: prowrite-ai, Property 1: New User Workspace Creation**
      await fc.assert(
        fc.asyncProperty(supabaseUserArbitrary, async (userData) => {
          // Reset tracking arrays
          createdWorkspaces = [];
          createdSubscriptions = [];

          // Call createWorkspaceForUser directly
          const workspace = await authService.createWorkspaceForUser({
            id: userData.id,
            email: userData.email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          });

          // Property: Exactly one workspace is created
          expect(createdWorkspaces.length).toBe(1);

          // Property: Workspace has correct user_id
          expect(createdWorkspaces[0].user_id).toBe(userData.id);

          // Property: Workspace has default settings
          expect(createdWorkspaces[0].usage_limit).toBe(100); // Free tier
          expect(createdWorkspaces[0].usage_count).toBe(0);
          expect(createdWorkspaces[0].brand_voice_guide).toBeNull();

          // Property: Exactly one subscription is created
          expect(createdSubscriptions.length).toBe(1);

          // Property: Subscription is associated with the workspace
          expect(createdSubscriptions[0].workspace_id).toBe(workspace.id);

          // Property: Subscription is free tier and active
          expect(createdSubscriptions[0].plan_type).toBe(PlanType.FREE);
          expect(createdSubscriptions[0].status).toBe(SubscriptionStatus.ACTIVE);

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});


/**
 * **Feature: prowrite-ai, Property 2: Invalid Credentials Error Safety**
 * **Validates: Requirements 1.5**
 * 
 * For any invalid credential submission (wrong email, wrong password, or both),
 * the error message returned SHALL NOT reveal which specific field was incorrect.
 */
describe('Property 2: Invalid Credentials Error Safety', () => {
  let authService: AuthService;
  let mockSupabaseClient: { auth: { getUser: jest.Mock } };

  beforeEach(() => {
    const mockSupabaseService = {
      get workspaces() {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        } as unknown as SupabaseService['workspaces'];
      },
      get subscriptions() {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        } as unknown as SupabaseService['subscriptions'];
      },
    } as unknown as SupabaseService;

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    // Mock Supabase client that returns errors
    mockSupabaseClient = {
      auth: {
        getUser: jest.fn(),
      },
    };

    // Create AuthService with injected mock Supabase client
    authService = new AuthService(
      mockJwtService as unknown as JwtService,
      mockSupabaseService,
      mockSupabaseClient as unknown as SupabaseClient,
    );
  });

  // Arbitrary for generating various error scenarios
  const errorScenarioArbitrary = fc.oneof(
    // Wrong email scenario
    fc.constant({ code: 'invalid_email', message: 'Email not found' }),
    // Wrong password scenario
    fc.constant({ code: 'invalid_password', message: 'Invalid password' }),
    // Both wrong scenario
    fc.constant({ code: 'invalid_credentials', message: 'Invalid email or password' }),
    // User not found
    fc.constant({ code: 'user_not_found', message: 'User does not exist' }),
    // Generic auth error
    fc.record({
      code: fc.string({ minLength: 1, maxLength: 50 }),
      message: fc.string({ minLength: 1, maxLength: 200 }),
    }),
  );

  it('should return generic error message for any authentication failure', async () => {
    // **Feature: prowrite-ai, Property 2: Invalid Credentials Error Safety**
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // Random token
        errorScenarioArbitrary,
        async (token, errorScenario) => {
          // Configure mock to return an error
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: errorScenario,
          });

          try {
            await authService.handleSupabaseUser(token);
            // Should not reach here
            return false;
          } catch (error: unknown) {
            const err = error as Error;
            // Property: Error message should be generic and not reveal specifics
            expect(err.message).toBe('Invalid credentials');
            
            // Property: Error message should NOT contain specific field information
            expect(err.message.toLowerCase()).not.toContain('email');
            expect(err.message.toLowerCase()).not.toContain('password');
            expect(err.message.toLowerCase()).not.toContain('not found');
            expect(err.message.toLowerCase()).not.toContain('does not exist');
            
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return generic error when user is null', async () => {
    // **Feature: prowrite-ai, Property 2: Invalid Credentials Error Safety**
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }), // Random token
        async (token) => {
          // Configure mock to return null user (no error but no user)
          mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null,
          });

          try {
            await authService.handleSupabaseUser(token);
            return false;
          } catch (error: unknown) {
            const err = error as Error;
            // Property: Error message should be generic
            expect(err.message).toBe('Invalid credentials');
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
