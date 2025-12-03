/**
 * Translate for Audience
 * Paste any text, get it translated for different audiences
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, Loader2, Languages, Sparkles } from 'lucide-react';

interface TranslatedVersion {
  audience: string;
  description: string;
  icon: string;
  content: string;
}

interface TranslateResponse {
  original: string;
  translations: TranslatedVersion[];
  generatedAt: string;
}

export function TranslateHubPage() {
  const [inputText, setInputText] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const translateMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await api.post<TranslateResponse>('/translate', { text });
      return response.data;
    },
  });

  const handleTranslate = () => {
    if (inputText.trim()) {
      translateMutation.mutate(inputText.trim());
    }
  };

  const copyToClipboard = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-4">
          <Languages className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Translate for Audience</h1>
        <p className="text-muted-foreground mt-1">
          Paste any text → Get 6 versions for different audiences
        </p>
      </div>

      {/* Input */}
      <Card>
        <CardContent className="pt-6">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your technical text, ChatGPT response, or any content here...

Example: 'We implemented a Redis caching layer with LRU eviction policy, reducing p99 latency from 450ms to 120ms and decreasing database load by 60%.'"
            rows={6}
            className="text-base"
          />
          <Button
            onClick={handleTranslate}
            disabled={!inputText.trim() || translateMutation.isPending}
            className="w-full mt-4"
            size="lg"
          >
            {translateMutation.isPending ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Translating for 6 audiences...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Translate for All Audiences
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {translateMutation.isSuccess && translateMutation.data && (
        <div className="grid gap-4 md:grid-cols-2">
          {translateMutation.data.translations.map((translation, index) => (
            <Card key={translation.audience} className="overflow-hidden">
              <CardHeader className="py-3 bg-muted/50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{translation.icon}</span>
                  <div>
                    <CardTitle className="text-base">{translation.audience}</CardTitle>
                    <p className="text-xs text-muted-foreground">{translation.description}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(translation.content, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </CardHeader>
              <CardContent className="py-4">
                <p className="text-sm whitespace-pre-wrap">{translation.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!translateMutation.isSuccess && !translateMutation.isPending && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: '👔', title: 'Manager', desc: 'Non-technical, impact-focused' },
            { icon: '🎯', title: 'Executive', desc: 'Business impact, strategic' },
            { icon: '🤝', title: 'Customer', desc: 'Friendly, customer-focused' },
            { icon: '💻', title: 'Technical Team', desc: 'Clear, structured' },
            { icon: '💬', title: 'Slack Message', desc: 'Casual, scannable' },
            { icon: '📧', title: 'Email', desc: 'Professional, polished' },
          ].map((item) => (
            <Card key={item.title} className="border-dashed opacity-60">
              <CardContent className="py-6 text-center">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="font-medium mt-2">{item.title}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error */}
      {translateMutation.isError && (
        <Card className="border-destructive">
          <CardContent className="py-6 text-center text-destructive">
            <p>Failed to translate. Please try again.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default TranslateHubPage;
