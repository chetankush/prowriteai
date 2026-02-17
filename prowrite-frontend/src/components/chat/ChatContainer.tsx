import * as React from 'react';
import { RotateCcw, AlertCircle, X, Sparkles } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from './ChatMessage';
import type { Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
import type { ChatInputRef } from './ChatInput';
import { ConversationList } from './ConversationList';
import type { Conversation } from './ConversationList';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export type ModuleType = 'cold_email' | 'hr_docs' | 'youtube_scripts' | 'website_copy' | 'software_docs';

export interface ChatContainerProps {
  moduleType: ModuleType;
  introMessage?: string;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

export interface ChatContainerRef {
  focusInput: () => void;
  setInputValue: (value: string) => void;
  getInputValue: () => string;
}

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export const ChatContainer = React.forwardRef<ChatContainerRef, ChatContainerProps>(
  function ChatContainer({ moduleType, introMessage, inputValue, onInputChange }, ref) {
  const queryClient = useQueryClient();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = React.useState<ConversationWithMessages | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = React.useState(true);
  const [streamingContent, setStreamingContent] = React.useState('');
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [showClearDialog, setShowClearDialog] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const chatInputRef = React.useRef<ChatInputRef>(null);

  // Expose methods via ref for parent components
  React.useImperativeHandle(ref, () => ({
    focusInput: () => {
      chatInputRef.current?.focus();
    },
    setInputValue: (value: string) => {
      chatInputRef.current?.setValue(value);
    },
    getInputValue: () => {
      return chatInputRef.current?.getValue() || '';
    },
  }), []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  React.useEffect(() => {
    loadConversations();
  }, [moduleType]);

  const loadConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await api.get<Conversation[]>('/chat/conversations', {
        params: { module_type: moduleType },
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await api.get<ConversationWithMessages>(`/chat/conversations/${conversationId}`);
      setSelectedConversation(response.data);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    loadConversation(conversation.id);
  };

  const handleNewConversation = async () => {
    try {
      const response = await api.post<Conversation>('/chat/conversations', {
        module_type: moduleType,
      });
      const newConversation = response.data;
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversation({ ...newConversation, messages: [] });
      setMessages([]);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await api.delete(`/chat/conversations/${conversationId}`);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleRenameConversation = async (conversationId: string, newTitle: string) => {
    try {
      await api.patch(`/chat/conversations/${conversationId}`, { title: newTitle });
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c))
      );
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation((prev) => prev ? { ...prev, title: newTitle } : null);
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  const handleClearContext = () => {
    if (messages.length > 0 || selectedConversation) {
      setShowClearDialog(true);
    } else {
      handleNewConversation();
    }
  };

  const confirmClearContext = async () => {
    setShowClearDialog(false);
    setSelectedConversation(null);
    setMessages([]);
    setStreamingContent('');
    await handleNewConversation();
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) {
      try {
        const response = await api.post<Conversation>('/chat/conversations', {
          module_type: moduleType,
        });
        const newConversation = response.data;
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation({ ...newConversation, messages: [] });
        await sendMessageToConversation(newConversation.id, content);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    } else {
      await sendMessageToConversation(selectedConversation.id, content);
    }
  };

  const sendMessageToConversation = async (conversationId: string, content: string) => {
    setError(null);
    
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content,
      created_at: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingContent('');

    const abortController = new AbortController();
    let fullContent = '';
    let streamError: string | null = null;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/chat/conversations/${conversationId}/messages/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('backend_token')}`,
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({ content }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send message: ${response.status} ${errorText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith(':') || line.trim() === '') continue;

              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'text') {
                    if (data.content) {
                      fullContent += data.content;
                      setStreamingContent(fullContent);
                    }
                    if (data.title) {
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conversationId ? { ...c, title: data.title } : c))
                      );
                    }
                  } else if (data.type === 'done') {
                    if (data.fullContent) {
                      fullContent = data.fullContent;
                    }
                    setIsStreaming(false);
                  } else if (data.type === 'error') {
                    streamError = data.error || 'Unknown streaming error';
                    setIsStreaming(false);
                  }
                } catch (parseError) {
                  console.warn('Failed to parse SSE data:', line, parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      if (streamError) throw new Error(streamError);

      if (fullContent) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: fullContent,
          created_at: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        queryClient.invalidateQueries({ queryKey: ['workspace-usage'] });
      }
      setStreamingContent('');
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      
      console.error('Failed to send message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        conversation_id: conversationId,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
        created_at: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const displayMessages = React.useMemo(() => {
    if (messages.length === 0 && introMessage && !selectedConversation) {
      return [{
        id: 'intro',
        conversation_id: '',
        role: 'assistant' as const,
        content: introMessage,
        created_at: new Date(),
      }];
    }
    return messages;
  }, [messages, introMessage, selectedConversation]);

  const showEmptyState = displayMessages.length === 0;

  return (
    <div className="flex h-full overflow-hidden bg-card/30">
      <div className="w-72 shrink-0 border-r border-border/50 flex flex-col h-full">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          onNewConversation={handleNewConversation}
          onRenameConversation={handleRenameConversation}
          isLoading={isLoadingConversations}
        />
      </div>

      <div className="flex flex-1 flex-col min-h-0 bg-background/50">
        {(selectedConversation || messages.length > 0) && (
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium">ProWrite AI</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearContext}
              className="gap-2 text-muted-foreground hover:text-foreground h-8"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="text-xs">New Chat</span>
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 border-b border-destructive/20 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-xs">{error}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/20"
              onClick={() => setError(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto">
          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center h-full px-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-500/20">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
              <p className="text-muted-foreground text-sm text-center max-w-md">
                I'm your AI writing assistant. Ask me to help with emails, content, or any writing task.
              </p>
            </div>
          ) : (
            <>
              {displayMessages.map((message) => (
                <ChatMessage key={message.id} message={message} moduleType={moduleType} />
              ))}
              
              {isStreaming && streamingContent && (
                <ChatMessage
                  message={{
                    id: 'streaming',
                    conversation_id: selectedConversation?.id || '',
                    role: 'assistant',
                    content: streamingContent,
                    created_at: new Date(),
                  }}
                  isStreaming={true}
                  moduleType={moduleType}
                />
              )}

              {isLoading && !streamingContent && (
                <div className="flex items-center gap-3 px-4 py-4 max-w-3xl mx-auto">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="shrink-0">
          <ChatInput 
            ref={chatInputRef}
            onSend={handleSendMessage} 
            isLoading={isLoading} 
            placeholder="Ask anything"
            value={inputValue}
            onChange={onInputChange}
          />
        </div>
      </div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Start New Chat?</DialogTitle>
            <DialogDescription>
              This will start a fresh conversation. Your previous chats are saved in the sidebar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>Cancel</Button>
            <Button onClick={confirmClearContext}>Start New Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
