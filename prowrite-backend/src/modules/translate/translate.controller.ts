import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { TranslateService } from './translate.service';
import { TranslateTextDto, TranslateResponse, TranslatedVersion } from './dto';
import { AuthGuard, WorkspaceGuard } from '@common/guards';

@Controller('api/translate')
@UseGuards(AuthGuard, WorkspaceGuard)
export class TranslateController {
  constructor(private readonly translateService: TranslateService) {}

  /**
   * POST /api/translate
   * Translate text for all audiences at once
   */
  @Post()
  async translateForAll(@Body() dto: TranslateTextDto): Promise<TranslateResponse> {
    return this.translateService.translateForAllAudiences(dto);
  }

  /**
   * POST /api/translate/:audience
   * Translate text for a specific audience
   */
  @Post(':audience')
  async translateForAudience(
    @Param('audience') audience: string,
    @Body() dto: TranslateTextDto,
  ): Promise<{ translation: TranslatedVersion }> {
    const translation = await this.translateService.translateForAudience(dto, audience);
    return { translation };
  }
}
