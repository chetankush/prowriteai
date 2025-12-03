/**
 * Personalization / Mail Merge page
 * Bulk personalize content with CSV data
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
} from 'lucide-react';

export function PersonalizationPage() {
  const [template, setTemplate] = useState('');
  const [csvContent, setCsvContent] = useState('');
  const [extractedVariables, setExtractedVariables] = useState<string[]>([]);
  const [recipients, setRecipients] = useState<Record<string, string>[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [step, setStep] = useState<'template' | 'data' | 'results'>('template');

  // Extract variables mutation
  const extractMutation = useMutation({
    mutationFn: async (templateContent: string) => {
      const response = await api.post('/team/personalize/extract-variables', {
        template: templateContent,
      });
      return response.data.variables as string[];
    },
    onSuccess: (variables) => {
      setExtractedVariables(variables);
      if (variables.length > 0) {
        setStep('data');
      }
    },
  });

  // Parse CSV mutation
  const parseCsvMutation = useMutation({
    mutationFn: async (csv: string) => {
      const response = await api.post('/team/personalize/parse-csv', {
        csv_content: csv,
      });
      return response.data.recipients as Record<string, string>[];
    },
    onSuccess: (parsedRecipients) => {
      setRecipients(parsedRecipients);
    },
  });

  // Bulk personalize mutation
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
    if (template.trim()) {
      extractMutation.mutate(template);
    }
  };

  const handleParseCsv = () => {
    if (csvContent.trim()) {
      parseCsvMutation.mutate(csvContent);
    }
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
      personalizeMutation.mutate({
        template_content: template,
        recipients,
      });
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mail Merge / Personalization</h1>
        <p className="text-muted-foreground">
          Bulk personalize your content with recipient data
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            step === 'template' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <span className="text-sm font-medium">1. Template</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            step === 'data' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <span className="text-sm font-medium">2. Data</span>
        </div>
        <div className="h-px w-8 bg-border" />
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            step === 'results' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          <span className="text-sm font-medium">3. Results</span>
        </div>
      </div>

      {/* Step 1: Template */}
      {step === 'template' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Variable className="h-5 w-5" />
              Create Your Template
            </CardTitle>
            <CardDescription>
              Use {'{{variable_name}}'} syntax for personalization tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="template">Template Content</Label>
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder={sampleTemplate}
                rows={12}
                className="font-mono text-sm mt-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleExtractVariables} disabled={!template.trim()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Extract Variables & Continue
              </Button>
              <Button
                variant="outline"
                onClick={() => setTemplate(sampleTemplate)}
              >
                Use Sample Template
              </Button>
            </div>

            {extractedVariables.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Variables Found:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {extractedVariables.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm"
                    >
                      {`{{${v}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {extractMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-4 w-4" />
                  <span>Failed to extract variables. Please check your template.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Data */}
      {step === 'data' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Upload Recipient Data
            </CardTitle>
            <CardDescription>
              Upload a CSV file or paste data. Column headers should match your variables:
              {extractedVariables.map((v) => ` ${v}`).join(',')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div>
              <Label htmlFor="csv-upload">Upload CSV File</Label>
              <div className="mt-2">
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
              </div>
            </div>

            <div className="text-center text-muted-foreground">— or —</div>

            {/* Paste CSV */}
            <div>
              <Label htmlFor="csv-content">Paste CSV Content</Label>
              <Textarea
                id="csv-content"
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder={sampleCsv}
                rows={8}
                className="font-mono text-sm mt-2"
              />
            </div>

            <div className="flex items-center gap-4">
              <Button onClick={handleParseCsv} disabled={!csvContent.trim()}>
                Parse CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCsvContent(sampleCsv);
                  parseCsvMutation.mutate(sampleCsv);
                }}
              >
                Use Sample Data
              </Button>
              <Button variant="ghost" onClick={() => setStep('template')}>
                Back to Template
              </Button>
            </div>

            {/* Preview Recipients */}
            {recipients.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <Label>Preview ({recipients.length} recipients)</Label>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        {Object.keys(recipients[0] || {}).map((key) => (
                          <th key={key} className="px-3 py-2 text-left font-medium">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recipients.slice(0, 5).map((recipient, index) => (
                        <tr key={index} className="border-t">
                          {Object.values(recipient).map((value, i) => (
                            <td key={i} className="px-3 py-2">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {recipients.length > 5 && (
                    <div className="px-3 py-2 bg-muted text-center text-muted-foreground">
                      ... and {recipients.length - 5} more
                    </div>
                  )}
                </div>

                <Button
                  className="mt-4"
                  onClick={handleGenerate}
                  disabled={personalizeMutation.isPending}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {personalizeMutation.isPending
                    ? 'Generating...'
                    : `Generate ${recipients.length} Personalized Versions`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 'results' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Personalized Content Ready
            </CardTitle>
            <CardDescription>
              {results.length} personalized versions generated
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <Button onClick={downloadResults}>
                <Download className="h-4 w-4 mr-2" />
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

            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {results.map((content, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      #{index + 1} - {recipients[index]?.first_name || recipients[index]?.name || `Recipient ${index + 1}`}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-muted rounded p-3 whitespace-pre-wrap text-sm">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PersonalizationPage;
