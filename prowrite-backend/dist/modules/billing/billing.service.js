"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const stripe_1 = require("stripe");
const database_1 = require("../../common/database");
let BillingService = class BillingService {
    configService;
    supabaseService;
    stripe;
    plans = new Map([
        [database_1.PlanType.FREE, {
                id: database_1.PlanType.FREE,
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
        [database_1.PlanType.STARTER, {
                id: database_1.PlanType.STARTER,
                name: 'Starter',
                price: 1500,
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
        [database_1.PlanType.PRO, {
                id: database_1.PlanType.PRO,
                name: 'Pro',
                price: 9900,
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
        [database_1.PlanType.ENTERPRISE, {
                id: database_1.PlanType.ENTERPRISE,
                name: 'Enterprise',
                price: 29900,
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
    constructor(configService, supabaseService) {
        this.configService = configService;
        this.supabaseService = supabaseService;
        const stripeSecretKey = this.configService.get('STRIPE_SECRET_KEY');
        this.stripe = new stripe_1.default(stripeSecretKey || '');
    }
    getPlans() {
        return Array.from(this.plans.values());
    }
    getPlanByType(planType) {
        return this.plans.get(planType);
    }
    getUsageLimitForPlan(planType) {
        const plan = this.plans.get(planType);
        if (!plan)
            return 100;
        if (plan.generations === 'unlimited') {
            return 999999;
        }
        return plan.generations;
    }
    async createCheckoutSession(workspaceId, planType, successUrl, cancelUrl) {
        const plan = this.plans.get(planType);
        if (!plan) {
            throw new common_1.BadRequestException(`Invalid plan type: ${planType}`);
        }
        if (planType === database_1.PlanType.FREE) {
            throw new common_1.BadRequestException('Cannot create checkout session for free plan');
        }
        if (!plan.stripePriceId) {
            throw new common_1.BadRequestException(`Stripe price not configured for plan: ${planType}`);
        }
        const { data: workspace, error: workspaceError } = await this.supabaseService.workspaces
            .select('*')
            .eq('id', workspaceId)
            .single();
        if (workspaceError || !workspace) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
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
    async handleWebhook(payload, signature) {
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error';
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${errorMessage}`);
        }
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
    }
    async handleCheckoutCompleted(session) {
        const workspaceId = session.metadata?.workspace_id;
        const planType = session.metadata?.plan_type;
        const stripeSubscriptionId = session.subscription;
        if (!workspaceId || !planType) {
            console.error('Missing metadata in checkout session');
            return;
        }
        await this.updateSubscription(workspaceId, {
            stripe_subscription_id: stripeSubscriptionId,
            plan_type: planType,
            status: database_1.SubscriptionStatus.ACTIVE,
        });
    }
    async handleSubscriptionUpdated(subscription) {
        const workspaceId = subscription.metadata?.workspace_id;
        if (!workspaceId) {
            console.error('Missing workspace_id in subscription metadata');
            return;
        }
        const status = this.mapStripeStatus(subscription.status);
        const planType = subscription.metadata?.plan_type;
        const periodStart = subscription.current_period_start;
        const periodEnd = subscription.current_period_end;
        await this.updateSubscription(workspaceId, {
            status,
            plan_type: planType,
            current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        });
    }
    async handleSubscriptionDeleted(subscription) {
        const workspaceId = subscription.metadata?.workspace_id;
        if (!workspaceId) {
            console.error('Missing workspace_id in subscription metadata');
            return;
        }
        const periodEnd = subscription.current_period_end;
        await this.updateSubscription(workspaceId, {
            status: database_1.SubscriptionStatus.CANCELED,
            current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        });
    }
    async handlePaymentFailed(invoice) {
        const invoiceData = invoice;
        const subscriptionId = typeof invoiceData.subscription === 'string'
            ? invoiceData.subscription
            : invoiceData.subscription?.id;
        if (!subscriptionId)
            return;
        const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
        const workspaceId = subscription.metadata?.workspace_id;
        if (!workspaceId)
            return;
        await this.updateSubscription(workspaceId, {
            status: database_1.SubscriptionStatus.PAST_DUE,
        });
    }
    async updateSubscription(workspaceId, data) {
        const { data: existing, error: findError } = await this.supabaseService.subscriptions
            .select('*')
            .eq('workspace_id', workspaceId)
            .single();
        if (findError || !existing) {
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
            if (data.plan_type) {
                await this.updateWorkspaceUsageLimit(workspaceId, data.plan_type);
            }
            return created;
        }
        const { data: updated, error: updateError } = await this.supabaseService.subscriptions
            .update(data)
            .eq('workspace_id', workspaceId)
            .select()
            .single();
        if (updateError) {
            throw new Error(`Failed to update subscription: ${updateError.message}`);
        }
        if (data.plan_type) {
            await this.updateWorkspaceUsageLimit(workspaceId, data.plan_type);
        }
        return updated;
    }
    async updateWorkspaceUsageLimit(workspaceId, planType) {
        const usageLimit = this.getUsageLimitForPlan(planType);
        await this.supabaseService.workspaces
            .update({ usage_limit: usageLimit })
            .eq('id', workspaceId);
    }
    async getSubscriptionInfo(workspaceId) {
        const { data: subscription, error: subError } = await this.supabaseService.subscriptions
            .select('*')
            .eq('workspace_id', workspaceId)
            .single();
        const { data: workspace, error: wsError } = await this.supabaseService.workspaces
            .select('usage_count, usage_limit')
            .eq('id', workspaceId)
            .single();
        if (subError || !subscription) {
            return {
                id: '',
                plan_type: database_1.PlanType.FREE,
                status: database_1.SubscriptionStatus.ACTIVE,
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
    async cancelSubscription(workspaceId) {
        const { data: subscription, error } = await this.supabaseService.subscriptions
            .select('stripe_subscription_id')
            .eq('workspace_id', workspaceId)
            .single();
        if (error || !subscription?.stripe_subscription_id) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        await this.stripe.subscriptions.update(subscription.stripe_subscription_id, {
            cancel_at_period_end: true,
        });
        await this.updateSubscription(workspaceId, {
            status: database_1.SubscriptionStatus.CANCELED,
        });
    }
    mapStripeStatus(stripeStatus) {
        switch (stripeStatus) {
            case 'active':
            case 'trialing':
                return database_1.SubscriptionStatus.ACTIVE;
            case 'canceled':
                return database_1.SubscriptionStatus.CANCELED;
            case 'past_due':
            case 'unpaid':
                return database_1.SubscriptionStatus.PAST_DUE;
            default:
                return database_1.SubscriptionStatus.ACTIVE;
        }
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        database_1.SupabaseService])
], BillingService);
//# sourceMappingURL=billing.service.js.map