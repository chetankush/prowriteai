/**
 * Asset Library page
 * Browse, search, and manage saved content assets
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  draft: 'bg-gray-100 text-gray-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  archived: 'bg-red-100 text-red-700',
};

export function AssetsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAsset, setNewAsset] = useState({
    title: '',
    content: '',
    asset_type: 'email',
    tags: '',
  });

  // Fetch assets
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

  // Create asset mutation
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

  // Delete asset mutation
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
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Asset Library</h1>
          <p className="text-muted-foreground">
            Save and organize your best content for reuse
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Asset</DialogTitle>
              <DialogDescription>
                Save content to your library for easy reuse
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAsset.title}
                  onChange={(e) => setNewAsset({ ...newAsset, title: e.target.value })}
                  placeholder="e.g., Sales Outreach Template"
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newAsset.asset_type}
                  onValueChange={(v) => setNewAsset({ ...newAsset, asset_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={newAsset.content}
                  onChange={(e) => setNewAsset({ ...newAsset, content: e.target.value })}
                  placeholder="Paste your content here..."
                  rows={8}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={newAsset.tags}
                  onChange={(e) => setNewAsset({ ...newAsset, tags: e.target.value })}
                  placeholder="e.g., sales, outreach, b2b"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate(newAsset)}
                  disabled={createMutation.isPending || !newAsset.title || !newAsset.content}
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Asset'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
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
        <p className="text-muted-foreground">Loading assets...</p>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-4">
              Save your best content to the library for easy reuse
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Asset
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setSelectedAsset(asset)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {ASSET_TYPE_ICONS[asset.asset_type]}
                    <span className="text-xs text-muted-foreground">
                      {ASSET_TYPE_LABELS[asset.asset_type]}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[asset.status]}`}
                  >
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
                <CardTitle className="text-base mt-2">{asset.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {asset.content}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {asset.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Updated {formatDate(asset.updated_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Asset Detail Dialog */}
      <Dialog open={!!selectedAsset} onOpenChange={() => setSelectedAsset(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedAsset && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  {ASSET_TYPE_ICONS[selectedAsset.asset_type]}
                  <span className="text-sm text-muted-foreground">
                    {ASSET_TYPE_LABELS[selectedAsset.asset_type]}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[selectedAsset.status]}`}
                  >
                    {selectedAsset.status.replace('_', ' ')}
                  </span>
                </div>
                <DialogTitle>{selectedAsset.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm">
                  {selectedAsset.content}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {selectedAsset.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-6">
                  <p className="text-xs text-muted-foreground">
                    Last updated {formatDate(selectedAsset.updated_at)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedAsset.content)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMutation.mutate(selectedAsset.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
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
  );
}

export default AssetsPage;
