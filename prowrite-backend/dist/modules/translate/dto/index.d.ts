export declare class TranslateTextDto {
    text: string;
    context?: string;
}
export interface TranslatedVersion {
    audience: string;
    description: string;
    icon: string;
    content: string;
}
export interface TranslateResponse {
    original: string;
    translations: TranslatedVersion[];
    generatedAt: Date;
}
