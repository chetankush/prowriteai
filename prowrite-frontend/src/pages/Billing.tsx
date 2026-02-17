import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, Calendar, AlertCircle, CheckCircle, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PricingPlans, type PlanDetails } from '@/components'
import api from '@/lib/api'

interface SubscriptionInfo {
  id: string
  plan_type: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  usage_count: number
  usage_limit: number
}

interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    case 'canceled':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    case 'past_due':
      return 'bg-red-500/10 text-red-400 border-red-500/20'
    default:
      return 'bg-secondary text-muted-foreground border-border'
  }
}

function getPlanDisplayName(planType: string): string {
  const names: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }
  return names[planType] || planType
}

export function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const successParam = searchParams.get('success')
  const canceledParam = searchParams.get('canceled')

  useEffect(() => {
    if (successParam || canceledParam) {
      const timer = setTimeout(() => {
        setSearchParams({})
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successParam, canceledParam, setSearchParams])

  const { data: plans = [], isLoading: plansLoading } = useQuery<PlanDetails[]>({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const response = await api.get('/billing/plans')
      return response.data
    },
  })

  const { data: subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useQuery<SubscriptionInfo>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await api.get('/billing/subscription')
      return response.data
    },
  })

  const createCheckout = useMutation({
    mutationFn: async (planType: string): Promise<CheckoutSessionResponse> => {
      const response = await api.post('/billing/subscribe', { plan_type: planType })
      return response.data
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      const response = await api.post('/billing/cancel')
      return response.data
    },
    onSuccess: () => {
      refetchSubscription()
    },
  })

  const handleSelectPlan = (planId: string) => {
    createCheckout.mutate(planId)
  }

  const handleCancelSubscription = () => {
    if (window.confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      cancelSubscription.mutate()
    }
  }

  const isLoading = plansLoading || subscriptionLoading

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-5xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Billing & Subscription</h1>
            <p className="text-muted-foreground mt-1">Manage your plan and billing information</p>
          </div>

      {/* Success/Cancel Messages */}
      {successParam === 'true' && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span>Your subscription has been updated successfully!</span>
        </div>
      )}

      {canceledParam === 'true' && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Checkout was canceled. No changes were made to your subscription.</span>
        </div>
      )}

      {/* Current Subscription Card */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Current Subscription</h2>
              <p className="text-sm text-muted-foreground">Your active plan and billing details</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          {subscriptionLoading ? (
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-muted-foreground">Loading subscription info...</span>
            </div>
          ) : subscription ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Plan */}
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Plan</p>
                  <p className="text-xl font-semibold text-foreground">{getPlanDisplayName(subscription.plan_type)}</p>
                </div>

                {/* Status */}
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize border ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>

                {/* Usage */}
                <div className="p-4 rounded-lg bg-secondary/30">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Usage</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-semibold text-foreground">{subscription.usage_count}</span>
                    <span className="text-muted-foreground">/ {subscription.usage_limit === 999999 ? '∞' : subscription.usage_limit}</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${Math.min((subscription.usage_count / subscription.usage_limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Billing Period */}
              {subscription.current_period_end && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {subscription.status === 'canceled'
                      ? `Access until ${formatDate(subscription.current_period_end)}`
                      : `Next billing date: ${formatDate(subscription.current_period_end)}`}
                  </span>
                </div>
              )}

              {/* Cancel Button */}
              {subscription.plan_type !== 'free' && subscription.status === 'active' && (
                <div className="pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={cancelSubscription.isPending}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                  >
                    {cancelSubscription.isPending ? 'Canceling...' : 'Cancel Subscription'}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    You will retain access until the end of your current billing period.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">No subscription found</p>
          )}
        </div>
      </div>

      {/* Pricing Plans */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Available Plans</h2>
            <p className="text-sm text-muted-foreground">Choose the plan that fits your needs</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading plans...</span>
          </div>
        ) : (
          <PricingPlans
            plans={plans}
            currentPlanId={subscription?.plan_type}
            onSelectPlan={handleSelectPlan}
            isLoading={createCheckout.isPending}
            loadingPlanId={createCheckout.isPending ? (createCheckout.variables as string) : undefined}
          />
        )}
      </div>

      {/* Error Messages */}
      {createCheckout.isError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Failed to create checkout session. Please try again.</span>
        </div>
      )}

      {cancelSubscription.isError && (
        <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>Failed to cancel subscription. Please try again.</span>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

export default BillingPage
