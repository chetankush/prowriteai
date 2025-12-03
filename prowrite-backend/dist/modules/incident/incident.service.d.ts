import { GeminiService } from '../generation/gemini.service';
import { GenerateIncidentCommsDto, IncidentCommunication, IncidentCommsResponse, UpdateIncidentDto } from './dto';
export declare class IncidentService {
    private readonly geminiService;
    constructor(geminiService: GeminiService);
    generateAllCommunications(dto: GenerateIncidentCommsDto): Promise<IncidentCommsResponse>;
    generateSlackEngineering(dto: GenerateIncidentCommsDto): Promise<IncidentCommunication>;
    generateSlackCompany(dto: GenerateIncidentCommsDto): Promise<IncidentCommunication>;
    generateCustomerEmail(dto: GenerateIncidentCommsDto): Promise<IncidentCommunication>;
    generateStatusPage(dto: GenerateIncidentCommsDto): Promise<IncidentCommunication>;
    generateExecutiveSummary(dto: GenerateIncidentCommsDto): Promise<IncidentCommunication>;
    generatePostmortemTemplate(dto: GenerateIncidentCommsDto): Promise<IncidentCommunication>;
    generateUpdateCommunications(originalDto: GenerateIncidentCommsDto, updateDto: UpdateIncidentDto): Promise<IncidentCommsResponse>;
    private getSeverityEmoji;
    private getStatusEmoji;
}
