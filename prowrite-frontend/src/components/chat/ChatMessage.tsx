import * as React from 'react';
import { Copy, Check, Sparkles, ThumbsUp, ThumbsDown, FolderPlus, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { useToast } from '@/components/ui/toast';
import { parseEducationalContent } from '@/lib/parseEducationalContent';
import { parseHRDocument, isHRDocsModule } from '@/lib/parseHRDocument';
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
  const [feedback, setFeedback] = React.useState<'up' | 'down' | null>(null);
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const isUser = message.role === 'user';

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

  const parsedContent = React.useMemo(() => {
    if (isUser || isStreaming) {
      return { mainContent: message.content, educationalSections: [] };
    }
    return parseEducationalContent(message.content);
  }, [message.content, isUser, isStreaming]);

  // Parse HR document blocks for HR docs module
  const hrDocumentParsed = React.useMemo(() => {
    if (isUser || isStreaming || !isHRDocsModule(moduleType)) {
      return null;
    }
    return parseHRDocument(message.content);
  }, [message.content, isUser, isStreaming, moduleType]);

  // State for document block copy
  const [documentCopied, setDocumentCopied] = React.useState(false);

  const handleCopyDocument = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setDocumentCopied(true);
      addToast({
        message: 'Document copied to clipboard!',
        type: 'success',
        duration: 3000,
      });
      setTimeout(() => setDocumentCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy document:', err);
      addToast({
        message: 'Failed to copy document. Please try again.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end px-4 py-3">
        <div className="max-w-[85%] md:max-w-[70%]">
          <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-primary-foreground">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-4">
          {/* AI Avatar */}
          <div className="shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Main content - with HR document block handling */}
            {hrDocumentParsed?.documentBlock ? (
              <>
                {/* Explanation before document */}
                {hrDocumentParsed.explanationBefore && (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {hrDocumentParsed.explanationBefore}
                    </div>
                  </div>
                )}

                {/* HR Document Block with special formatting */}
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-emerald-500/30 bg-emerald-950/30">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-400" />
                      <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                        {hrDocumentParsed.documentBlock.documentType}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => saveMutation.mutate(hrDocumentParsed.documentBlock!.documentContent)}
                        disabled={saveMutation.isPending || saved}
                        className="h-7 gap-1.5 px-2 text-xs hover:bg-emerald-900/50 text-emerald-300"
                      >
                        {saved ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-green-500">Saved</span>
                          </>
                        ) : (
                          <>
                            <FolderPlus className="h-3.5 w-3.5" />
                            <span>Save</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyDocument(hrDocumentParsed.documentBlock!.documentContent)}
                        className="h-7 gap-1.5 px-2 text-xs hover:bg-emerald-900/50 text-emerald-300"
                      >
                        {documentCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-green-500">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy Document</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-background/50">
                    <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {hrDocumentParsed.documentBlock.documentContent}
                    </pre>
                  </div>
                </div>

                {/* Explanation after document */}
                {hrDocumentParsed.explanationAfter && (
                  <div className="prose prose-sm prose-invert max-w-none mt-4">
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                      {hrDocumentParsed.explanationAfter}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {isStreaming ? message.content : parsedContent.mainContent}
                  {isStreaming && (
                    <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse rounded-sm" />
                  )}
                </div>
              </div>
            )}

            {/* Educational sections */}
            {!isStreaming && parsedContent.educationalSections.length > 0 && (
              <EducationalSectionsList sections={parsedContent.educationalSections} />
            )}

            {/* Generated content block */}
            {message.generated_content && (
              <div className="mt-4 rounded-xl border border-border/50 bg-secondary/30 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-secondary/50">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {message.generated_content.type || 'Generated Content'}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => saveMutation.mutate(message.generated_content!.content)}
                      disabled={saveMutation.isPending || saved}
                      className="h-7 gap-1.5 px-2 text-xs hover:bg-background/50"
                    >
                      {saved ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500">Saved</span>
                        </>
                      ) : (
                        <>
                          <FolderPlus className="h-3.5 w-3.5" />
                          <span>Save</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(message.generated_content!.content)}
                      className="h-7 gap-1.5 px-2 text-xs hover:bg-background/50"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap">
                    {message.generated_content.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Action buttons for assistant messages */}
            {!isStreaming && (
              <div className="flex items-center gap-1 pt-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(message.content)}
                  className="h-8 w-8 rounded-lg hover:bg-secondary"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFeedback(feedback === 'up' ? null : 'up')}
                  className={cn(
                    "h-8 w-8 rounded-lg hover:bg-secondary",
                    feedback === 'up' && "text-green-500"
                  )}
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFeedback(feedback === 'down' ? null : 'down')}
                  className={cn(
                    "h-8 w-8 rounded-lg hover:bg-secondary",
                    feedback === 'down' && "text-red-500"
                  )}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                {!message.generated_content && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => saveMutation.mutate(message.content)}
                    disabled={saveMutation.isPending || saved}
                    className="h-8 w-8 rounded-lg hover:bg-secondary"
                  >
                    {saved ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <FolderPlus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
