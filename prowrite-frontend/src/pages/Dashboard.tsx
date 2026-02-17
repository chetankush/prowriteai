import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, Navigate } from 'react-router-dom';
import { isOnboardingComplete, getOnboardingUseCases } from './Onboarding';
import {
  Mail,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Zap,
  Shield,
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  Lock,
  History,
  FileText,
  UserCheck,
  Globe,
  Video,
  Code,
  Languages,
  AlertTriangle,
  Star,
  type LucideIcon,
} from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

const MODULE_COLORS: Record<string, string> = {
  cold_email: 'from-blue-500 to-cyan-500',
  hr_docs: 'from-green-500 to-emerald-500',
  youtube_scripts: 'from-red-500 to-pink-500',
  website_copy: 'from-purple-500 to-violet-500',
};

interface TemplateModule {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: LucideIcon;
  gradient: string;
  hoverBorder: string;
  shadowColor: string;
}

const ALL_TEMPLATES: TemplateModule[] = [
  {
    id: 'cold_email',
    label: 'Cold Email',
    description: 'Outreach & sales emails',
    path: '/cold-email',
    icon: Mail,
    gradient: 'from-blue-500 to-cyan-500',
    hoverBorder: 'hover:border-blue-500/30',
    shadowColor: 'shadow-blue-500/20',
  },
  {
    id: 'hr_docs',
    label: 'HR Docs',
    description: 'Policies & onboarding',
    path: '/hr-docs',
    icon: UserCheck,
    gradient: 'from-green-500 to-emerald-500',
    hoverBorder: 'hover:border-green-500/30',
    shadowColor: 'shadow-green-500/20',
  },
  {
    id: 'website_copy',
    label: 'Website Copy',
    description: 'Landing pages & content',
    path: '/website-copy',
    icon: Globe,
    gradient: 'from-purple-500 to-violet-500',
    hoverBorder: 'hover:border-purple-500/30',
    shadowColor: 'shadow-purple-500/20',
  },
  {
    id: 'youtube_scripts',
    label: 'YouTube Scripts',
    description: 'Video scripts & hooks',
    path: '/youtube-scripts',
    icon: Video,
    gradient: 'from-red-500 to-pink-500',
    hoverBorder: 'hover:border-red-500/30',
    shadowColor: 'shadow-red-500/20',
  },
  {
    id: 'software_docs',
    label: 'Software Docs',
    description: 'Technical documentation',
    path: '/software-docs',
    icon: Code,
    gradient: 'from-orange-500 to-amber-500',
    hoverBorder: 'hover:border-orange-500/30',
    shadowColor: 'shadow-orange-500/20',
  },
  {
    id: 'incident',
    label: 'Incident Hub',
    description: 'Incident documentation',
    path: '/incident-hub',
    icon: AlertTriangle,
    gradient: 'from-yellow-500 to-orange-500',
    hoverBorder: 'hover:border-yellow-500/30',
    shadowColor: 'shadow-yellow-500/20',
  },
  {
    id: 'translation',
    label: 'Translation',
    description: 'Content translation',
    path: '/translate',
    icon: Languages,
    gradient: 'from-teal-500 to-cyan-500',
    hoverBorder: 'hover:border-teal-500/30',
    shadowColor: 'shadow-teal-500/20',
  },
  {
    id: 'bulk',
    label: 'Bulk Generation',
    description: 'CSV upload & mail merge',
    path: '/personalization',
    icon: Sparkles,
    gradient: 'from-cyan-500 to-teal-500',
    hoverBorder: 'hover:border-cyan-500/30',
    shadowColor: 'shadow-cyan-500/20',
  },
];

