import { Trash2, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface GenerationHistoryItem {
  id: string;
  templateName: string;
  generatedContent: string | null;
  createdAt: Date | string;
  status: 'pending' | 'completed' | 'failed';
}

export interface GenerationHistoryProps {
  generations: GenerationHistoryItem[];
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  isDeleting?: string | null;
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function truncateContent(content: string | null, maxLength: number = 100): string {
  if (!content) return 'No content';
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
}

export function GenerationHistory({
  generations,
  onSelect,
  onDelete,
  isDeleting,
}: GenerationHistoryProps) {
  if (generations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No generations yet</p>
          <p className="text-sm text-muted-foreground">
            Your generated content will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Generation History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {generations.map((generation) => (
          <div
            key={generation.id}
            className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => onSelect?.(generation.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm truncate">
                  {generation.templateName}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    generation.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : generation.status === 'failed'
                      ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {generation.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {truncateContent(generation.generatedContent)}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatDate(generation.createdAt)}
              </div>
            </div>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(generation.id);
                }}
                disabled={isDeleting === generation.id}
              >
                <Trash2 className={`h-4 w-4 ${isDeleting === generation.id ? 'animate-pulse' : ''}`} />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
