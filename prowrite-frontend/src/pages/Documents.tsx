import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle,
  Archive,
  Filter,
  Search,
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
  pending_approval: { label: 'Pending', icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
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


export function DocumentsPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocType, setNewDocType] = useState<DocumentType>('other');

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery<Document[]>({
    queryKey: ['documents', statusFilter],
    queryFn: async () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await api.get(`/documents${params}`);
      return response.data;
    },
  });

  // Create document mutation
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; type: DocumentType; content?: string }) => {
      const response = await api.post('/documents', data);
      return response.data;
    },
    onSuccess: (newDoc) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      setIsCreateDialogOpen(false);
      setNewDocName('');
      setNewDocType('other');
      navigate(`/documents/${newDoc.id}`);
    },
  });

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDocName.trim()) {
      createMutation.mutate({ name: newDocName.trim(), type: newDocType });
    }
  };

  // Filter documents by search query
  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Count documents by status
  const statusCounts = documents.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Documents</h1>
              <p className="text-muted-foreground mt-1">Manage your generated content and track approvals</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                  <Plus className="h-4 w-4" />
                  New Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Document</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDocument} className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="doc-name">Document Name</Label>
                    <Input
                      id="doc-name"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Enter document name"
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="doc-type">Document Type</Label>
                    <Select value={newDocType} onValueChange={(v: DocumentType) => setNewDocType(v)}>
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Creating...' : 'Create'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>


          {/* Status Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            {(Object.entries(STATUS_CONFIG) as [DocumentStatus, typeof STATUS_CONFIG[DocumentStatus]][]).map(([status, config]) => {
              const Icon = config.icon;
              const count = statusCounts[status] || 0;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    statusFilter === status
                      ? 'border-violet-500/50 bg-violet-500/10'
                      : 'border-border/50 bg-card/50 hover:bg-card/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{count}</p>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/30 border-border/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v: DocumentStatus | 'all') => setStatusFilter(v)}>
              <SelectTrigger className="w-44 bg-secondary/30 border-border/50">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Documents List */}
          <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">All Documents</h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
                    {statusFilter !== 'all' && ` • ${STATUS_CONFIG[statusFilter].label}`}
                  </p>
                </div>
              </div>
            </div>


            {isLoading ? (
              <div className="p-6 flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-muted-foreground">Loading documents...</span>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'No documents match your search' : 'No documents yet'}
                </p>
                {!searchQuery && (
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)}>
                    Create your first document
                  </Button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {filteredDocuments.map((doc) => {
                  const statusConfig = STATUS_CONFIG[doc.status];
                  const StatusIcon = statusConfig.icon;
                  return (
                    <Link
                      key={doc.id}
                      to={`/documents/${doc.id}`}
                      className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`h-10 w-10 rounded-lg ${statusConfig.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">{TYPE_LABELS[doc.type]}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{formatDate(doc.updated_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg ${statusConfig.bgColor} ${statusConfig.color} border border-current/20`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentsPage;
