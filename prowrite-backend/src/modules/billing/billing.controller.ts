import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  RawBodyRequest,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard, WorkspaceGuard } from '@common/guards';
import { BillingService } from './billing.service';
import { 
  CreateCheckoutSessionDto, 
  PlanDetails, 
  CheckoutSessionResponse,
  SubscriptionInfo,
} from './dto';

interface AuthenticatedRequest extends Request {
  user: {
    workspace_id: string;
    email: string;
  };
}

@Controller('api/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * GET /api/billing/plans
   * List all available subscription plans
   */
  @Get('plans')
  getPlans(): PlanDetails[] {
    return this.billingService.getPlans();
  }

  /**
   * GET /api/billing/subscription
   * Get current subscription info for the authenticated user
   */
  @Get('subscription')
  @UseGuards(AuthGuard, WorkspaceGuard)
  async getSubscription(
    @Req() req: AuthenticatedRequest,
  ): Promise<SubscriptionInfo> {
    return this.billingService.getSubscriptionInfo(req.user.workspace_id);
  }

  /**
   * POST /api/billing/subscribe
   * Create a Stripe checkout session for subscription
   */
  @Post('subscribe')
  @UseGuards(AuthGuard, WorkspaceGuard)
  async createCheckoutSession(
    @Body() body: CreateCheckoutSessionDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<CheckoutSessionResponse> {
    return this.billingService.createCheckoutSession(
      req.user.workspace_id,
      body.plan_type,
      body.success_url,
      body.cancel_url,
    );
  }

  /**
   * POST /api/billing/cancel
   * Cancel the current subscription (access remains until period end)
   */
  @Post('cancel')
  @UseGuards(AuthGuard, WorkspaceGuard)
  @HttpCode(HttpStatus.OK)
  async cancelSubscription(
    @Req() req: AuthenticatedRequest,
  ): Promise<{ message: string }> {
    await this.billingService.cancelSubscription(req.user.workspace_id);
    return { message: 'Subscription will be canceled at the end of the billing period' };
  }

  /**
   * POST /api/billing/webhook
   * Handle Stripe webhook events
   * Note: This endpoint should NOT use AuthGuard as it's called by Stripe
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;
    
    if (!rawBody) {
      throw new Error('Raw body not available');
    }

    await this.billingService.handleWebhook(rawBody, signature);
    return { received: true };
  }
}
