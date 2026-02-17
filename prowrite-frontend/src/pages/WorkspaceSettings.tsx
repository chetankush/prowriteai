import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Zap, Palette, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api'

interface BrandVoiceGuide {
  tone: string
  style: string
  terminology: string[]
  avoid: string[]
}

interface Workspace {
  id: string
  user_id: string
  name: string
  description: string | null
  brand_voice_guide: BrandVoiceGuide | null
  usage_limit: number
  usage_count: number
  created_at: string
  updated_at: string
}

interface UsageStats {
  usage_count: number
  usage_limit: number
  remaining: number
  percentage_used: number
}

function UsageDashboard({ stats }: { stats: UsageStats | undefined }) {
  if (!stats) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading usage data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
            <Zap className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Usage Statistics</h2>
            <p className="text-sm text-muted-foreground">Your chat message usage this billing period</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Messages Used</span>
          <span className="font-medium text-foreground">{stats.usage_count} / {stats.usage_limit}</span>
        </div>
        
        <div className="w-full bg-secondary/50 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(stats.percentage_used, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Remaining</span>
          <span className="font-medium text-emerald-400">{stats.remaining} messages</span>
        </div>
        
        {stats.percentage_used >= 80 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-400">
              You've used {stats.percentage_used}% of your limit. Consider upgrading your plan.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function BrandVoiceEditor({
  brandVoice,
  onChange,
  isLoading,
}: {
  brandVoice: BrandVoiceGuide | null
  onChange: (guide: BrandVoiceGuide) => void
  isLoading: boolean
}) {
  const [tone, setTone] = useState(brandVoice?.tone || '')
  const [style, setStyle] = useState(brandVoice?.style || '')
  const [terminology, setTerminology] = useState(brandVoice?.terminology?.join(', ') || '')
  const [avoid, setAvoid] = useState(brandVoice?.avoid?.join(', ') || '')

  useEffect(() => {
    if (brandVoice) {
      setTone(brandVoice.tone || '')
      setStyle(brandVoice.style || '')
      setTerminology(brandVoice.terminology?.join(', ') || '')
      setAvoid(brandVoice.avoid?.join(', ') || '')
    }
  }, [brandVoice])

  const handleSave = () => {
    const guide: BrandVoiceGuide = {
      tone,
      style,
      terminology: terminology.split(',').map(t => t.trim()).filter(Boolean),
      avoid: avoid.split(',').map(a => a.trim()).filter(Boolean),
    }
    onChange(guide)
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500/20 to-rose-600/20 flex items-center justify-center">
            <Palette className="h-5 w-5 text-pink-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Brand Voice Guide</h2>
            <p className="text-sm text-muted-foreground">Define your brand's tone and style for consistent AI-generated content</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">
        <div className="space-y-2">
          <Label htmlFor="tone" className="text-sm font-medium">Tone</Label>
          <Input
            id="tone"
            placeholder="e.g., professional, friendly, casual"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="h-11 bg-secondary/30 border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            The overall feeling of your content (professional, casual, friendly, etc.)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style" className="text-sm font-medium">Style</Label>
          <Input
            id="style"
            placeholder="e.g., concise, detailed, conversational"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="h-11 bg-secondary/30 border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            How your content is structured (concise, detailed, conversational, etc.)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="terminology" className="text-sm font-medium">Preferred Terminology</Label>
          <Textarea
            id="terminology"
            placeholder="e.g., customers, clients, users (comma-separated)"
            value={terminology}
            onChange={(e) => setTerminology(e.target.value)}
            rows={3}
            className="bg-secondary/30 border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            Industry-specific terms or preferred words (comma-separated)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avoid" className="text-sm font-medium">Words to Avoid</Label>
          <Textarea
            id="avoid"
            placeholder="e.g., cheap, basic, simple (comma-separated)"
            value={avoid}
            onChange={(e) => setAvoid(e.target.value)}
            rows={3}
            className="bg-secondary/30 border-border/50"
          />
          <p className="text-xs text-muted-foreground">
            Words or phrases to avoid in generated content (comma-separated)
          </p>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
        >
          {isLoading ? 'Saving...' : 'Save Brand Voice'}
        </Button>
      </div>
    </div>
  )
}

export function WorkspaceSettingsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data: workspace, isLoading: workspaceLoading } = useQuery<Workspace>({
    queryKey: ['workspace'],
    queryFn: async () => {
      const response = await api.get('/workspace')
      return response.data
    },
  })

  const { data: usageStats } = useQuery<UsageStats>({
    queryKey: ['workspace-usage'],
    queryFn: async () => {
      const response = await api.get('/workspace/usage')
      return response.data
    },
  })

  const updateWorkspace = useMutation({
    mutationFn: async (data: { name?: string; description?: string; brand_voice_guide?: BrandVoiceGuide }) => {
      const response = await api.put('/workspace', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace'] })
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setSaveMessage(null), 3000)
    },
    onError: () => {
      setSaveMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
      setTimeout(() => setSaveMessage(null), 3000)
    },
  })

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '')
      setDescription(workspace.description || '')
    }
  }, [workspace])

  const handleSaveDetails = () => {
    updateWorkspace.mutate({ name, description })
  }

  const handleSaveBrandVoice = (guide: BrandVoiceGuide) => {
    updateWorkspace.mutate({ brand_voice_guide: guide })
  }

  if (workspaceLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Workspace Settings</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Workspace Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your workspace configuration and brand voice</p>
          </div>

          {saveMessage && (
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              saveMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              {saveMessage.type === 'success' ? (
                <CheckCircle className="h-5 w-5 shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Usage Dashboard */}
      <UsageDashboard stats={usageStats} />

      {/* Workspace Details */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
              <Settings className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Workspace Details</h2>
              <p className="text-sm text-muted-foreground">Basic information about your workspace</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="workspace-name" className="text-sm font-medium">Workspace Name</Label>
            <Input
              id="workspace-name"
              placeholder="My Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 bg-secondary/30 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="workspace-description"
              placeholder="A brief description of your workspace"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-secondary/30 border-border/50"
            />
          </div>

          <Button 
            onClick={handleSaveDetails} 
            disabled={updateWorkspace.isPending}
            className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
          >
            {updateWorkspace.isPending ? 'Saving...' : 'Save Details'}
          </Button>
        </div>
      </div>

      {/* Brand Voice Editor */}
      <BrandVoiceEditor
        brandVoice={workspace?.brand_voice_guide || null}
        onChange={handleSaveBrandVoice}
        isLoading={updateWorkspace.isPending}
      />
        </div>
      </div>
    </div>
  )
}

export default WorkspaceSettingsPage
