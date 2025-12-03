import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IncidentService } from './incident.service';
import { GenerateIncidentCommsDto, UpdateIncidentDto, IncidentCommsResponse } from './dto';
import { AuthGuard, WorkspaceGuard } from '@common/guards';

@Controller('api/incident')
@UseGuards(AuthGuard, WorkspaceGuard)
export class IncidentController {
  constructor(private readonly incidentService: IncidentService) {}

  /**
   * POST /api/incident/generate
   * Generate all incident communications from a single input
   */
  @Post('generate')
  async generateAllCommunications(
    @Body() dto: GenerateIncidentCommsDto,
  ): Promise<IncidentCommsResponse> {
    return this.incidentService.generateAllCommunications(dto);
  }

  /**
   * POST /api/incident/generate/slack-engineering
   * Generate only Slack engineering message
   */
  @Post('generate/slack-engineering')
  async generateSlackEngineering(@Body() dto: GenerateIncidentCommsDto) {
    const comm = await this.incidentService.generateSlackEngineering(dto);
    return { communication: comm };
  }

  /**
   * POST /api/incident/generate/slack-company
   * Generate only company-wide Slack message
   */
  @Post('generate/slack-company')
  async generateSlackCompany(@Body() dto: GenerateIncidentCommsDto) {
    const comm = await this.incidentService.generateSlackCompany(dto);
    return { communication: comm };
  }

  /**
   * POST /api/incident/generate/customer-email
   * Generate only customer email
   */
  @Post('generate/customer-email')
  async generateCustomerEmail(@Body() dto: GenerateIncidentCommsDto) {
    const comm = await this.incidentService.generateCustomerEmail(dto);
    return { communication: comm };
  }

  /**
   * POST /api/incident/generate/status-page
   * Generate only status page update
   */
  @Post('generate/status-page')
  async generateStatusPage(@Body() dto: GenerateIncidentCommsDto) {
    const comm = await this.incidentService.generateStatusPage(dto);
    return { communication: comm };
  }

  /**
   * POST /api/incident/generate/executive-summary
   * Generate only executive summary
   */
  @Post('generate/executive-summary')
  async generateExecutiveSummary(@Body() dto: GenerateIncidentCommsDto) {
    const comm = await this.incidentService.generateExecutiveSummary(dto);
    return { communication: comm };
  }

  /**
   * POST /api/incident/generate/postmortem
   * Generate only postmortem template
   */
  @Post('generate/postmortem')
  async generatePostmortem(@Body() dto: GenerateIncidentCommsDto) {
    const comm = await this.incidentService.generatePostmortemTemplate(dto);
    return { communication: comm };
  }

  /**
   * POST /api/incident/update
   * Generate update communications when incident status changes
   */
  @Post('update')
  async generateUpdateCommunications(
    @Body() body: { original: GenerateIncidentCommsDto; update: UpdateIncidentDto },
  ): Promise<IncidentCommsResponse> {
    return this.incidentService.generateUpdateCommunications(body.original, body.update);
  }
}
