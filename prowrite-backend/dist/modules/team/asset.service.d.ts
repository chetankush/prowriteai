import { SupabaseService } from '@common/database';
import { TeamService } from './team.service';
import { CreateAssetDto, UpdateAssetDto, AssetResponseDto, AssetVersionResponseDto, AssetStatus } from './dto';
export declare class AssetService {
    private readonly supabaseService;
    private readonly teamService;
    constructor(supabaseService: SupabaseService, teamService: TeamService);
    createAsset(workspaceId: string, userId: string, dto: CreateAssetDto): Promise<AssetResponseDto>;
    getAssets(workspaceId: string, filters?: {
        asset_type?: string;
        status?: AssetStatus;
        tags?: string[];
        search?: string;
    }): Promise<AssetResponseDto[]>;
    getAsset(workspaceId: string, assetId: string): Promise<AssetResponseDto>;
    updateAsset(workspaceId: string, assetId: string, userId: string, dto: UpdateAssetDto): Promise<AssetResponseDto>;
    deleteAsset(workspaceId: string, assetId: string, userId: string): Promise<void>;
    getAssetVersions(assetId: string): Promise<AssetVersionResponseDto[]>;
    restoreVersion(workspaceId: string, assetId: string, versionId: string, userId: string): Promise<AssetResponseDto>;
    private createVersion;
    private toAssetResponse;
}
