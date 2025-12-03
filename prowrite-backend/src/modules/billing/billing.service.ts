import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { 
  SupabaseService, 
  PlanType, 
  SubscriptionStatus, 
  SubscriptionRow 
} from '@common/database';
import { 
  PlanDetails, 
  CheckoutSessionResponse, 
  SubscriptionInfo 
} from './dto';

@Injectable()
export class BillingService {
  private stripe: Stripe;

  // Plan configurations
  private readonly plans: Map<PlanType, PlanDetails> = new Map([
    [PlanType.FREE, {
      id: PlanType.FREE,
      name: 'Free',
      price: 0,
      priceDisplay: '$0/month',
      generations: 100,
      features: [
        '100 generations per month',
        'All content modules',
        'Basic templates',
        'Email support',
      ],
      stripePriceId: null,
    }],
    [PlanType.STARTER, {
      id: PlanType.STARTER,
      name: 'Starter',
      price: 1500, // $15.00 in cents
      priceDisplay: '$15/month',
      generations: 500,
      features: [
        '500 generations per month',
        'All content modules',
        'All templates',
        'Brand voice customization',
        'Priority email support',
      ],
      stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    }],
    [PlanType.PRO, {
      id: PlanType.PRO,
      name: 'Pro',
      price: 9900, // $99.00 in cents
      priceDisplay: '$99/month',
      generations: 'unlimited',
      features: [
        'Unlimited generations',
        'All content modules',
        'All templates + custom templates',
        'Advanced brand voice',
        'Bulk CSV generation',
        'Priority support',
        'API access',
      ],
      stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    }],
    [PlanType.ENTERPRISE, {
      id: PlanType.ENTERPRISE,
      name: 'Enterprise',
      price: 29900, // $299.00 in cents
      priceDisplay: '$299+/month',
      generations: 'unlimited',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom training',
      ],
      stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    }],
  ]);

  constructor(
    private readonly configService: ConfigService,
    private readonly supabaseService: SupabaseService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    
    this.stripe = new Stripe(stripeSecretKey || '');
  }

  /**
   * Get all available plans
   */
  getPlans(): PlanDetails[] {
    return Array.from(this.plans.values());
  }

  /**
   * Get plan details by type
   */
  getPlanByType(planType: PlanType): PlanDetails | undefined {
    return this.plans.get(planType);
  }

  /**
   * Get usage limit for a plan type
   */
  getUsageLimitForPlan(planType: PlanType): number {
    const plan = this.plans.get(planType);
    if (!plan) return 100; // Default to free tier
    
    if (plan.generations === 'unlimited') {
      return 999999; // Effectively unlimited
    }
    return plan.generations;
  }

  /**
   * Create a Stripe checkout session for subscription
   */
  async createCheckoutSession(
    workspaceId: string,
    planType: PlanType,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<CheckoutSessionResponse> {
    const plan = this.plans.get(planType);
    
    if (!plan) {
      throw new BadRequestException(`Invalid plan type: ${planType}`);
    }

    if (planType === PlanType.FREE) {
      throw new BadRequestException('Cannot create checkout session for free plan');
    }

    if (!plan.stripePriceId) {
      throw new BadRequestException(`Stripe price not configured for plan: ${planType}`);
    }

    // Get workspace to find user email
    const { data: workspace, error: workspaceError } = await this.supabaseService.workspaces
      .select('*')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${frontendUrl}/billing?success=true`,
      cancel_url: cancelUrl || `${frontendUrl}/billing?canceled=true`,
      metadata: {
        workspace_id: workspaceId,
        plan_type: planType,
      },
      subscription_data: {
        metadata: {
          workspace_id: workspaceId,
          plan_type: planType,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException(`Webhook signature verification failed: ${errorMessage}`);
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle successful checkout completion
   */
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const workspaceId = session.metadata?.workspace_id;
    const planType = session.metadata?.plan_type as PlanType;
    const stripeSubscriptionId = session.subscription as string;

    if (!workspaceId || !planType) {
      console.error('Missing metadata in checkout session');
      return;
    }

    await this.updateSubscription(workspaceId, {
      stripe_subscription_id: stripeSubscriptionId,
      plan_type: planType,
      status: SubscriptionStatus.ACTIVE,
    });
  }

  /**
   * Handle subscription updates
   */
  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const workspaceId = subscription.metadata?.workspace_id;
    
    if (!workspaceId) {
      console.error('Missing workspace_id in subscription metadata');
      return;
    }

    const status = this.mapStripeStatus(subscription.status);
    const planType = subscription.metadata?.plan_type as PlanType;

    // Access period dates from the subscription items
    const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
    const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

    await this.updateSubscription(workspaceId, {
      status,
      plan_type: planType,
      current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    });
  }

  /**
   * Handle subscription cancellation
   */
  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const workspaceId = subscription.metadata?.workspace_id;
    
    if (!workspaceId) {
      console.error('Missing workspace_id in subscription metadata');
      return;
    }

    // Access period end from the subscription
    const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

    // Keep subscription active until period end
    await this.updateSubscription(workspaceId, {
      status: SubscriptionStatus.CANCELED,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    });
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // Access subscription from invoice
    const invoiceData = invoice as unknown as { subscription?: string | { id: string } };
    const subscriptionId = typeof invoiceData.subscription === 'string' 
      ? invoiceData.subscription 
      : invoiceData.subscription?.id;
    
    if (!subscriptionId) return;

    // Get subscription to find workspace
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
    const workspaceId = subscription.metadata?.workspace_id;

    if (!workspaceId) return;

    await this.updateSubscription(workspaceId, {
      status: SubscriptionStatus.PAST_DUE,
    });
  }

  /**
   * Update subscription in database
   */
  async updateSubscription(
    workspaceId: string,
    data: Partial<SubscriptionRow>,
  ): Promise<SubscriptionRow> {
    // Check if subscription exists
    const { data: existing, error: findError } = await this.supabaseService.subscriptions
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    if (findError || !existing) {
      // Create new subscription
      const { data: created, error: createError } = await this.supabaseService.subscriptions
        .insert({
          workspace_id: workspaceId,
          ...data,
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create subscription: ${createError.message}`);
      }

      // Update workspace usage limit
      if (data.plan_type) {
        await this.updateWorkspaceUsageLimit(workspaceId, data.plan_type);
      }

      return created as SubscriptionRow;
    }

    // Update existing subscription
    const { data: updated, error: updateError } = await this.supabaseService.subscriptions
      .update(data)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update subscription: ${updateError.message}`);
    }

    // Update workspace usage limit if plan changed
    if (data.plan_type) {
      await this.updateWorkspaceUsageLimit(workspaceId, data.plan_type);
    }

    return updated as SubscriptionRow;
  }

  /**
   * Update workspace usage limit based on plan
   */
  private async updateWorkspaceUsageLimit(workspaceId: string, planType: PlanType): Promise<void> {
    const usageLimit = this.getUsageLimitForPlan(planType);

    await this.supabaseService.workspaces
      .update({ usage_limit: usageLimit })
      .eq('id', workspaceId);
  }

  /**
   * Get subscription info for a workspace
   */
  async getSubscriptionInfo(workspaceId: string): Promise<SubscriptionInfo> {
    const { data: subscription, error: subError } = await this.supabaseService.subscriptions
      .select('*')
      .eq('workspace_id', workspaceId)
      .single();

    const { data: workspace, error: wsError } = await this.supabaseService.workspaces
      .select('usage_count, usage_limit')
      .eq('id', workspaceId)
      .single();

    if (subError || !subscription) {
      // Return default free subscription info
      return {
        id: '',
        plan_type: PlanType.FREE,
        status: SubscriptionStatus.ACTIVE,
        current_period_start: null,
        current_period_end: null,
        usage_count: workspace?.usage_count || 0,
        usage_limit: workspace?.usage_limit || 100,
      };
    }

    return {
      id: subscription.id,
      plan_type: subscription.plan_type,
      status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      usage_count: workspace?.usage_count || 0,
      usage_limit: workspace?.usage_limit || 100,
    };
  }

  /**
   * Cancel subscription (keeps access until period end)
   */
  async cancelSubscription(workspaceId: string): Promise<void> {
    const { data: subscription, error } = await this.supabaseService.subscriptions
      .select('stripe_subscription_id')
      .eq('workspace_id', workspaceId)
      .single();

    if (error || !subscription?.stripe_subscription_id) {
      throw new NotFoundException('No active subscription found');
    }

    // Cancel at period end in Stripe
    await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update local status
    await this.updateSubscription(workspaceId, {
      status: SubscriptionStatus.CANCELED,
    });
  }

  /**
   * Map Stripe subscription status to our status enum
   */
  private mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
      case 'trialing':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'past_due':
      case 'unpaid':
        return SubscriptionStatus.PAST_DUE;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }
}
