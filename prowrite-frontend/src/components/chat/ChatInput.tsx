import * as React from 'react';
import { Send, Loader2, Plus, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

export interface ChatInputRef {
  focus: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
}

export const ChatInput = React.forwardRef<ChatInputRef, ChatInputProps>(function ChatInput(
  {
    onSend,
    isLoading = false,
    placeholder = 'Ask anything',
    disabled = false,
    value: controlledValue,
    onChange,
  },
  ref
) {
  const [internalMessage, setInternalMessage] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Support both controlled and uncontrolled modes
  const isControlled = controlledValue !== undefined;
  const message = isControlled ? controlledValue : internalMessage;
  
  const setMessage = React.useCallback((newValue: string) => {
    if (isControlled && onChange) {
      onChange(newValue);
    } else {
      setInternalMessage(newValue);
    }
  }, [isControlled, onChange]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
    getValue: () => message,
    setValue: (value: string) => {
      setMessage(value);
      // Auto-resize textarea after setting value
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    },
  }), [message, setMessage]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isLoading && !disabled) {
      onSend(trimmedMessage);
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.metaKey || e.ctrlKey || !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.blur();
      }
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-4 py-4">
        <form onSubmit={handleSubmit}>
          <div className={cn(
            "relative flex items-end gap-2 rounded-2xl border border-border/50 bg-secondary/30 p-2 transition-all",
            "focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
          )}>
            {/* Attachment button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
              disabled={isLoading || disabled}
            >
              <Plus className="h-5 w-5" />
            </Button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading || disabled}
              rows={1}
              className={cn(
                "flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none min-h-[36px] max-h-[200px] py-2 px-1",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />

            {/* Voice button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
              disabled={isLoading || disabled}
            >
              <Mic className="h-5 w-5" />
            </Button>

            {/* Send button */}
            <Button
              type="submit"
              size="icon"
              disabled={!message.trim() || isLoading || disabled}
              className={cn(
                "h-9 w-9 shrink-0 rounded-xl transition-all",
                message.trim() 
                  ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
        
        <p className="text-center text-xs text-muted-foreground mt-3">
          ProWrite AI can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
});
