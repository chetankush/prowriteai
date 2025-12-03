import { SupabaseService } from '@common/database';
import { TeamService } from './team.service';
import { CreatePersonalizationSetDto, BulkPersonalizationDto, PersonalizationSetResponseDto } from './dto';
export declare class PersonalizationService {
    private readonly supabaseService;
    private readonly teamService;
    constructor(supabaseService: SupabaseService, teamService: TeamService);
    createPersonalizationSet(workspaceId: string, userId: string, dto: CreatePersonalizationSetDto): Promise<PersonalizationSetResponseDto>;
    getPersonalizationSets(workspaceId: string): Promise<PersonalizationSetResponseDto[]>;
    getPersonalizationSet(workspaceId: string, setId: string): Promise<PersonalizationSetResponseDto>;
    deletePersonalizationSet(workspaceId: string, setId: string): Promise<void>;
    applyPersonalization(template: string, variables: Record<string, string>): string;
    bulkPersonalize(dto: BulkPersonalizationDto): string[];
    extractVariables(template: string): string[];
    validateVariables(template: string, variables: Record<string, string>): {
        valid: boolean;
        missing: string[];
    };
    parseCSV(csvContent: string): Record<string, string>[];
    private parseCSVLine;
    generateCSVExport(recipients: Record<string, string>[], personalizedContent: string[]): string;
    private escapeCSVValue;
    private toPersonalizationSetResponse;
}
