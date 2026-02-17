import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Plus,
  Copy,
  Trash2,
  FileText,
  Mail,
  Briefcase,
  Video,
  Globe,
  FolderOpen,
  Check,
} from 'lucide-react';

interface Asset {
  id: string;
  title: string;
  content: string;
  asset_type: string;
  status: 'draft' | 'pending_review' | 'approved' | 'archived';
  tags: string[];
  created_at: string;
  updated_at: string;
}

const ASSET_TYPE_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  job_description: <Briefcase className="h-4 w-4" />,
  offer_letter: <FileText className="h-4 w-4" />,
  script: <Video className="h-4 w-4" />,
  landing_page: <Globe className="h-4 w-4" />,
  product_description: <FileText className="h-4 w-4" />,
  other: <FileText className="h-4 w-4" />,
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  email: 'Email',
  job_description: 'Job Description',
  offer_letter: 'Offer Letter',
  script: 'Script',
  landing_page: 'Landing Page',
  product_description: 'Product Description',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-secondary text-muted-foreground border-border',
  pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  archived: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function AssetsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newAsset, setNewAsset] = useState({
    title: '',
    content: '',
    asset_type: 'email',
    tags: '',
  });

  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ['assets', typeFilter, statusFilter, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('asset_type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      const response = await api.get(`/team/assets?${params.toString()}`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newAsset) => {
      const response = await api.post('/team/assets', {
        ...data,
        tags: data.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setIsCreateOpen(false);
      setNewAsset({ title: '', content: '', asset_type: 'email', tags: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      await api.delete(`/team/assets/${assetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setSelectedAsset(null);
    },
  });

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
          <h1 className="text-2xl font-semibold text-foreground">Asset Library</h1>
          <p className="text-muted-foreground mt-1">Save and organize your best content for reuse</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
              <Plus className="h-4 w-4" />
              New Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Asset</DialogTitle>
              <DialogDescription>Save content to your library for easy reuse</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                <Input
                  id="title"
                  value={newAsset.title}
                  onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                  placeholder="e.g., Sales Outreach Template"
                  className="mt-1.5 h-11 bg-secondary/30 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                <Select
                  value={newAsset.asset_type}
                  onValueChange={(v) => setNewAsset({ ...newAsset, asset_type: v })}
                >
                  <SelectTrigger className="mt-1.5 h-11 bg-secondary/30 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                <Textarea
                  id="content"
                  value={newAsset.content}
                  onChange={(e) => setNewAsset({ ...newAsset, content: e.target.value })}
                  placeholder="Paste your content here..."
                  rows={8}
                  className="mt-1.5 bg-secondary/30 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="tags" className="text-sm font-medium">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newAsset.tags}
                  onChange={(e) => setNewAsset({ ...newAsset, tags: e.target.value })}
                  placeholder="e.g., sales, outreach, b2b"
                  className="mt-1.5 h-11 bg-secondary/30 border-border/50"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => createMutation.mutate(newAsset)}
                  disabled={createMutation.isPending || !newAsset.title || !newAsset.content}
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Asset'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-secondary/30 border-border/50"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40 h-10 bg-secondary/30 border-border/50">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 h-10 bg-secondary/30 border-border/50">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12">
          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted-foreground">Loading assets...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-12 text-center">
          <div className="h-16 w-16 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No assets yet</h3>
          <p className="text-muted-foreground mb-6">Save your best content to the library for easy reuse</p>
          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Your First Asset
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5 cursor-pointer hover:bg-card/80 hover:border-violet-500/30 transition-all"
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {ASSET_TYPE_ICONS[asset.asset_type]}
                  <span className="text-xs">{ASSET_TYPE_LABELS[asset.asset_type]}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg border ${STATUS_COLORS[asset.status]}`}>
                  {asset.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-medium text-foreground mb-2">{asset.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{asset.content}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {asset.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-secondary/50 text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Updated {formatDate(asset.updated_at)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedAsset && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {ASSET_TYPE_ICONS[selectedAsset.asset_type]}
                  <span className="text-sm text-muted-foreground">{ASSET_TYPE_LABELS[selectedAsset.asset_type]}</span>
                  <span className={`text-xs px-2 py-1 rounded-lg border ${STATUS_COLORS[selectedAsset.status]}`}>
                    {selectedAsset.status.replace('_', ' ')}
                  </span>
                </div>
                <DialogTitle>{selectedAsset.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="rounded-xl bg-secondary/30 p-4 whitespace-pre-wrap text-sm text-foreground">
                  {selectedAsset.content}
                </div>
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  {selectedAsset.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-lg bg-secondary/50 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">Last updated {formatDate(selectedAsset.updated_at)}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedAsset.content)}
                      className="gap-2"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(selectedAsset.id)}
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}

export default AssetsPage;
