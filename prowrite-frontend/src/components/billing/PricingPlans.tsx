import { Check, Sparkles } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Plan details interface matching backend PlanDetails
 */
export interface PlanDetails {
  id: string
  name: string
  price: number
  priceDisplay: string
  generations: number | 'unlimited'
  features: string[]
  stripePriceId: string | null
}

interface PricingPlansProps {
  plans: PlanDetails[]
  currentPlanId?: string
  onSelectPlan: (planId: string) => void
  isLoading?: boolean
  loadingPlanId?: string
}

/**
 * PricingPlans component
 * Displays Free, Starter, Pro, Enterprise plans with features and pricing
 * Highlights the current plan
 * Requirements: 9.5
 */
export function PricingPlans({
  plans,
  currentPlanId,
  onSelectPlan,
  isLoading = false,
  loadingPlanId,
}: PricingPlansProps) {
  // Sort plans by price to ensure consistent order
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {sortedPlans.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id
        const isPro = plan.id === 'pro'
        const isEnterprise = plan.id === 'enterprise'
        const isFree = plan.id === 'free'
        const isLoadingThisPlan = loadingPlanId === plan.id

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative flex flex-col',
              isPro && 'border-primary shadow-lg',
              isCurrentPlan && 'ring-2 ring-primary'
            )}
          >
            {/* Popular badge for Pro plan */}
            {isPro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              </div>
            )}

            <CardHeader className={cn(isPro && 'pt-8')}>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>
                <span className="text-3xl font-bold text-foreground">
                  {plan.priceDisplay}
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="mb-4">
                <span className="text-sm text-muted-foreground">
                  {plan.generations === 'unlimited'
                    ? 'Unlimited generations'
                    : `${plan.generations} generations/month`}
                </span>
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {isCurrentPlan ? (
                <Button variant="outline" className="w-full" disabled>
                  Current Plan
                </Button>
              ) : isFree ? (
                <Button variant="outline" className="w-full" disabled>
                  Free Tier
                </Button>
              ) : isEnterprise ? (
                <Button
                  variant={isPro ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => window.open('mailto:sales@prowrite.ai', '_blank')}
                >
                  Contact Sales
                </Button>
              ) : (
                <Button
                  variant={isPro ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isLoading}
                >
                  {isLoadingThisPlan ? 'Processing...' : `Upgrade to ${plan.name}`}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default PricingPlans
