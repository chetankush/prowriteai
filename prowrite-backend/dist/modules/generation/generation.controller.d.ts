import { GenerationService } from './generation.service';
import { GenerateRequestDto, GenerationResponseDto } from './dto';
import { AuthenticatedRequest } from '@modules/auth/auth.controller';
export declare class GenerationController {
    private readonly generationService;
    constructor(generationService: GenerationService);
    generateContent(generateRequestDto: GenerateRequestDto, req: AuthenticatedRequest): Promise<GenerationResponseDto>;
    listGenerations(req: AuthenticatedRequest): Promise<GenerationResponseDto[]>;
    getGeneration(id: string, req: AuthenticatedRequest): Promise<GenerationResponseDto>;
    deleteGeneration(id: string, req: AuthenticatedRequest): Promise<{
        success: boolean;
    }>;
    regenerateContent(id: string, req: AuthenticatedRequest): Promise<GenerationResponseDto>;
    private toResponseDto;
}
