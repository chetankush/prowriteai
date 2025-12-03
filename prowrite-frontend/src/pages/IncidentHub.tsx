/**
 * Incident Communication Hub
 * Generate all incident communications from a single input
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  Copy,
  Check,
  Slack,
  Mail,
  Globe,
  Briefcase,
  FileText,
  Loader2,
  Zap,
} from 'lucide-react';

interface IncidentCommunication {
  type: string;
  title: string;
  content: string;
  audience: string;
  tone: string;
}

interface IncidentCommsResponse {
  incident: {
    title: string;
    severity: string;
    status: string;
  };
  communications: IncidentCommunication[];
  generatedAt: string;
}

const SEVERITY_OPTIONS = [
  { value: 'critical', label: '🔴 Critical - Service down', color: 'text-red-600' },
  { value: 'high', label: '🟠 High - Major degradation', color: 'text-orange-600' },
  { value: 'medium', label: '🟡 Medium - Partial impact', color: 'text-yellow-600' },
  { value: 'low', label: '🟢 Low - Minor issue', color: 'text-green-600' },
];

const STATUS_OPTIONS = [
  { value: 'investigating', label: '🔍 Investigating' },
  { value: 'identified', label: '🎯 Identified' },
  { value: 'monitoring', label: '👀 Monitoring' },
  { value: 'resolved', label: '✅ Resolved' },
];

const COMM_ICONS: Record<string, React.ReactNode> = {
  slack_engineering: <Slack className="h-5 w-5" />,
  slack_company: <Slack className="h-5 w-5" />,
  customer_email: <Mail className="h-5 w-5" />,
  status_page: <Globe className="h-5 w-5" />,
  executive_summary: <Briefcase className="h-5 w-5" />,
  postmortem_template: <FileText className="h-5 w-5" />,
};

export function IncidentHubPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'high' as const,
    status: 'investigating' as const,
    impact: '',
    eta: '',
    rootCause: '',
    affectedServices: '',
    companyName: '',
  });

  const generateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await api.post<IncidentCommsResponse>('/incident/generate', {
        ...data,
        affectedServices: data.affectedServices
          ? data.affectedServices.split(',').map((s) => s.trim())
          : [],
      });
      return response.data;
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate(formData);
  };

  const copyToClipboard = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Incident Communication Hub</h1>
          <p className="text-muted-foreground">
            Generate all incident communications from a single input
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Incident Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Incident Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g., Database connection pool exhausted"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="severity">Severity *</Label>
                  <Select
                    value={formData.severity}
                    onValueChange={(v) => updateField('severity', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => updateField('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Technical Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="What's happening technically? e.g., Connection pool exhausted due to long-running queries..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="impact">User/Business Impact *</Label>
                <Textarea
                  id="impact"
                  value={formData.impact}
                  onChange={(e) => updateField('impact', e.target.value)}
                  placeholder="e.g., Users unable to login, affecting ~15% of traffic"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="eta">ETA to Resolution</Label>
                  <Input
                    id="eta"
                    value={formData.eta}
                    onChange={(e) => updateField('eta', e.target.value)}
                    placeholder="e.g., 30 minutes"
                  />
                </div>
                <div>
                  <Label htmlFor="affectedServices">Affected Services</Label>
                  <Input
                    id="affectedServices"
                    value={formData.affectedServices}
                    onChange={(e) => updateField('affectedServices', e.target.value)}
                    placeholder="e.g., API, Auth, Dashboard"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rootCause">Root Cause (if known)</Label>
                <Input
                  id="rootCause"
                  value={formData.rootCause}
                  onChange={(e) => updateField('rootCause', e.target.value)}
                  placeholder="e.g., Memory leak in connection pooling"
                />
              </div>

              <div>
                <Label htmlFor="companyName">Company Name (for customer comms)</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateField('companyName', e.target.value)}
                  placeholder="e.g., Acme Inc"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating 6 Communications...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate All Communications
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Output Preview */}
        <div className="space-y-4">
          {generateMutation.isSuccess && generateMutation.data && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Generated Communications ({generateMutation.data.communications.length})
                </h2>
                <span className="text-xs text-muted-foreground">
                  {new Date(generateMutation.data.generatedAt).toLocaleTimeString()}
                </span>
              </div>

              {generateMutation.data.communications.map((comm, index) => (
                <Card key={comm.type} className="overflow-hidden">
                  <CardHeader className="py-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {COMM_ICONS[comm.type]}
                        <CardTitle className="text-base">{comm.title}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(comm.content, index)}
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                      <span>Audience: {comm.audience}</span>
                      <span>Tone: {comm.tone}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3">
                    <pre className="whitespace-pre-wrap text-sm font-mono bg-muted rounded p-3 max-h-48 overflow-y-auto">
                      {comm.content}
                    </pre>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {!generateMutation.isSuccess && !generateMutation.isPending && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ready to Generate</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Fill in the incident details and click "Generate All Communications" to create
                  6 different messages for different audiences - all from a single input.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">Slack Engineering</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">Slack Company</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">Customer Email</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">Status Page</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">Executive Summary</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-muted">Postmortem</span>
                </div>
              </CardContent>
            </Card>
          )}

          {generateMutation.isError && (
            <Card className="border-destructive">
              <CardContent className="py-6 text-center text-destructive">
                <p>Failed to generate communications. Please try again.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default IncidentHubPage;
