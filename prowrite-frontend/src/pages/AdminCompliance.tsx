import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ComplianceDashboard } from '@/components/admin';

export function AdminCompliancePage() {
  const { data: workspace } = useQuery({
    queryKey: ['workspace'],
    queryFn: async () => {
      const response = await api.get('/workspace');
      return response.data;
    },
  });

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 md:p-6 pb-8">
        <div className="space-y-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Link to="/admin">
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-violet-500" />
                  <h1 className="text-2xl font-semibold text-foreground">Compliance Reports</h1>
                </div>
                <p className="text-muted-foreground mt-1">
                  Generate and export compliance reports for your workspace
                </p>
              </div>
            </div>
          </div>

          {/* Compliance Dashboard */}
          {workspace?.id ? (
            <ComplianceDashboard workspaceId={workspace.id} />
          ) : (
            <div className="rounded-xl border border-border/50 bg-card/50 p-12 text-center">
              <p className="text-muted-foreground">Loading workspace...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCompliancePage;
