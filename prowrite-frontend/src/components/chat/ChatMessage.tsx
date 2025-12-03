import * as React from 'react';
import { Copy, Check, User, Bot, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { parseEducationalContent } from '@/lib/parseEducationalContent';
import { EducationalSectionsList } from './EducationalSection';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export interface GeneratedContent {
  type: string;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  generated_content?: GeneratedContent | null;
  created_at: Date;
}

export interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  moduleType?: string;
}

const MODULE_TO_ASSET_TYPE: Record<string, string> = {
  cold_email: 'email',
  hr_docs: 'job_description',
  youtube_scripts: 'script',
  website_copy: 'landing_page',
  software_docs: 'other',
};

export function ChatMessage({ message, isStreaming = false, moduleType }: ChatMessageProps) {
  const [copied, setCopied] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const queryClient = useQueryClient();
  const isUser = message.role === 'user';

  // Save to library mutation
  const saveMutation = useMutation({
    mutationFn: async (content: string) => {
      const assetType = moduleType ? MODULE_TO_ASSET_TYPE[moduleType] || 'other' : 'other';
      const response = await api.post('/team/assets', {
        title: `Generated ${assetType} - ${new Date().toLocaleDateString()}`,
        content,
        asset_type: assetType,
        tags: [moduleType || 'chat'],
        source_conversation_id: message.conversation_id,
      });
      return response.data;
    },
    onSuccess: () => {
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setTimeout(() => setSaved(false), 3000);
    },
  });

  // Parse educational content from assistant messages (only when not streaming)
  const parsedContent = React.useMemo(() => {
    if (isUser || isStreaming) {
      return { mainContent: message.content, educationalSections: [] };
    }
    return parseEducationalContent(message.content);
  }, [message.content, isUser, isStreaming]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div
      className={cn(
        'flex gap-3 p-4',
        isUser ? 'bg-background' : 'bg-muted/50'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Content */}
      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {isUser ? 'You' : 'AI Expert'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>

        {/* Main content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {isStreaming ? message.content : parsedContent.mainContent}
            {isStreaming && (
              <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-primary" />
            )}
          </div>
        </div>

        {/* Educational sections (collapsible) */}
        {!isStreaming && parsedContent.educationalSections.length > 0 && (
          <EducationalSectionsList sections={parsedContent.educationalSections} />
        )}

        {/* Generated content block */}
        {message.generated_content && (
          <div className="mt-3 rounded-lg border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {message.generated_content.type || 'Generated Content'}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveMutation.mutate(message.generated_content!.content)}
                  disabled={saveMutation.isPending || saved}
                  className="h-7 gap-1 px-2"
                >
                  {saved ? (
                    <>
                      <Check className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">Saved</span>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="h-3 w-3" />
                      <span className="text-xs">Save to Library</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(message.generated_content!.content)}
                  className="h-7 gap-1 px-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span className="text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm font-mono">
              {message.generated_content.content}
            </div>
          </div>
        )}

        {/* Copy and Save buttons for assistant messages without generated content */}
        {!isUser && !message.generated_content && message.content && (
          <div className="mt-2 flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => saveMutation.mutate(message.content)}
              disabled={saveMutation.isPending || saved}
              className="h-7 gap-1 px-2"
            >
              {saved ? (
                <>
                  <Check className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">Saved</span>
                </>
              ) : (
                <>
                  <FolderPlus className="h-3 w-3" />
                  <span className="text-xs">Save to Library</span>
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(message.content)}
              className="h-7 gap-1 px-2"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3" />
                  <span className="text-xs">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span className="text-xs">Copy</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
