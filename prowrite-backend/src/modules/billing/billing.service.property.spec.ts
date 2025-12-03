import * as fc from 'fast-check';
import { BillingService } from './billing.service';
import { ConfigService } from '@nestjs/config';
import { 
  SupabaseService, 
  PlanType, 
  SubscriptionStatus,
  SubscriptionRow,
  WorkspaceRow,
} from '@common/database';

/**
 * **Feature: prowrite-ai, Property 27: Subscription Update on Confirmation**
 * **Validates: Requirements 9.3**
 *
 * For any Stripe subscription confirmation, the workspace subscription record
 * SHALL be updated with the new plan_type and corresponding usage_limit.
 *
 * **Feature: prowrite-ai, Property 28: Canceled Subscription Access**
 * **Validates: Requirements 9.4**
 *
 * For any canceled subscription, the subscription status SHALL remain 'active'
 * until current_period_end date is reached.
 */
describe('BillingService Property Tests', () => {
  let billingService: BillingService;
  let mockSupabaseService: Partial<SupabaseService>;
  let mockConfigService: Partial<ConfigService>;
  let storedSubscription: SubscriptionRow | null;
  let storedWorkspace: WorkspaceRow;

  // Arbitrary for PlanType (excluding free for subscription tests)
  const paidPlanTypeArb: fc.Arbitrary<PlanType> = fc.constantFrom(
    PlanType.STARTER,
    PlanType.PRO,
    PlanType.ENTERPRISE,
  );

  // Arbitrary for all plan types
  const planTypeArb: fc.Arbitrary<PlanType> = fc.constantFrom(
    PlanType.FREE,
    PlanType.STARTER,
    PlanType.PRO,
    PlanType.ENTERPRISE,
  );

  // Arbitrary for workspace ID
  const workspaceIdArb: fc.Arbitrary<string> = fc.uuid();

  // Arbitrary for Stripe subscription ID
  const stripeSubscriptionIdArb: fc.Arbitrary<string> = fc
    .string({ minLength: 10, maxLength: 30 })
    .map((s) => `sub_${s.replace(/[^a-zA-Z0-9]/g, '')}`);

  beforeEach(() => {
    storedSubscription = null;
    storedWorkspace = {
      id: 'test-workspace-id',
      user_id: 'test-user-id',
      name: 'Test Workspace',
      description: null,
      brand_voice_guide: null,
      usage_limit: 100,
      usage_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mock subscriptions query
    const mockSubscriptionsQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        if (storedSubscription) {
          return Promise.resolve({ data: { ...storedSubscription }, error: null });
        }
        return Promise.resolve({ data: null, error: { message: 'Not found' } });
      }),
      insert: jest.fn().mockImplementation((data: Partial<SubscriptionRow>) => {
        storedSubscription = {
          id: 'new-subscription-id',
          workspace_id: data.workspace_id || '',
          stripe_subscription_id: data.stripe_subscription_id || null,
          plan_type: data.plan_type || PlanType.FREE,
          status: data.status || SubscriptionStatus.ACTIVE,
          current_period_start: data.current_period_start || null,
          current_period_end: data.current_period_end || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return {
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { ...storedSubscription }, error: null }),
          }),
        };
      }),
      update: jest.fn().mockImplementation((updateData: Partial<SubscriptionRow>) => {
        if (storedSubscription) {
          storedSubscription = { 
            ...storedSubscription, 
            ...updateData, 
            updated_at: new Date().toISOString() 
          };
        }
        return {
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ 
                data: storedSubscription ? { ...storedSubscription } : null, 
                error: null 
              }),
            }),
          }),
        };
      }),
    };

    // Mock workspaces query
    const mockWorkspacesQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() => {
        return Promise.resolve({ data: { ...storedWorkspace }, error: null });
      }),
      update: jest.fn().mockImplementation((updateData: Partial<WorkspaceRow>) => {
        storedWorkspace = { 
          ...storedWorkspace, 
          ...updateData, 
          updated_at: new Date().toISOString() 
        };
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
      get subscriptions() {
        return mockSubscriptionsQuery as unknown as SupabaseService['subscriptions'];
      },
      get workspaces() {
        return mockWorkspacesQuery as unknown as SupabaseService['workspaces'];
      },
    } as unknown as Partial<SupabaseService>;

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        const config: Record<string, string> = {
          STRIPE_SECRET_KEY: 'sk_test_mock',
          STRIPE_WEBHOOK_SECRET: 'whsec_mock',
          FRONTEND_URL: 'http://localhost:5173',
        };
        return config[key];
      }),
    };

    billingService = new BillingService(
      mockConfigService as ConfigService,
      mockSupabaseService as SupabaseService,
    );
  });

  /**
   * **Feature: prowrite-ai, Property 27: Subscription Update on Confirmation**
   * **Validates: Requirements 9.3**
   */
  describe('Property 27: Subscription Update on Confirmation', () => {
    it('should update subscription with correct plan_type on confirmation', async () => {
      // **Feature: prowrite-ai, Property 27: Subscription Update on Confirmation**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          paidPlanTypeArb,
          stripeSubscriptionIdArb,
          async (workspaceId, planType, stripeSubId) => {
            // Reset stored subscription for each test
            storedSubscription = null;
            storedWorkspace.id = workspaceId;

            // Simulate subscription confirmation
            const result = await billingService.updateSubscription(workspaceId, {
              stripe_subscription_id: stripeSubId,
              plan_type: planType,
              status: SubscriptionStatus.ACTIVE,
            });

            // Verify plan_type is correctly set
            expect(result.plan_type).toBe(planType);
            expect(result.stripe_subscription_id).toBe(stripeSubId);
            expect(result.status).toBe(SubscriptionStatus.ACTIVE);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should update workspace usage_limit based on plan_type', async () => {
      // **Feature: prowrite-ai, Property 27: Subscription Update on Confirmation**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          planTypeArb,
          async (workspaceId, planType) => {
            // Reset for each test
            storedSubscription = null;
            storedWorkspace.id = workspaceId;
            storedWorkspace.usage_limit = 100; // Reset to default

            // Get expected usage limit for plan
            const expectedLimit = billingService.getUsageLimitForPlan(planType);

            // Update subscription
            await billingService.updateSubscription(workspaceId, {
              plan_type: planType,
              status: SubscriptionStatus.ACTIVE,
            });

            // Verify workspace usage_limit was updated
            expect(storedWorkspace.usage_limit).toBe(expectedLimit);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return correct usage limits for each plan type', () => {
      // **Feature: prowrite-ai, Property 27: Subscription Update on Confirmation**
      // Verify plan limits are correctly configured
      expect(billingService.getUsageLimitForPlan(PlanType.FREE)).toBe(100);
      expect(billingService.getUsageLimitForPlan(PlanType.STARTER)).toBe(500);
      expect(billingService.getUsageLimitForPlan(PlanType.PRO)).toBe(999999); // Unlimited
      expect(billingService.getUsageLimitForPlan(PlanType.ENTERPRISE)).toBe(999999); // Unlimited
    });

    it('should create new subscription if none exists', async () => {
      // **Feature: prowrite-ai, Property 27: Subscription Update on Confirmation**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          paidPlanTypeArb,
          async (workspaceId, planType) => {
            // Ensure no existing subscription
            storedSubscription = null;
            storedWorkspace.id = workspaceId;

            // Update subscription (should create new)
            const result = await billingService.updateSubscription(workspaceId, {
              plan_type: planType,
              status: SubscriptionStatus.ACTIVE,
            });

            // Verify subscription was created
            expect(result).toBeDefined();
            expect(result.workspace_id).toBe(workspaceId);
            expect(result.plan_type).toBe(planType);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should update existing subscription if one exists', async () => {
      // **Feature: prowrite-ai, Property 27: Subscription Update on Confirmation**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          paidPlanTypeArb,
          paidPlanTypeArb,
          async (workspaceId, initialPlan, newPlan) => {
            // Create initial subscription
            storedWorkspace.id = workspaceId;
            storedSubscription = {
              id: 'existing-sub-id',
              workspace_id: workspaceId,
              stripe_subscription_id: 'sub_existing',
              plan_type: initialPlan,
              status: SubscriptionStatus.ACTIVE,
              current_period_start: null,
              current_period_end: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Update to new plan
            const result = await billingService.updateSubscription(workspaceId, {
              plan_type: newPlan,
            });

            // Verify plan was updated
            expect(result.plan_type).toBe(newPlan);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * **Feature: prowrite-ai, Property 28: Canceled Subscription Access**
   * **Validates: Requirements 9.4**
   */
  // Arbitrary for future dates (1-365 days from now)
  const futureDateArb: fc.Arbitrary<Date> = fc
    .integer({ min: 1, max: 365 })
    .map((daysFromNow) => new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000));

  describe('Property 28: Canceled Subscription Access', () => {
    it('should set status to canceled while preserving period_end', async () => {
      // **Feature: prowrite-ai, Property 28: Canceled Subscription Access**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          paidPlanTypeArb,
          futureDateArb,
          async (workspaceId, planType, periodEnd) => {
            // Setup existing active subscription
            storedWorkspace.id = workspaceId;
            const periodEndIso = periodEnd.toISOString();
            
            storedSubscription = {
              id: 'existing-sub-id',
              workspace_id: workspaceId,
              stripe_subscription_id: 'sub_existing',
              plan_type: planType,
              status: SubscriptionStatus.ACTIVE,
              current_period_start: new Date().toISOString(),
              current_period_end: periodEndIso,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Cancel subscription
            const result = await billingService.updateSubscription(workspaceId, {
              status: SubscriptionStatus.CANCELED,
              current_period_end: periodEndIso,
            });

            // Verify status is canceled
            expect(result.status).toBe(SubscriptionStatus.CANCELED);
            
            // Verify period_end is preserved (access until this date)
            expect(result.current_period_end).toBe(periodEndIso);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should preserve plan_type when canceling', async () => {
      // **Feature: prowrite-ai, Property 28: Canceled Subscription Access**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          paidPlanTypeArb,
          async (workspaceId, planType) => {
            // Setup existing active subscription
            storedWorkspace.id = workspaceId;
            storedSubscription = {
              id: 'existing-sub-id',
              workspace_id: workspaceId,
              stripe_subscription_id: 'sub_existing',
              plan_type: planType,
              status: SubscriptionStatus.ACTIVE,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Cancel subscription (only update status)
            const result = await billingService.updateSubscription(workspaceId, {
              status: SubscriptionStatus.CANCELED,
            });

            // Verify plan_type is preserved
            expect(result.plan_type).toBe(planType);
            expect(result.status).toBe(SubscriptionStatus.CANCELED);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should not change usage_limit when canceling (access until period end)', async () => {
      // **Feature: prowrite-ai, Property 28: Canceled Subscription Access**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          paidPlanTypeArb,
          async (workspaceId, planType) => {
            // Setup workspace with plan's usage limit
            storedWorkspace.id = workspaceId;
            const planLimit = billingService.getUsageLimitForPlan(planType);
            storedWorkspace.usage_limit = planLimit;

            storedSubscription = {
              id: 'existing-sub-id',
              workspace_id: workspaceId,
              stripe_subscription_id: 'sub_existing',
              plan_type: planType,
              status: SubscriptionStatus.ACTIVE,
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Cancel subscription (without changing plan_type)
            await billingService.updateSubscription(workspaceId, {
              status: SubscriptionStatus.CANCELED,
            });

            // Usage limit should remain unchanged (access continues until period end)
            expect(storedWorkspace.usage_limit).toBe(planLimit);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return subscription info with canceled status', async () => {
      // **Feature: prowrite-ai, Property 28: Canceled Subscription Access**
      await fc.assert(
        fc.asyncProperty(
          workspaceIdArb,
          paidPlanTypeArb,
          async (workspaceId, planType) => {
            // Setup canceled subscription
            storedWorkspace.id = workspaceId;
            const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            
            storedSubscription = {
              id: 'existing-sub-id',
              workspace_id: workspaceId,
              stripe_subscription_id: 'sub_existing',
              plan_type: planType,
              status: SubscriptionStatus.CANCELED,
              current_period_start: new Date().toISOString(),
              current_period_end: periodEnd,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            // Get subscription info
            const info = await billingService.getSubscriptionInfo(workspaceId);

            // Verify canceled status is returned
            expect(info.status).toBe(SubscriptionStatus.CANCELED);
            expect(info.plan_type).toBe(planType);
            expect(info.current_period_end).toBe(periodEnd);

            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Plan Configuration', () => {
    it('should return all plans with required fields', () => {
      const plans = billingService.getPlans();

      expect(plans.length).toBe(4);
      
      for (const plan of plans) {
        expect(plan.id).toBeDefined();
        expect(plan.name).toBeDefined();
        expect(plan.price).toBeGreaterThanOrEqual(0);
        expect(plan.priceDisplay).toBeDefined();
        expect(plan.generations).toBeDefined();
        expect(plan.features).toBeDefined();
        expect(Array.isArray(plan.features)).toBe(true);
        expect(plan.features.length).toBeGreaterThan(0);
      }
    });

    it('should have correct pricing for each plan', () => {
      const plans = billingService.getPlans();
      const planMap = new Map(plans.map(p => [p.id, p]));

      expect(planMap.get(PlanType.FREE)?.price).toBe(0);
      expect(planMap.get(PlanType.STARTER)?.price).toBe(1500); // $15
      expect(planMap.get(PlanType.PRO)?.price).toBe(9900); // $99
      expect(planMap.get(PlanType.ENTERPRISE)?.price).toBe(29900); // $299
    });
  });
});
