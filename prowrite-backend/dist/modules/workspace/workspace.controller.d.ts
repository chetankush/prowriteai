import { WorkspaceService } from './workspace.service';
import { UpdateWorkspaceDto, WorkspaceResponseDto, UsageStatsDto } from './dto';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
export declare class WorkspaceController {
    private readonly workspaceService;
    constructor(workspaceService: WorkspaceService);
    getWorkspace(req: AuthenticatedRequest): Promise<WorkspaceResponseDto>;
    updateWorkspace(updateDto: UpdateWorkspaceDto, req: AuthenticatedRequest): Promise<WorkspaceResponseDto>;
    getUsage(req: AuthenticatedRequest): Promise<UsageStatsDto>;
    private toResponseDto;
}
