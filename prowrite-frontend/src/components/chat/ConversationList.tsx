import * as React from 'react';
import { MessageSquarePlus, Trash2, Pencil, Check, X, Search, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface Conversation {
  id: string;
  workspace_id: string;
  module_type: string;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
  onDelete: (conversationId: string) => void;
  onNewConversation: () => void;
  onRenameConversation?: (conversationId: string, newTitle: string) => void;
  isLoading?: boolean;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onDelete,
  onNewConversation,
  onRenameConversation,
  isLoading = false,
}: ConversationListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const editInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const filteredConversations = React.useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const query = searchQuery.toLowerCase();
    return conversations.filter(c => 
      c.title.toLowerCase().includes(query)
    );
  }, [conversations, searchQuery]);

  const handleStartEdit = (e: React.MouseEvent, conversation: Conversation) => {
    e.stopPropagation();
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editingId && editTitle.trim() && onRenameConversation) {
      onRenameConversation(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditTitle('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit(e as unknown as React.MouseEvent);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingId(null);
      setEditTitle('');
    }
  };

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (deletingId) return;
    
    setDeletingId(conversationId);
    try {
      await onDelete(conversationId);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Group conversations by date
  const groupedConversations = React.useMemo(() => {
    const groups: { label: string; conversations: Conversation[] }[] = [];
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const thisWeek: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);

    filteredConversations.forEach(conv => {
      const date = new Date(conv.updated_at);
      if (date >= todayStart) {
        today.push(conv);
      } else if (date >= yesterdayStart) {
        yesterday.push(conv);
      } else if (date >= weekStart) {
        thisWeek.push(conv);
      } else {
        older.push(conv);
      }
    });

    if (today.length) groups.push({ label: 'Today', conversations: today });
    if (yesterday.length) groups.push({ label: 'Yesterday', conversations: yesterday });
    if (thisWeek.length) groups.push({ label: 'This Week', conversations: thisWeek });
    if (older.length) groups.push({ label: 'Older', conversations: older });

    return groups;
  }, [filteredConversations]);

  return (
    <div className="flex h-full flex-col bg-card/50">
      {/* New Chat Button */}
      <div className="p-3">
        <Button
          variant="outline"
          onClick={onNewConversation}
          className="w-full justify-start gap-3 h-11 bg-transparent border-border/50 hover:bg-accent/50 text-foreground"
        >
          <MessageSquarePlus className="h-4 w-4" />
          <span>New chat</span>
        </Button>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 bg-secondary/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : groupedConversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No matching chats' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-4">
            {groupedConversations.map((group) => (
              <div key={group.label}>
                <div className="px-3 py-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group.label}
                  </span>
                </div>
                <div className="space-y-0.5">
                  {group.conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => editingId !== conversation.id && onSelect(conversation)}
                      className={cn(
                        'group flex items-center gap-2 rounded-lg px-3 py-2.5 cursor-pointer transition-all',
                        selectedId === conversation.id 
                          ? 'bg-accent/80 text-accent-foreground' 
                          : 'hover:bg-secondary/80 text-foreground'
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        {editingId === conversation.id ? (
                          <form onSubmit={handleSaveEdit} className="flex items-center gap-1">
                            <Input
                              ref={editInputRef}
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={handleEditKeyDown}
                              onClick={(e) => e.stopPropagation()}
                              className="h-7 text-sm bg-background"
                            />
                            <Button
                              type="submit"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={handleSaveEdit}
                            >
                              <Check className="h-3.5 w-3.5 text-green-500" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </form>
                        ) : (
                          <div className="truncate text-sm">
                            {conversation.title || 'New Conversation'}
                          </div>
                        )}
                      </div>
                      {editingId !== conversation.id && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onRenameConversation && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleStartEdit(e, conversation)}
                              className="h-7 w-7 hover:bg-background/50"
                            >
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleDelete(e, conversation.id)}
                            disabled={deletingId === conversation.id}
                            className="h-7 w-7 hover:bg-background/50"
                          >
                            {deletingId === conversation.id ? (
                              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
