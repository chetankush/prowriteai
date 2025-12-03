import { GeminiService } from '../generation/gemini.service';
import { TranslateTextDto, TranslatedVersion, TranslateResponse } from './dto';
export declare class TranslateService {
    private readonly geminiService;
    constructor(geminiService: GeminiService);
    translateForAllAudiences(dto: TranslateTextDto): Promise<TranslateResponse>;
    translateForManager(dto: TranslateTextDto): Promise<TranslatedVersion>;
    translateForExecutive(dto: TranslateTextDto): Promise<TranslatedVersion>;
    translateForCustomer(dto: TranslateTextDto): Promise<TranslatedVersion>;
    translateForTechnical(dto: TranslateTextDto): Promise<TranslatedVersion>;
    translateForSlack(dto: TranslateTextDto): Promise<TranslatedVersion>;
    translateForEmail(dto: TranslateTextDto): Promise<TranslatedVersion>;
    translateForAudience(dto: TranslateTextDto, audience: string): Promise<TranslatedVersion>;
}
