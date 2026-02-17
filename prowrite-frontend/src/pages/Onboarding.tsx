import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  Users,
  Mail,
  Globe,
  Video,
  UserCheck,
  Code,
  Languages,
  AlertTriangle,
  FileText,
  CheckCircle,
  Rocket,
  Briefcase,
  User,
} from 'lucide-react'

const ONBOARDING_COMPLETE_KEY = 'prowrite_onboarding_complete'
const ONBOARDING_USE_CASES_KEY = 'prowrite_onboarding_use_cases'

export function markOnboardingComplete() {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
}

export function isOnboardingComplete(): boolean {
  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === 'true'
}

export function saveOnboardingUseCases(useCases: string[]) {
  localStorage.setItem(ONBOARDING_USE_CASES_KEY, JSON.stringify(useCases))
}

export function getOnboardingUseCases(): string[] {
  try {
    const stored = localStorage.getItem(ONBOARDING_USE_CASES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('[Onboarding] Failed to parse use cases from localStorage:', err)
    return []
  }
}

interface OnboardingData {
  workspaceName: string
  role: string
  teamSize: string
  useCases: string[]
}

const ROLES = [
  { id: 'founder', label: 'Founder / CEO', icon: Rocket },
  { id: 'marketing', label: 'Marketing', icon: Globe },
  { id: 'sales', label: 'Sales', icon: Mail },
  { id: 'hr', label: 'HR / People Ops', icon: UserCheck },
  { id: 'engineering', label: 'Engineering', icon: Code },
  { id: 'content', label: 'Content / Writing', icon: FileText },
  { id: 'operations', label: 'Operations', icon: Briefcase },
  { id: 'other', label: 'Other', icon: User },
]

const TEAM_SIZES = [
  { id: 'solo', label: 'Just me' },
  { id: '2-5', label: '2–5 people' },
  { id: '6-20', label: '6–20 people' },
  { id: '21-50', label: '21–50 people' },
  { id: '51-200', label: '51–200 people' },
  { id: '200+', label: '200+ people' },
]

const USE_CASES = [
  { id: 'cold_email', label: 'Cold Emails', description: 'Outreach & sales sequences', icon: Mail, color: 'from-blue-500 to-cyan-500' },
  { id: 'website_copy', label: 'Website Copy', description: 'Landing pages & product copy', icon: Globe, color: 'from-purple-500 to-violet-500' },
  { id: 'youtube_scripts', label: 'YouTube Scripts', description: 'Video scripts & hooks', icon: Video, color: 'from-red-500 to-pink-500' },
  { id: 'hr_docs', label: 'HR Documents', description: 'Job descriptions, offer letters', icon: UserCheck, color: 'from-green-500 to-emerald-500' },
  { id: 'software_docs', label: 'Software Docs', description: 'Technical documentation', icon: Code, color: 'from-orange-500 to-amber-500' },
  { id: 'incident', label: 'Incident Reports', description: 'Incident documentation', icon: AlertTriangle, color: 'from-yellow-500 to-orange-500' },
  { id: 'translation', label: 'Translation', description: 'Content translation', icon: Languages, color: 'from-teal-500 to-cyan-500' },
  { id: 'bulk', label: 'Bulk Personalization', description: 'CSV mail merge', icon: FileText, color: 'from-pink-500 to-rose-500' },
]

const TOTAL_STEPS = 4

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    workspaceName: '',
    role: '',
    teamSize: '',
    useCases: [],
  })

  const toggleUseCase = (id: string) => {
    setData((prev) => ({
      ...prev,
      useCases: prev.useCases.includes(id)
        ? prev.useCases.filter((c) => c !== id)
        : [...prev.useCases, id],
    }))
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.workspaceName.trim().length > 0
      case 2:
        return data.role !== '' && data.teamSize !== ''
      case 3:
        return data.useCases.length > 0
      default:
        return true
    }
  }

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
      return
    }
    await handleComplete()
  }

  const handleComplete = async () => {
    setSaving(true)
    try {
      await api.put('/workspace', {
        name: data.workspaceName,
        description: `${data.role} team, ${data.teamSize} members. Primary use cases: ${data.useCases.join(', ')}`,
      })
    } catch (err) {
      console.error('[Onboarding] workspace update failed (non-blocking):', err)
    } finally {
      saveOnboardingUseCases(data.useCases)
      markOnboardingComplete()
      setSaving(false)
      navigate('/dashboard')
    }
  }

  const handleSkip = () => {
    markOnboardingComplete()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-[420px] bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-10 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">ProWrite AI</span>
          </div>

          {/* Step indicators */}
          <div className="space-y-5">
            {[
              { num: 1, title: 'Your Workspace', subtitle: 'Name your team space' },
              { num: 2, title: 'About You', subtitle: 'Role & team size' },
              { num: 3, title: 'Use Cases', subtitle: 'What will you create?' },
              { num: 4, title: 'All Set!', subtitle: 'Start creating content' },
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-4">
                <div
                  className={cn(
                    'h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                    step > s.num
                      ? 'bg-white text-violet-600'
                      : step === s.num
                        ? 'bg-white/20 text-white ring-2 ring-white/60'
                        : 'bg-white/10 text-white/40'
                  )}
                >
                  {step > s.num ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    s.num
                  )}
                </div>
                <div>
                  <p
                    className={cn(
                      'text-sm font-medium transition-colors',
                      step >= s.num ? 'text-white' : 'text-white/40'
                    )}
                  >
                    {s.title}
                  </p>
                  <p
                    className={cn(
                      'text-xs transition-colors',
                      step >= s.num ? 'text-white/70' : 'text-white/25'
                    )}
                  >
                    {s.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/50 text-sm">
          © {new Date().getFullYear()} ProWrite AI
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-lg">
          {/* Mobile progress */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-3 mb-4 justify-center">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-foreground">ProWrite AI</span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-all duration-300',
                    i < step ? 'bg-violet-500' : 'bg-secondary/50'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Step {step} of {TOTAL_STEPS}
            </p>
          </div>

          {/* ── Step 1: Workspace Name ── */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Welcome to ProWrite AI!</h1>
                <p className="text-muted-foreground mt-2">
                  Let's set up your workspace in under a minute.
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="workspace-name" className="text-sm font-medium">
                  What should we call your workspace?
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="workspace-name"
                    placeholder="e.g. Acme Corp, Marketing Team, My Startup"
                    className="pl-10 h-12 text-base bg-secondary/30 border-border/50 focus:border-primary"
                    value={data.workspaceName}
                    onChange={(e) => setData({ ...data, workspaceName: e.target.value })}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is your shared team space where all content is organized.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Role & Team Size ── */}
          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Tell us about you</h1>
                <p className="text-muted-foreground mt-2">
                  We'll personalize your experience based on your role.
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">What's your role?</Label>
                <div className="grid grid-cols-2 gap-2">
                  {ROLES.map((role) => {
                    const Icon = role.icon
                    const isSelected = data.role === role.id
                    return (
                      <button
                        key={role.id}
                        onClick={() => setData({ ...data, role: role.id })}
                        className={cn(
                          'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                          isSelected
                            ? 'border-violet-500 bg-violet-500/10 text-foreground shadow-sm shadow-violet-500/10'
                            : 'border-border/50 bg-secondary/20 text-muted-foreground hover:border-border hover:bg-secondary/40'
                        )}
                      >
                        <Icon className={cn('h-4 w-4 shrink-0', isSelected ? 'text-violet-400' : 'text-muted-foreground')} />
                        <span className="text-sm font-medium">{role.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">How large is your team?</Label>
                <div className="grid grid-cols-3 gap-2">
                  {TEAM_SIZES.map((size) => {
                    const isSelected = data.teamSize === size.id
                    return (
                      <button
                        key={size.id}
                        onClick={() => setData({ ...data, teamSize: size.id })}
                        className={cn(
                          'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all text-center',
                          isSelected
                            ? 'border-violet-500 bg-violet-500/10 text-foreground shadow-sm shadow-violet-500/10'
                            : 'border-border/50 bg-secondary/20 text-muted-foreground hover:border-border hover:bg-secondary/40'
                        )}
                      >
                        {size.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Use Cases ── */}
          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <h1 className="text-3xl font-bold text-foreground">What will you create?</h1>
                <p className="text-muted-foreground mt-2">
                  Select all the content types you're interested in. You can always explore more later.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {USE_CASES.map((useCase) => {
                  const Icon = useCase.icon
                  const isSelected = data.useCases.includes(useCase.id)
                  return (
                    <button
                      key={useCase.id}
                      onClick={() => toggleUseCase(useCase.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
                        isSelected
                          ? 'border-violet-500 bg-violet-500/10 shadow-sm shadow-violet-500/10'
                          : 'border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40'
                      )}
                    >
                      <div
                        className={cn(
                          'h-10 w-10 rounded-lg bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg',
                          useCase.color,
                          isSelected ? 'opacity-100' : 'opacity-60'
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', isSelected ? 'text-foreground' : 'text-muted-foreground')}>
                          {useCase.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{useCase.description}</p>
                      </div>
                      <div
                        className={cn(
                          'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                          isSelected
                            ? 'border-violet-500 bg-violet-500'
                            : 'border-border/50'
                        )}
                      >
                        {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>

              {data.useCases.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {data.useCases.length} selected — we'll highlight these on your dashboard.
                </p>
              )}
            </div>
          )}

          {/* ── Step 4: All Set ── */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="mx-auto h-20 w-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <Rocket className="h-10 w-10 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-foreground">You're all set!</h1>
                <p className="text-muted-foreground mt-3 max-w-sm mx-auto">
                  Your workspace <strong className="text-foreground">{data.workspaceName}</strong> is ready.
                  Start generating professional content with AI.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
                {[
                  { icon: Sparkles, label: 'AI-Powered', desc: 'Google Gemini' },
                  { icon: Users, label: 'Team Ready', desc: 'Invite members' },
                  { icon: FileText, label: 'Templates', desc: 'Pre-built forms' },
                ].map((feat) => (
                  <div key={feat.label} className="rounded-xl border border-border/50 bg-secondary/20 p-4 text-center">
                    <feat.icon className="h-5 w-5 text-violet-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-foreground">{feat.label}</p>
                    <p className="text-xs text-muted-foreground">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-10">
            <div>
              {step > 1 && step < 4 ? (
                <Button
                  variant="ghost"
                  onClick={() => setStep(step - 1)}
                  className="gap-2 text-muted-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              ) : step < 4 ? (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              ) : null}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || saving}
              className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25 min-w-[140px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Setting up...
                </span>
              ) : step === 4 ? (
                <span className="flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
