import { TranslateService } from './translate.service';
import { TranslateTextDto, TranslateResponse, TranslatedVersion } from './dto';
export declare class TranslateController {
    private readonly translateService;
    constructor(translateService: TranslateService);
    translateForAll(dto: TranslateTextDto): Promise<TranslateResponse>;
    translateForAudience(audience: string, dto: TranslateTextDto): Promise<{
        translation: TranslatedVersion;
    }>;
}
