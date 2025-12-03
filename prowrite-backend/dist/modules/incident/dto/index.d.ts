export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';
export declare class GenerateIncidentCommsDto {
    title: string;
    description: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    impact: string;
    eta?: string;
    rootCause?: string;
    resolution?: string;
    affectedServices?: string[];
    companyName?: string;
}
export interface IncidentCommunication {
    type: 'slack_engineering' | 'slack_company' | 'customer_email' | 'status_page' | 'executive_summary' | 'postmortem_template';
    title: string;
    content: string;
    audience: string;
    tone: string;
}
export interface IncidentCommsResponse {
    incident: {
        title: string;
        severity: IncidentSeverity;
        status: IncidentStatus;
    };
    communications: IncidentCommunication[];
    generatedAt: Date;
}
export declare class UpdateIncidentDto {
    status?: IncidentStatus;
    update?: string;
    eta?: string;
    rootCause?: string;
    resolution?: string;
}
