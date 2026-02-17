import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-5xl">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Translate for Audience</h1>
              <p className="text-muted-foreground">Paste any text → Get 6 versions for different audiences</p>
            </div>
          </div>

          {/* Input */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your technical text, ChatGPT response, or any content here...

Example: 'We implemented a Redis caching layer with LRU eviction policy, reducing p99 latency from 450ms to 120ms and decreasing database load by 60%.'"
              rows={6}
              className="text-sm bg-secondary/30 border-border/50 resize-none"
            />
            <Button
              onClick={handleTranslate}
              disabled={!inputText.trim() || translateMutation.isPending}
              className="w-full mt-4 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/25"
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
          </div>

          {/* Results */}
          {translateMutation.isSuccess && translateMutation.data && (
            <div className="grid gap-4 md:grid-cols-2">
              {translateMutation.data.translations.map((translation, index) => (
                <div key={translation.audience} className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                  <div className="px-4 py-3 bg-secondary/30 border-b border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{translation.icon}</span>
                      <div>
                        <h3 className="font-medium text-foreground">{translation.audience}</h3>
                        <p className="text-xs text-muted-foreground">{translation.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(translation.content, index)}
                      className="h-8 w-8"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{translation.content}</p>
                  </div>
                </div>
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
                <div key={item.title} className="rounded-xl border border-dashed border-border/50 bg-card/30 p-6 text-center opacity-60">
                  <span className="text-2xl">{item.icon}</span>
                  <h3 className="font-medium text-foreground mt-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {translateMutation.isError && (
            <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 text-center">
              <p className="text-destructive">Failed to translate. Please try again.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TranslateHubPage;
