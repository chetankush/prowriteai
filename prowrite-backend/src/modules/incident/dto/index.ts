import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export type IncidentSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export class GenerateIncidentCommsDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsEnum(['critical', 'high', 'medium', 'low'])
  severity!: IncidentSeverity;

  @IsEnum(['investigating', 'identified', 'monitoring', 'resolved'])
  status!: IncidentStatus;

  @IsString()
  impact!: string;

  @IsOptional()
  @IsString()
  eta?: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  resolution?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedServices?: string[];

  @IsOptional()
  @IsString()
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

export class UpdateIncidentDto {
  @IsOptional()
  @IsEnum(['investigating', 'identified', 'monitoring', 'resolved'])
  status?: IncidentStatus;

  @IsOptional()
  @IsString()
  update?: string;

  @IsOptional()
  @IsString()
  eta?: string;

  @IsOptional()
  @IsString()
  rootCause?: string;

  @IsOptional()
  @IsString()
  resolution?: string;
}
