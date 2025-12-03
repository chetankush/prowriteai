import { IsString, IsOptional, IsArray } from 'class-validator';

export class TranslateTextDto {
  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  context?: string; // Optional context about what this text is about
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
