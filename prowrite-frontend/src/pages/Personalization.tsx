import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Variable,
  Download,
  Copy,
  FileSpreadsheet,
  Sparkles,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Check,
} from 'lucide-react';

export function PersonalizationPage() {
  const [template, setTemplate] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [extractedVariables, setExtractedVariables] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Record<string, string>[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [step, setStep] = useState<'template' | 'data' | 'results'>('template');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const extractMutation = useMutation({
    mutationFn: async (templateContent: string) => {
      const response = await api.post('/team/personalize/extract-variables', { template: templateContent });
      return response.data.variables as string[];
    },
    onSuccess: (variables) => {
      setExtractedVariables(variables);
      if (variables.length > 0) setStep('data');
    },
  });

  const parseCsvMutation = useMutation({
    mutationFn: async (csv: string) => {
      const response = await api.post('/team/personalize/parse-csv', { csv_content: csv });
      return response.data.recipients as Record<string, string>[];
    },
    onSuccess: (parsedRecipients) => setRecipients(parsedRecipients),
  });

  const personalizeMutation = useMutation({
    mutationFn: async (data: { template_content: string; recipients: Record<string, string>[] }) => {
      const response = await api.post('/team/personalize/bulk', data);
      return response.data.results as string[];
    },
    onSuccess: (personalizedResults) => {
      setResults(personalizedResults);
      setStep('results');
    },
  });

  const handleExtractVariables = () => {
    if (template.trim()) extractMutation.mutate(template);
  };

  const handleParseCsv = () => {
    if (csvContent.trim()) parseCsvMutation.mutate(csvContent);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCsvContent(content);
        parseCsvMutation.mutate(content);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = () => {
    if (template && recipients.length > 0) {
      personalizeMutation.mutate({ template_content: template, recipients });
    }
  };

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const downloadResults = () => {
    const csvLines = ['index,personalized_content'];
    results.forEach((content, index) => {
      const escaped = content.replace(/"/g, '""');
      csvLines.push(`${index + 1},"${escaped}"`);
    });
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'personalized_content.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const sampleCsv = `first_name,company,title,pain_point
John,Acme Corp,Sales Manager,lead generation
Sarah,TechStart,CEO,scaling operations
Mike,GlobalTech,VP Sales,team productivity`;

  const sampleTemplate = `Hi {{first_name}},

I noticed that {{company}} is focused on {{pain_point}}. As a {{title}}, you're probably looking for ways to improve results.

I'd love to share how we've helped similar companies achieve 3x better outcomes.

Would you be open to a quick 15-minute call this week?

Best,
[Your Name]`;

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <Variable className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Mail Merge</h1>
              <p className="text-muted-foreground">Bulk personalize your content with recipient data</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-3">
            {[
              { key: 'template', label: '1. Template' },
              { key: 'data', label: '2. Data' },
          { key: 'results', label: '3. Results' },
        ].map((s, i) => (
          <div key={s.key} className="flex items-center gap-3">
            {i > 0 && <div className="h-px w-8 bg-border/50" />}
            <div
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                step === s.key
                  ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-secondary/50 text-muted-foreground'
              }`}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Template */}
      {step === 'template' && (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                <Variable className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Create Your Template</h2>
                <p className="text-sm text-muted-foreground">Use {'{{variable_name}}'} syntax for personalization tokens</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="template" className="text-sm font-medium">Template Content</Label>
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder={sampleTemplate}
                rows={12}
                className="font-mono text-sm mt-2 bg-secondary/30 border-border/50"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button 
                onClick={handleExtractVariables} 
                disabled={!template.trim()}
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              >
                <Sparkles className="h-4 w-4" />
                Extract Variables & Continue
              </Button>
              <Button variant="outline" onClick={() => setTemplate(sampleTemplate)}>
                Use Sample Template
              </Button>
            </div>

            {extractedVariables.length > 0 && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Variables Found:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedVariables.map((v) => (
                    <span key={v} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extractMutation.isError && (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to extract variables. Please check your template.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Data */}
      {step === 'data' && (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
                <FileSpreadsheet className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Upload Recipient Data</h2>
                <p className="text-sm text-muted-foreground">
                  Column headers should match: {extractedVariables.join(', ')}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Label htmlFor="csv-upload" className="text-sm font-medium">Upload CSV File</Label>
              <Input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-2 h-11 bg-secondary/30 border-border/50"
              />
            </div>

            <div className="text-center text-muted-foreground text-sm">— or —</div>

            <div>
              <Label htmlFor="csv-content" className="text-sm font-medium">Paste CSV Content</Label>
              <Textarea
                id="csv-content"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder={sampleCsv}
                rows={8}
                className="font-mono text-sm mt-2 bg-secondary/30 border-border/50"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={handleParseCsv} disabled={!csvContent.trim()}>Parse CSV</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCsvContent(sampleCsv);
                  parseCsvMutation.mutate(sampleCsv);
                }}
              >
                Use Sample Data
              </Button>
              <Button variant="ghost" onClick={() => setStep('template')} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </div>

            {recipients.length > 0 && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Preview ({recipients.length} recipients)</Label>
                <div className="border border-border/50 rounded-xl overflow-hidden mt-2">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/50">
                      <tr>
                        {Object.keys(recipients[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2 text-left font-medium text-foreground">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.slice(0, 5).map((recipient, index) => (
                        <tr key={index} className="border-t border-border/50">
                          {Object.values(recipient).map((value, i) => (
                            <td key={i} className="px-3 py-2 text-foreground">{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recipients.length > 5 && (
                    <div className="px-3 py-2 bg-secondary/30 text-center text-muted-foreground text-sm">
                      ... and {recipients.length - 5} more
                    </div>
                  )}
                </div>

                <Button
                  className="mt-4 gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                  onClick={handleGenerate}
                  disabled={personalizeMutation.isPending}
                >
                  <Sparkles className="h-4 w-4" />
                  {personalizeMutation.isPending ? 'Generating...' : `Generate ${recipients.length} Personalized Versions`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 'results' && (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Personalized Content Ready</h2>
                <p className="text-sm text-muted-foreground">{results.length} personalized versions generated</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Button onClick={downloadResults} className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white">
                <Download className="h-4 w-4" />
                Download All as CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setStep('template');
                  setResults([]);
                  setRecipients([]);
                  setCsvContent('');
                }}
              >
                Start New Batch
              </Button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {results.map((content, index) => (
                <div key={index} className="rounded-xl border border-border/50 bg-secondary/30 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1} - {recipients[index]?.first_name || recipients[index]?.name || `Recipient ${index + 1}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(content, index)}
                      className="h-8 w-8"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <div className="rounded-lg bg-background/50 p-3 whitespace-pre-wrap text-sm text-foreground">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default PersonalizationPage;
