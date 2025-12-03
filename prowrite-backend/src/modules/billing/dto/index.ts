import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { PlanType } from '@common/database';

export class CreateCheckoutSessionDto {
  @IsEnum(PlanType)
  @IsNotEmpty()
  plan_type!: PlanType;

  @IsString()
  @IsOptional()
  success_url?: string;

  @IsString()
  @IsOptional()
  cancel_url?: string;
}

export interface PlanDetails {
  id: PlanType;
  name: string;
  price: number; // in cents
  priceDisplay: string;
  generations: number | 'unlimited';
  features: string[];
  stripePriceId: string | null;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface SubscriptionInfo {
  id: string;
  plan_type: PlanType;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  usage_count: number;
  usage_limit: number;
}
