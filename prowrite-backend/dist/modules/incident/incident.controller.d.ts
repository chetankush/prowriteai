import { IncidentService } from './incident.service';
import { GenerateIncidentCommsDto, UpdateIncidentDto, IncidentCommsResponse } from './dto';
export declare class IncidentController {
    private readonly incidentService;
    constructor(incidentService: IncidentService);
    generateAllCommunications(dto: GenerateIncidentCommsDto): Promise<IncidentCommsResponse>;
    generateSlackEngineering(dto: GenerateIncidentCommsDto): Promise<{
        communication: import("./dto").IncidentCommunication;
    }>;
    generateSlackCompany(dto: GenerateIncidentCommsDto): Promise<{
        communication: import("./dto").IncidentCommunication;
    }>;
    generateCustomerEmail(dto: GenerateIncidentCommsDto): Promise<{
        communication: import("./dto").IncidentCommunication;
    }>;
    generateStatusPage(dto: GenerateIncidentCommsDto): Promise<{
        communication: import("./dto").IncidentCommunication;
    }>;
    generateExecutiveSummary(dto: GenerateIncidentCommsDto): Promise<{
        communication: import("./dto").IncidentCommunication;
    }>;
    generatePostmortem(dto: GenerateIncidentCommsDto): Promise<{
        communication: import("./dto").IncidentCommunication;
    }>;
    generateUpdateCommunications(body: {
        original: GenerateIncidentCommsDto;
        update: UpdateIncidentDto;
    }): Promise<IncidentCommsResponse>;
}
