import { SupabaseService, WorkspaceRow } from '@common/database';
import { UpdateWorkspaceDto } from './dto';
export declare class WorkspaceService {
    private readonly supabaseService;
    constructor(supabaseService: SupabaseService);
    getWorkspace(workspaceId: string, requestingWorkspaceId: string): Promise<WorkspaceRow>;
    getWorkspaceById(workspaceId: string): Promise<WorkspaceRow>;
    updateWorkspace(workspaceId: string, requestingWorkspaceId: string, data: UpdateWorkspaceDto): Promise<WorkspaceRow>;
    incrementUsage(workspaceId: string): Promise<void>;
    checkUsageLimit(workspaceId: string): Promise<boolean>;
    getUsageStats(workspaceId: string, requestingWorkspaceId: string): Promise<{
        usage_count: number;
        usage_limit: number;
        remaining: number;
        percentage_used: number;
    }>;
}
