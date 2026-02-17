import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

export function PricingPlans({
  plans,
  currentPlanId,
  onSelectPlan,
  isLoading = false,
  loadingPlanId,
}: PricingPlansProps) {
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {sortedPlans.map((plan) => {
        const isCurrentPlan = currentPlanId === plan.id
        const isPro = plan.id === 'pro'
        const isEnterprise = plan.id === 'enterprise'
        const isFree = plan.id === 'free'
        const isLoadingThisPlan = loadingPlanId === plan.id

        return (
          <div
            key={plan.id}
            className={cn(
              'relative flex flex-col rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 transition-all',
              isPro && 'border-violet-500/50 bg-violet-500/5 shadow-lg shadow-violet-500/10',
              isCurrentPlan && 'ring-2 ring-primary'
            )}
          >
            {/* Popular badge */}
            {isPro && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg shadow-violet-500/25">
                  <Sparkles className="h-3 w-3" />
                  Most Popular
                </span>
              </div>
            )}

            <div className={cn('mb-4', isPro && 'pt-2')}>
              <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-foreground">{plan.priceDisplay}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {plan.generations === 'unlimited'
                  ? 'Unlimited generations'
                  : `${plan.generations} generations/month`}
              </p>
            </div>

            <ul className="space-y-3 flex-1 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="h-3 w-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

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
                variant="outline"
                className="w-full"
                onClick={() => window.open('mailto:sales@prowrite.ai', '_blank')}
              >
                Contact Sales
              </Button>
            ) : (
              <Button
                className={cn(
                  'w-full',
                  isPro && 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25'
                )}
                variant={isPro ? 'default' : 'outline'}
                onClick={() => onSelectPlan(plan.id)}
                disabled={isLoading}
              >
                {isLoadingThisPlan ? 'Processing...' : `Upgrade to ${plan.name}`}
              </Button>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default PricingPlans
