/**
 * Dashboard home page component
 * Displays usage statistics and recent conversations
 * Requirements: 11.3
 */
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface UsageStats {
  usage_count: number;
  usage_limit: number;
  remaining: number;
  percentage_used: number;
}

interface Conversation {
  id: string;
  workspace_id: string;
  module_type: 'cold_email' | 'hr_docs' | 'youtube_scripts' | 'website_copy';
  title: string;
  created_at: string;
  updated_at: string;
}

const MODULE_LABELS: Record<string, string> = {
  cold_email: 'Cold Email',
  hr_docs: 'HR Docs',
  youtube_scripts: 'YouTube Scripts',
  website_copy: 'Website Copy',
};

export function DashboardPage() {
  // Fetch usage stats
  const { data: usageStats, isLoading: usageLoading } = useQuery<UsageStats>({
    queryKey: ['workspace-usage'],
    queryFn: async () => {
      const response = await api.get('/workspace/usage');
      return response.data;
    },
  });

  // Fetch recent conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversations');
      return response.data;
    },
  });

  // Calculate recent conversations (last 7 days)
  const recentConversations = conversations.filter((c) => {
    const updatedAt = new Date(c.updated_at);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return updatedAt >= sevenDaysAgo;
  });

  // Get last 5 conversations for activity feed
  const recentActivity = conversations.slice(0, 5);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to ProWrite AI</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Messages This Month</h3>
          {usageLoading ? (
            <p className="text-2xl font-bold text-foreground mt-2">Loading...</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-foreground mt-2">
                {usageStats?.usage_count ?? 0} / {usageStats?.usage_limit ?? 100}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {usageStats?.remaining ?? 100} messages remaining
              </p>
              {/* Progress bar */}
              <div className="w-full bg-secondary rounded-full h-2 mt-3">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(usageStats?.percentage_used ?? 0, 100)}%` }}
                />
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Current Plan</h3>
          <p className="text-2xl font-bold text-foreground mt-2">Free</p>
          <p className="text-xs text-muted-foreground mt-1">Upgrade for more features</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Active Conversations</h3>
          {conversationsLoading ? (
            <p className="text-2xl font-bold text-foreground mt-2">Loading...</p>
          ) : (
            <>
              <p className="text-2xl font-bold text-foreground mt-2">{recentConversations.length}</p>
              <p className="text-xs text-muted-foreground mt-1">in the last 7 days</p>
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Recent Conversations</h2>
        {conversationsLoading ? (
          <p className="text-muted-foreground text-sm">Loading recent activity...</p>
        ) : recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No recent conversations. Start by selecting a module from the sidebar.
          </p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-start justify-between p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {MODULE_LABELS[conversation.module_type] || conversation.module_type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(conversation.updated_at)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground mt-1 truncate">
                    {conversation.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
