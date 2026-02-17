import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, History, User, Clock, FileText } from 'lucide-react';

interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  changed_by: string;
  version_number: number;
  created_at: string;
}

interface DocumentVersionsProps {
  documentId: string;
  onClose: () => void;
  onSelectVersion?: (version: DocumentVersion) => void;
}

export function DocumentVersions({ documentId, onClose, onSelectVersion }: DocumentVersionsProps) {
  const { data: versions = [], isLoading } = useQuery<DocumentVersion[]>({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      const response = await api.get(`/documents/${documentId}/versions`);
      return response.data;
    },
    enabled: !!documentId,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  };


  return (
    <div className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-l border-border/50">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
            <History className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Version History</h2>
            <p className="text-sm text-muted-foreground">
              {versions.length} version{versions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Versions List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 flex items-center gap-3">
            <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-muted-foreground">Loading versions...</span>
          </div>
        ) : versions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No version history yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Versions are created when you save changes
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-7 top-0 bottom-0 w-px bg-border/50" />
            
            <div className="space-y-0">
              {versions.map((version, index) => (
                <div
                  key={version.id}
                  className={`relative p-4 hover:bg-secondary/30 transition-colors ${
                    onSelectVersion ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onSelectVersion?.(version)}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-5 top-6 w-5 h-5 rounded-full bg-card border-2 border-violet-500 flex items-center justify-center z-10">
                    <div className="w-2 h-2 rounded-full bg-violet-500" />
                  </div>
                  
                  <div className="ml-12">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        Version {version.version_number}
                      </span>
                      {index === 0 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-400">
                          Latest
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(version.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {version.changed_by.slice(0, 8)}...
                      </span>
                    </div>
                    
                    {/* Content preview */}
                    <div className="mt-2 p-3 rounded-lg bg-secondary/30 border border-border/30">
                      <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">
                        {version.content || <span className="italic">Empty content</span>}
                      </p>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDate(version.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentVersions;
