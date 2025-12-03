import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import api from '@/lib/api'

// Types matching backend DTOs
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

/**
 * UsageDashboard component
 * Displays current usage count and limit with progress bar
 * Requirements: 2.5
 */
function UsageDashboard({ stats }: { stats: UsageStats | undefined }) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Loading usage data...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>Your chat message usage this billing period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Messages Used</span>
          <span className="font-medium">{stats.usage_count} / {stats.usage_limit}</span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(stats.percentage_used, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Remaining</span>
          <span className="font-medium text-green-600">{stats.remaining} messages</span>
        </div>
        
        {stats.percentage_used >= 80 && (
          <p className="text-sm text-amber-600">
            You've used {stats.percentage_used}% of your limit. Consider upgrading your plan.
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * BrandVoiceEditor component
 * Form for editing tone, style, terminology, and avoid fields
 * Requirements: 2.3
 */
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
    <Card>
      <CardHeader>
        <CardTitle>Brand Voice Guide</CardTitle>
        <CardDescription>
          Define your brand's tone and style for consistent AI-generated content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tone">Tone</Label>
          <Input
            id="tone"
            placeholder="e.g., professional, friendly, casual"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            The overall feeling of your content (professional, casual, friendly, etc.)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Style</Label>
          <Input
            id="style"
            placeholder="e.g., concise, detailed, conversational"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            How your content is structured (concise, detailed, conversational, etc.)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="terminology">Preferred Terminology</Label>
          <Textarea
            id="terminology"
            placeholder="e.g., customers, clients, users (comma-separated)"
            value={terminology}
            onChange={(e) => setTerminology(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Industry-specific terms or preferred words (comma-separated)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avoid">Words to Avoid</Label>
          <Textarea
            id="avoid"
            placeholder="e.g., cheap, basic, simple (comma-separated)"
            value={avoid}
            onChange={(e) => setAvoid(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Words or phrases to avoid in generated content (comma-separated)
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Brand Voice'}
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * WorkspaceSettingsPage component
 * Main settings page displaying workspace details, brand voice editor, and usage stats
 * Requirements: 2.1, 2.2, 2.3, 2.5
 */
export function WorkspaceSettingsPage() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fetch workspace data
  const { data: workspace, isLoading: workspaceLoading } = useQuery<Workspace>({
    queryKey: ['workspace'],
    queryFn: async () => {
      const response = await api.get('/workspace')
      return response.data
    },
  })

  // Fetch usage stats
  const { data: usageStats } = useQuery<UsageStats>({
    queryKey: ['workspace-usage'],
    queryFn: async () => {
      const response = await api.get('/workspace/usage')
      return response.data
    },
  })

  // Update workspace mutation
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

  // Initialize form with workspace data
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspace Settings</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Workspace Settings</h1>
        <p className="text-muted-foreground">Manage your workspace configuration and brand voice</p>
      </div>

      {saveMessage && (
        <div
          className={`p-4 rounded-md ${
            saveMessage.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {saveMessage.text}
        </div>
      )}

      {/* Usage Dashboard */}
      <UsageDashboard stats={usageStats} />

      {/* Workspace Details */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>Basic information about your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name</Label>
            <Input
              id="workspace-name"
              placeholder="My Workspace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description</Label>
            <Textarea
              id="workspace-description"
              placeholder="A brief description of your workspace"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveDetails} disabled={updateWorkspace.isPending}>
            {updateWorkspace.isPending ? 'Saving...' : 'Save Details'}
          </Button>
        </CardFooter>
      </Card>

      {/* Brand Voice Editor */}
      <BrandVoiceEditor
        brandVoice={workspace?.brand_voice_guide || null}
        onChange={handleSaveBrandVoice}
        isLoading={updateWorkspace.isPending}
      />
    </div>
  )
}

export default WorkspaceSettingsPage
