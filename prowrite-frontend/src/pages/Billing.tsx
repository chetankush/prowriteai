import { useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PricingPlans, type PlanDetails } from '@/components'
import api from '@/lib/api'

/**
 * Subscription info interface matching backend SubscriptionInfo
 */
interface SubscriptionInfo {
  id: string
  plan_type: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  usage_count: number
  usage_limit: number
}

/**
 * Checkout session response
 */
interface CheckoutSessionResponse {
  sessionId: string
  url: string
}

/**
 * Format date for display
 */
function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get status badge color
 */
function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'canceled':
      return 'bg-amber-100 text-amber-800'
    case 'past_due':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Get plan display name
 */
function getPlanDisplayName(planType: string): string {
  const names: Record<string, string> = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  }
  return names[planType] || planType
}

/**
 * BillingPage component
 * Displays current subscription status, billing period, and upgrade options
 * Requirements: 9.1, 9.2, 9.5
 */
export function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const successParam = searchParams.get('success')
  const canceledParam = searchParams.get('canceled')

  // Clear URL params after showing message
  useEffect(() => {
    if (successParam || canceledParam) {
      const timer = setTimeout(() => {
        setSearchParams({})
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successParam, canceledParam, setSearchParams])

  // Fetch available plans
  const { data: plans = [], isLoading: plansLoading } = useQuery<PlanDetails[]>({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const response = await api.get('/billing/plans')
      return response.data
    },
  })

  // Fetch current subscription
  const { data: subscription, isLoading: subscriptionLoading, refetch: refetchSubscription } = useQuery<SubscriptionInfo>({
    queryKey: ['subscription'],
    queryFn: async () => {
      const response = await api.get('/billing/subscription')
      return response.data
    },
  })

  // Create checkout session mutation
  const createCheckout = useMutation({
    mutationFn: async (planType: string): Promise<CheckoutSessionResponse> => {
      const response = await api.post('/billing/subscribe', { plan_type: planType })
      return response.data
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      }
    },
  })

  // Cancel subscription mutation
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
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing & Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription plan and billing information</p>
      </div>

      {/* Success/Cancel Messages */}
      {successParam === 'true' && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-800 border border-green-200 rounded-md">
          <CheckCircle className="h-5 w-5" />
          <span>Your subscription has been updated successfully!</span>
        </div>
      )}

      {canceledParam === 'true' && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span>Checkout was canceled. No changes were made to your subscription.</span>
        </div>
      )}

      {/* Current Subscription Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>Your active plan and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionLoading ? (
            <p className="text-muted-foreground">Loading subscription info...</p>
          ) : subscription ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-6">
                {/* Plan */}
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-lg font-semibold">{getPlanDisplayName(subscription.plan_type)}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>

                {/* Usage */}
                <div>
                  <p className="text-sm text-muted-foreground">Usage This Period</p>
                  <p className="text-lg font-semibold">
                    {subscription.usage_count} / {subscription.usage_limit === 999999 ? '∞' : subscription.usage_limit}
                  </p>
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

              {/* Cancel Button (only for paid plans) */}
              {subscription.plan_type !== 'free' && subscription.status === 'active' && (
                <div className="pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancelSubscription}
                    disabled={cancelSubscription.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        {isLoading ? (
          <p className="text-muted-foreground">Loading plans...</p>
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
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to create checkout session. Please try again.</span>
        </div>
      )}

      {cancelSubscription.isError && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-800 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5" />
          <span>Failed to cancel subscription. Please try again.</span>
        </div>
      )}
    </div>
  )
}

export default BillingPage
