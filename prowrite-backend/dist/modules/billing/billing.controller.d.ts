import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto, PlanDetails, CheckoutSessionResponse, SubscriptionInfo } from './dto';
interface AuthenticatedRequest extends Request {
    user: {
        workspace_id: string;
        email: string;
    };
}
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    getPlans(): PlanDetails[];
    getSubscription(req: AuthenticatedRequest): Promise<SubscriptionInfo>;
    createCheckoutSession(body: CreateCheckoutSessionDto, req: AuthenticatedRequest): Promise<CheckoutSessionResponse>;
    cancelSubscription(req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    handleWebhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
export {};
