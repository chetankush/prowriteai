import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react'
import { ThemeToggleButton } from '@/components/ThemeToggle'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginFormData) => {
    const result = loginSchema.safeParse(data)
    if (!result.success) return

    setErrorMessage(null)

    try {
      const authData = await login(data.email, data.password)
      console.log('[Login] login response:', { user: !!authData.user, session: !!authData.session })
      if (authData.session) {
        navigate('/dashboard')
      } else {
        console.warn('[Login] login returned no session')
        setErrorMessage('Login failed. Please try again.')
      }
    } catch (err) {
      console.error('[Login] login failed:', err)
      const message = err instanceof Error ? err.message : 'Invalid credentials'
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
            Create content that converts
          </h1>
          <p className="text-lg text-white/80">
            AI-powered writing assistant for cold emails, website copy, and more.
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
            <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errorMessage && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                {errorMessage}
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
                  disabled={isSubmitting}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-11 bg-secondary/30 border-border/50 focus:border-primary"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  disabled={isSubmitting}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign in
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