export function DashboardPage() {
  const selectedUseCases = useMemo(() => getOnboardingUseCases(), []);
  const hasSelections = selectedUseCases.length > 0;

  const { recommended, other } = useMemo(() => {
    if (!hasSelections) return { recommended: [], other: ALL_TEMPLATES };
    const rec: TemplateModule[] = [];
    const oth: TemplateModule[] = [];
    for (const tpl of ALL_TEMPLATES) {
      if (selectedUseCases.includes(tpl.id)) {
        rec.push(tpl);
      } else {
        oth.push(tpl);
      }
    }
    return { recommended: rec, other: oth };
  }, [selectedUseCases, hasSelections]);

  const { data: usageStats, isLoading: usageLoading } = useQuery<UsageStats>({
    queryKey: ['workspace-usage'],
    queryFn: async () => {
      const response = await api.get('/workspace/usage');
      return response.data;
    },
  });

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<Conversation[]>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/chat/conversations');
      return response.data;
    },
  });

  if (!isOnboardingComplete()) {
    return <Navigate to="/onboarding" replace />
  }

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
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground mt-1">
                Your AI-powered content platform with enterprise governance
              </p>
            </div>
            <Link to="/documents">
              <Button className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg shadow-violet-500/25">
                <FileCheck className="h-4 w-4" />
                View Documents
              </Button>
            </Link>
          </div>

          {/* Core Value Props - Why Pay Section */}
          <div className="rounded-xl border border-violet-500/30 bg-gradient-to-br from-violet-500/5 to-purple-600/5 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Enterprise Governance</h2>
                <p className="text-sm text-muted-foreground">What ChatGPT Teams can't do</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Link to="/documents" className="group">
                <div className="rounded-lg border border-border/50 bg-card/80 p-4 hover:border-green-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="font-medium text-foreground">Enforced Approvals</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Draft → Review → Approved workflow. No unapproved content goes out.
                  </p>
                </div>
              </Link>
              <Link to="/admin" className="group">
                <div className="rounded-lg border border-border/50 bg-card/80 p-4 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <History className="h-5 w-5 text-blue-400" />
                    <span className="font-medium text-foreground">Audit Trails</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Who created, edited, approved - with timestamps. Legal-grade compliance.
                  </p>
                </div>
              </Link>
              <Link to="/billing" className="group">
                <div className="rounded-lg border border-border/50 bg-card/80 p-4 hover:border-amber-500/50 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Lock className="h-5 w-5 text-amber-400" />
                    <span className="font-medium text-foreground">Billing Controls</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Only admins can add seats. No surprise charges from rogue invites.
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-4">
            {/* Usage Card */}
            <div className="rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-violet-400" />
                </div>
                <span className="text-xs font-medium text-muted-foreground uppercase">Usage</span>
              </div>
              {usageLoading ? (
                <div className="h-7 w-20 bg-secondary/50 rounded animate-pulse" />
              ) : (
                <>
                  <p className="text-2xl font-bold text-foreground">
                    {usageStats?.usage_count ?? 0}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{usageStats?.usage_limit ?? 100}
                    </span>
                  </p>
                  <div className="w-full bg-secondary/50 rounded-full h-1 mt-2">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-600 h-1 rounded-full"
                      style={{ width: `${Math.min(usageStats?.percentage_used ?? 0, 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Documents Card */}
            <Link to="/documents" className="group">
              <div className="rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm hover:border-green-500/30 transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase">Docs</span>
                </div>
                <p className="text-2xl font-bold text-foreground group-hover:text-green-400 transition-colors">
                  Manage
                </p>
                <p className="text-xs text-muted-foreground">View & approve</p>
              </div>
            </Link>

            {/* Approvals Card */}
            <Link to="/approvals" className="group">
              <div className="rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm hover:border-amber-500/30 transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase">Pending</span>
                </div>
                <p className="text-2xl font-bold text-foreground group-hover:text-amber-400 transition-colors">
                  Review
                </p>
                <p className="text-xs text-muted-foreground">Approval queue</p>
              </div>
            </Link>

            {/* Admin Card */}
            <Link to="/admin" className="group">
              <div className="rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm hover:border-blue-500/30 transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground uppercase">Admin</span>
                </div>
                <p className="text-2xl font-bold text-foreground group-hover:text-blue-400 transition-colors">
                  Dashboard
                </p>
                <p className="text-xs text-muted-foreground">Stats & compliance</p>
              </div>
            </Link>
          </div>

          {/* Specialized AI Templates — Personalized */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Specialized AI Templates</h2>
                <p className="text-sm text-muted-foreground">
                  {hasSelections
                    ? 'Personalized based on your setup — your picks are highlighted'
                    : 'Fill-in-the-blanks templates that generate 90% of the work'}
                </p>
              </div>
              <Link to="/hr-docs" className="text-sm text-primary hover:underline">
                View all templates
              </Link>
            </div>

            {/* Recommended Section */}
            {recommended.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span className="text-sm font-medium text-foreground">Recommended for you</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recommended.map((tpl) => (
                    <TemplateCard key={tpl.id} template={tpl} isRecommended />
                  ))}
                </div>
              </div>
            )}

            {/* Other Templates */}
            {other.length > 0 && (
              <div>
                {hasSelections && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-muted-foreground">More templates</span>
                  </div>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {other.map((tpl) => (
                    <TemplateCard key={tpl.id} template={tpl} isRecommended={false} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Team Productivity Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Real-time Collaboration */}
            <Link to="/documents" className="group">
              <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover:border-violet-500/30 transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      Real-Time Co-Editing
                    </h3>
                    <p className="text-xs text-muted-foreground">Google Docs style collaboration</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Multiple team members can edit the same document simultaneously. No more
                  "Project_Plan_V3_FINAL_REAL.docx" chaos.
                </p>
              </div>
            </Link>

            {/* Team Workspace */}
            <Link to="/team" className="group">
              <div className="rounded-xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm hover:border-emerald-500/30 transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-600/20 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      Shared Team Workspace
                    </h3>
                    <p className="text-xs text-muted-foreground">Company owns the data</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Central library for all company documents. If an employee leaves, their documents
                  stay with the company.
                </p>
              </div>
            </Link>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Conversations</h2>
              {recentActivity.length > 0 && (
                <Link to="/cold-email" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              )}
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
              {conversationsLoading ? (
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-secondary/50 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse" />
                          <div className="h-3 w-48 bg-secondary/50 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="h-12 w-12 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">No conversations yet</p>
                  <Link to={recommended.length > 0 ? recommended[0].path : '/cold-email'}>
                    <Button variant="outline" size="sm">
                      Start your first chat
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentActivity.map((conversation) => (
                    <Link
                      key={conversation.id}
                      to={`/${conversation.module_type.replace('_', '-')}`}
                      className="flex items-center gap-4 p-4 hover:bg-secondary/30 transition-colors"
                    >
                      <div
                        className={`h-10 w-10 rounded-lg bg-gradient-to-br ${MODULE_COLORS[conversation.module_type] || 'from-gray-500 to-gray-600'} flex items-center justify-center shadow-lg`}
                      >
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {conversation.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {MODULE_LABELS[conversation.module_type] || conversation.module_type}
                          </span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(conversation.updated_at)}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, isRecommended }: { template: TemplateModule; isRecommended: boolean }) {
  const Icon = template.icon;
  return (
    <Link to={template.path} className="group">
      <div
        className={cn(
          'rounded-xl border bg-card/50 p-5 backdrop-blur-sm hover:bg-card/80 transition-all relative',
          isRecommended
            ? 'border-violet-500/40 ring-1 ring-violet-500/20 shadow-md shadow-violet-500/5'
            : 'border-border/50',
          template.hoverBorder
        )}
      >
        {isRecommended && (
          <div className="absolute -top-2.5 right-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            <Star className="h-2.5 w-2.5" />
            Recommended
          </div>
        )}
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg',
              template.gradient,
              template.shadowColor
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
              {template.label}
            </h3>
            <p className="text-sm text-muted-foreground">{template.description}</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
}

export default DashboardPage;
