import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react'
import { ThemeToggleButton } from '@/components/ThemeToggle'

const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

export function SignupPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: SignupFormData) => {
    const result = signupSchema.safeParse(data)
    if (!result.success) {
      const firstError = result.error.issues[0]
      setErrorMessage(firstError.message)
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const authData = await signUp(data.email, data.password)
      console.log('[Signup] signUp response:', { user: !!authData.user, session: !!authData.session })

      if (authData.session) {
        navigate('/onboarding')
      } else if (authData.user) {
        setSuccessMessage('Account created! Please check your email to confirm your account.')
      } else {
        console.warn('[Signup] signUp returned no user and no session')
        setErrorMessage('Something went wrong. The account may already exist. Please try signing in instead.')
      }
    } catch (err) {
      console.error('[Signup] signUp failed:', err)
      const message = err instanceof Error ? err.message : 'Unable to create account. Please try again.'
      setErrorMessage(message)
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
            Start creating amazing content
          </h1>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of professionals using AI to write better, faster.
          </p>
          <div className="space-y-3">
            {['100 free messages per month', 'Cold email templates', 'AI-powered suggestions'].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-white/90">
                <CheckCircle className="h-5 w-5 text-emerald-300" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
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
            <h2 className="text-2xl font-semibold text-foreground">Create your account</h2>
            <p className="text-muted-foreground mt-2">Get started with ProWrite AI for free</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="p-4 text-sm text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="pl-10 h-11 bg-secondary/30 border-border/50 focus:border-primary"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  disabled={isSubmitting || !!successMessage}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10 h-11 bg-secondary/30 border-border/50 focus:border-primary"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  disabled={isSubmitting || !!successMessage}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
