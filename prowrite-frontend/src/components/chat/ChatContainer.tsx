import * as React from 'react';
import { RotateCcw, AlertCircle, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from './ChatMessage';
import type { Message } from './ChatMessage';
import { ChatInput } from './ChatInput';
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
}

interface ConversationWithMessages extends Conversation {
  messages: Message[];
}

export function ChatContainer({ moduleType, introMessage }: ChatContainerProps) {
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

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Load conversations on mount
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
    // Show confirmation dialog if there are messages
    if (messages.length > 0 || selectedConversation) {
      setShowClearDialog(true);
    } else {
      // No messages, just start fresh
      handleNewConversation();
    }
  };

  const confirmClearContext = async () => {
    setShowClearDialog(false);
    // Clear current selection and start fresh
    setSelectedConversation(null);
    setMessages([]);
    setStreamingContent('');
    // Create a new conversation
    await handleNewConversation();
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) {
      // Create a new conversation first
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
    // Clear any previous error
    setError(null);
    
    // Add user message optimistically
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

    // Create AbortController for connection cleanup
    const abortController = new AbortController();
    let fullContent = '';
    let streamError: string | null = null;

    try {
      // Use streaming endpoint with SSE
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

            // Append new data to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE events from buffer
            const lines = buffer.split('\n');
            // Keep the last potentially incomplete line in buffer
            buffer = lines.pop() || '';

            for (const line of lines) {
              // Skip heartbeat comments and empty lines
              if (line.startsWith(':') || line.trim() === '') {
                continue;
              }

              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.type === 'text') {
                    if (data.content) {
                      fullContent += data.content;
                      setStreamingContent(fullContent);
                    }
                    // Handle auto-generated title from first message
                    if (data.title) {
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conversationId ? { ...c, title: data.title } : c))
                      );
                    }
                  } else if (data.type === 'done') {
                    // Streaming complete - use fullContent from server if available
                    if (data.fullContent) {
                      fullContent = data.fullContent;
                    }
                    setIsStreaming(false);
                  } else if (data.type === 'error') {
                    streamError = data.error || 'Unknown streaming error';
                    console.error('Stream error:', streamError);
                    setIsStreaming(false);
                  }
                } catch (parseError) {
                  // Log parse errors but continue processing
                  console.warn('Failed to parse SSE data:', line, parseError);
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      }

      // Handle stream error
      if (streamError) {
        throw new Error(streamError);
      }

      // Add assistant message with the complete content
      if (fullContent) {
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          conversation_id: conversationId,
          role: 'assistant',
          content: fullContent,
          created_at: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Invalidate usage stats cache after successful generation
        queryClient.invalidateQueries({ queryKey: ['workspace-usage'] });
      }
      setStreamingContent('');
    } catch (error) {
      // Don't log abort errors (user navigated away)
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }
      
      console.error('Failed to send message:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMsg);
      
      // Remove optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      
      // Show error message to user
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

  // Show intro message when no conversation is selected
  const displayMessages = React.useMemo(() => {
    if (messages.length === 0 && introMessage && !selectedConversation) {
      return [
        {
          id: 'intro',
          conversation_id: '',
          role: 'assistant' as const,
          content: introMessage,
          created_at: new Date(),
        },
      ];
    }
    return messages;
  }, [messages, introMessage, selectedConversation]);

  return (
    <div className="flex h-full">
      {/* Conversation sidebar */}
      <div className="w-64 shrink-0">
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

      {/* Main chat area */}
      <div className="flex flex-1 flex-col">
        {/* Header with Clear Context button */}
        {(selectedConversation || messages.length > 0) && (
          <div className="flex items-center justify-end border-b px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearContext}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Start Fresh
            </Button>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
              onClick={() => setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {displayMessages.map((message) => (
            <ChatMessage key={message.id} message={message} moduleType={moduleType} />
          ))}
          
          {/* Streaming message */}
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

          {/* Loading indicator when waiting for response */}
          {isLoading && !streamingContent && (
            <div className="flex items-center gap-2 p-4 text-muted-foreground">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
              </div>
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder="Type your message..."
        />
      </div>

      {/* Clear Context Confirmation Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Fresh Conversation?</DialogTitle>
            <DialogDescription>
              This will clear the current conversation context and start a new chat. 
              Your previous conversations will still be available in the sidebar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowClearDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmClearContext}>
              Start Fresh
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
