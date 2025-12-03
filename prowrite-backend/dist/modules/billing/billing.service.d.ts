import { ConfigService } from '@nestjs/config';
import { SupabaseService, PlanType, SubscriptionRow } from '@common/database';
import { PlanDetails, CheckoutSessionResponse, SubscriptionInfo } from './dto';
export declare class BillingService {
    private readonly configService;
    private readonly supabaseService;
    private stripe;
    private readonly plans;
    constructor(configService: ConfigService, supabaseService: SupabaseService);
    getPlans(): PlanDetails[];
    getPlanByType(planType: PlanType): PlanDetails | undefined;
    getUsageLimitForPlan(planType: PlanType): number;
    createCheckoutSession(workspaceId: string, planType: PlanType, successUrl?: string, cancelUrl?: string): Promise<CheckoutSessionResponse>;
    handleWebhook(payload: Buffer, signature: string): Promise<void>;
    private handleCheckoutCompleted;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handlePaymentFailed;
    updateSubscription(workspaceId: string, data: Partial<SubscriptionRow>): Promise<SubscriptionRow>;
    private updateWorkspaceUsageLimit;
    getSubscriptionInfo(workspaceId: string): Promise<SubscriptionInfo>;
    cancelSubscription(workspaceId: string): Promise<void>;
    private mapStripeStatus;
}
