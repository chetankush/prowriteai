import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { ThemeToggleButton } from '@/components/ThemeToggle'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = forgotPasswordSchema.safeParse(data)
    if (!result.success) return

    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) {
        console.error('[ForgotPassword] Supabase error:', error.message, error)
        setErrorMessage('Unable to send reset email. Please try again.')
      } else {
        console.log('[ForgotPassword] Reset email sent successfully')
        setSuccessMessage(
          'If an account exists with that email, you will receive a password reset link shortly. Please check your inbox and spam folder.'
        )
      }
    } catch (err) {
      console.error('[ForgotPassword] unexpected error:', err)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">ProWrite AI</span>
          </div>
        </div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white mb-4">
            Reset your password
          </h1>
          <p className="text-lg text-white/80">
            No worries — we'll send you a link to reset your password.
          </p>
        </div>
        <div className="relative z-10 text-white/60 text-sm">
          © {new Date().getFullYear()} ProWrite AI. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Theme toggle */}
        <div className="absolute top-4 right-4">
          <ThemeToggleButton />
        </div>

        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">ProWrite AI</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Forgot your password?</h2>
            <p className="text-muted-foreground mt-2">
              Enter your email and we'll send you a reset link
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-4 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 h-11 bg-secondary/30 border-border/50 focus:border-primary"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email address',
                    },
                  })}
                  disabled={isSubmitting || !!successMessage}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
              disabled={isSubmitting || !!successMessage}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending reset link...
                </span>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
