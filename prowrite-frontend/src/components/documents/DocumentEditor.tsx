import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRealtimeDocument } from '@/hooks';
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle,
  Archive,
  Clock,
  FileText,
  History,
  AlertCircle,
  Wifi,
  WifiOff,
  Loader2,
} from 'lucide-react';

// Document types matching backend
type DocumentStatus = 'draft' | 'pending_approval' | 'approved' | 'archived';
type DocumentType = 'cold_email' | 'hr_onboarding' | 'website_copy' | 'youtube_script' | 'software_docs' | 'other';

interface Document {
  id: string;
  workspace_id: string;
  name: string;
  type: DocumentType;
  content: string | null;
  status: DocumentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const STATUS_CONFIG: Record<DocumentStatus, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'text-gray-400', bgColor: 'bg-gray-500/10' },
  pending_approval: { label: 'Pending Approval', icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
  approved: { label: 'Approved', icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  archived: { label: 'Archived', icon: Archive, color: 'text-slate-400', bgColor: 'bg-slate-500/10' },
};

const TYPE_LABELS: Record<DocumentType, string> = {
  cold_email: 'Cold Email',
  hr_onboarding: 'HR Onboarding',
  website_copy: 'Website Copy',
  youtube_script: 'YouTube Script',
  software_docs: 'Software Docs',
  other: 'Other',
};

// Valid status transitions
const VALID_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  draft: ['pending_approval', 'archived'],
  pending_approval: ['approved', 'draft'],
  approved: ['archived'],
  archived: [],
};

interface DocumentEditorProps {
  onShowVersions?: () => void;
}


export function DocumentEditor({ onShowVersions }: DocumentEditorProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [showRemoteUpdateNotice, setShowRemoteUpdateNotice] = useState(false);

  // Handle remote updates from other users (Requirements: 7.1, 7.2, 7.3)
  const handleRemoteUpdate = useCallback((updatedDoc: Document) => {
    // Update the query cache with the new document data
    queryClient.setQueryData(['document', id], updatedDoc);
    
    // Show a notice that the document was updated by another user
    setShowRemoteUpdateNotice(true);
    setTimeout(() => setShowRemoteUpdateNotice(false), 3000);
  }, [id, queryClient]);

  // Subscribe to real-time document updates (Requirements: 7.1, 7.2, 7.3)
  const { isConnected, isSaving, setSaving } = useRealtimeDocument(id, {
    onRemoteUpdate: handleRemoteUpdate,
    onDelete: () => {
      // Navigate back to documents list if document is deleted
      navigate('/documents');
    },
  });

  // Fetch document
  const { data: document, isLoading, error } = useQuery<Document>({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  // Initialize form when document loads
  useEffect(() => {
    if (document) {
      setName(document.name);
      setContent(document.content || '');
      setHasChanges(false);
    }
  }, [document]);

  // Update document mutation with "Saving..." indicator (Requirement 7.4)
  const updateMutation = useMutation({
    mutationFn: async (data: { name?: string; content?: string }) => {
      setSaving(true);
      const response = await api.put(`/documents/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setHasChanges(false);
      setSaving(false);
    },
    onError: () => {
      setSaving(false);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (status: DocumentStatus) => {
      const response = await api.patch(`/documents/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  const handleSave = () => {
    if (document?.status !== 'draft') return;
    updateMutation.mutate({ name, content });
  };

  const handleStatusChange = (newStatus: DocumentStatus) => {
    updateStatusMutation.mutate(newStatus);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setHasChanges(true);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  const canEdit = document?.status === 'draft';
  const availableTransitions = document ? VALID_TRANSITIONS[document.status] : [];

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading document...</span>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive/50 mb-4" />
          <p className="text-muted-foreground mb-4">Document not found</p>
          <Button variant="outline" onClick={() => navigate('/documents')}>
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[document.status];
  const StatusIcon = statusConfig.icon;


  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/documents')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center`}>
                <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded ${statusConfig.bgColor} ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">{TYPE_LABELS[document.type]}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Real-time connection status indicator */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {isConnected ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-green-400" />
                  <span className="hidden sm:inline">Live</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
            
            {/* Saving indicator (Requirement 7.4) */}
            {isSaving && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-pulse">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            
            {onShowVersions && (
              <Button variant="outline" size="sm" onClick={onShowVersions} className="gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            )}
            {canEdit && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending || isSaving}
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              >
                <Save className="h-4 w-4" />
                {updateMutation.isPending || isSaving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Remote update notification (Requirement 7.3) */}
        {showRemoteUpdateNotice && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
              <Wifi className="h-3.5 w-3.5" />
              <span>Document updated by another user</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Document Name */}
          <div>
            {canEdit ? (
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-2xl font-semibold h-auto py-2 px-0 border-0 border-b border-transparent focus:border-border bg-transparent"
                placeholder="Document name"
              />
            ) : (
              <h1 className="text-2xl font-semibold text-foreground">{document.name}</h1>
            )}
          </div>

          {/* Non-editable warning */}
          {!canEdit && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-200">
                This document is {document.status.replace('_', ' ')} and cannot be edited.
                {document.status === 'pending_approval' && ' It must be approved or rejected first.'}
              </p>
            </div>
          )}

          {/* Document Content */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h2 className="text-sm font-medium text-muted-foreground">Content</h2>
            </div>
            <div className="p-4">
              {canEdit ? (
                <Textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  className="min-h-[400px] resize-none bg-transparent border-0 focus-visible:ring-0 p-0"
                  placeholder="Start writing your document content..."
                />
              ) : (
                <div className="min-h-[400px] whitespace-pre-wrap text-foreground">
                  {document.content || <span className="text-muted-foreground italic">No content</span>}
                </div>
              )}
            </div>
          </div>


          {/* Status Actions */}
          {availableTransitions.length > 0 && (
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h2 className="text-sm font-medium text-muted-foreground">Actions</h2>
              </div>
              <div className="p-4 flex flex-wrap gap-3">
                {availableTransitions.includes('pending_approval') && (
                  <Button
                    onClick={() => handleStatusChange('pending_approval')}
                    disabled={updateStatusMutation.isPending}
                    className="gap-2"
                    variant="outline"
                  >
                    <Send className="h-4 w-4" />
                    Submit for Approval
                  </Button>
                )}
                {availableTransitions.includes('approved') && (
                  <Button
                    onClick={() => handleStatusChange('approved')}
                    disabled={updateStatusMutation.isPending}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                )}
                {availableTransitions.includes('draft') && (
                  <Button
                    onClick={() => handleStatusChange('draft')}
                    disabled={updateStatusMutation.isPending}
                    variant="outline"
                    className="gap-2"
                  >
                    <FileText className="h-4 w-4" />
                    Reject (Return to Draft)
                  </Button>
                )}
                {availableTransitions.includes('archived') && (
                  <Button
                    onClick={() => handleStatusChange('archived')}
                    disabled={updateStatusMutation.isPending}
                    variant="outline"
                    className="gap-2 text-slate-400 hover:text-slate-300"
                  >
                    <Archive className="h-4 w-4" />
                    Archive
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-muted-foreground">
            <p>Created: {new Date(document.created_at).toLocaleString()}</p>
            <p>Last updated: {new Date(document.updated_at).toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentEditor;
