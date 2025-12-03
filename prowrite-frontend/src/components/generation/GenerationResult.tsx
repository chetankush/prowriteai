import * as React from 'react';
import { Copy, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export interface GenerationResultProps {
  content: string;
  tokensUsed: number;
  onCopy?: () => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function GenerationResult({
  content,
  tokensUsed,
  onCopy,
  onRegenerate,
  isRegenerating = false,
}: GenerationResultProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">Generated Content</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              {isRegenerating ? 'Regenerating...' : 'Regenerate'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm">
          {content}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Tokens used: {tokensUsed.toLocaleString()}
      </CardFooter>
    </Card>
  );
}
