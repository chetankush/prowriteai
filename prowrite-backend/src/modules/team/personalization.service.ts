import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '@common/database';
import { TeamService } from './team.service';
import {
  CreatePersonalizationSetDto,
  BulkPersonalizationDto,
  PersonalizationSetResponseDto,
  PersonalizationVariable,
} from './dto';

@Injectable()
export class PersonalizationService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly teamService: TeamService,
  ) {}

  /**
   * Create a personalization set (saved variables for reuse)
   */
  async createPersonalizationSet(
    workspaceId: string,
    userId: string,
    dto: CreatePersonalizationSetDto,
  ): Promise<PersonalizationSetResponseDto> {
    const { data, error } = await this.supabaseService.client
      .from('personalization_sets')
      .insert({
        workspace_id: workspaceId,
        name: dto.name,
        description: dto.description,
        variables: dto.variables,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create personalization set: ${error.message}`);
    }

    return this.toPersonalizationSetResponse(data);
  }

  /**
   * Get all personalization sets for a workspace
   */
  async getPersonalizationSets(workspaceId: string): Promise<PersonalizationSetResponseDto[]> {
    const { data, error } = await this.supabaseService.client
      .from('personalization_sets')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch personalization sets: ${error.message}`);
    }

    return (data || []).map(this.toPersonalizationSetResponse);
  }

  /**
   * Get a single personalization set
   */
  async getPersonalizationSet(
    workspaceId: string,
    setId: string,
  ): Promise<PersonalizationSetResponseDto> {
    const { data, error } = await this.supabaseService.client
      .from('personalization_sets')
      .select('*')
      .eq('id', setId)
      .eq('workspace_id', workspaceId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Personalization set not found');
    }

    return this.toPersonalizationSetResponse(data);
  }

  /**
   * Delete a personalization set
   */
  async deletePersonalizationSet(
    workspaceId: string,
    setId: string,
  ): Promise<void> {
    const { error } = await this.supabaseService.client
      .from('personalization_sets')
      .delete()
      .eq('id', setId)
      .eq('workspace_id', workspaceId);

    if (error) {
      throw new Error(`Failed to delete personalization set: ${error.message}`);
    }
  }

  /**
   * Apply personalization to a template
   * Replaces {{variable_name}} with actual values
   */
  applyPersonalization(
    template: string,
    variables: Record<string, string>,
  ): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
      result = result.replace(regex, value);
    }

    return result;
  }

  /**
   * Bulk personalization - generate multiple versions from a template
   */
  bulkPersonalize(dto: BulkPersonalizationDto): string[] {
    if (!dto.recipients || dto.recipients.length === 0) {
      throw new BadRequestException('Recipients list cannot be empty');
    }

    if (dto.recipients.length > 1000) {
      throw new BadRequestException('Maximum 1000 recipients per batch');
    }

    return dto.recipients.map((recipient) => 
      this.applyPersonalization(dto.template_content, recipient)
    );
  }

  /**
   * Extract variable names from a template
   * Returns list of variable names found in {{variable_name}} format
   */
  extractVariables(template: string): string[] {
    const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
    const variables: Set<string> = new Set();
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  /**
   * Validate that all required variables are provided
   */
  validateVariables(
    template: string,
    variables: Record<string, string>,
  ): { valid: boolean; missing: string[] } {
    const required = this.extractVariables(template);
    const provided = Object.keys(variables);
    const missing = required.filter((v) => !provided.includes(v));

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Parse CSV data into recipient records
   */
  parseCSV(csvContent: string): Record<string, string>[] {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new BadRequestException('CSV must have header row and at least one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const recipients: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i]);
      if (values.length !== headers.length) {
        throw new BadRequestException(`Row ${i + 1} has incorrect number of columns`);
      }

      const recipient: Record<string, string> = {};
      headers.forEach((header, index) => {
        recipient[header] = values[index];
      });
      recipients.push(recipient);
    }

    return recipients;
  }

  /**
   * Parse a single CSV line (handles quoted values)
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Generate CSV export from personalized content
   */
  generateCSVExport(
    recipients: Record<string, string>[],
    personalizedContent: string[],
  ): string {
    if (recipients.length !== personalizedContent.length) {
      throw new BadRequestException('Recipients and content arrays must have same length');
    }

    const headers = Object.keys(recipients[0] || {});
    const csvLines: string[] = [];

    // Header row
    csvLines.push([...headers, 'generated_content'].join(','));

    // Data rows
    for (let i = 0; i < recipients.length; i++) {
      const values = headers.map((h) => this.escapeCSVValue(recipients[i][h]));
      values.push(this.escapeCSVValue(personalizedContent[i]));
      csvLines.push(values.join(','));
    }

    return csvLines.join('\n');
  }

  /**
   * Escape a value for CSV (handle commas, quotes, newlines)
   */
  private escapeCSVValue(value: string): string {
    if (!value) return '';
    
    const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
    if (needsQuotes) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Convert DB row to response DTO
   */
  private toPersonalizationSetResponse(data: any): PersonalizationSetResponseDto {
    return {
      id: data.id,
      workspace_id: data.workspace_id,
      name: data.name,
      description: data.description,
      variables: data.variables as PersonalizationVariable[],
      created_by: data.created_by,
      created_at: new Date(data.created_at),
      updated_at: new Date(data.updated_at),
    };
  }
}
