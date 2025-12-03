"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizationService = void 0;
const common_1 = require("@nestjs/common");
const database_1 = require("../../common/database");
const team_service_1 = require("./team.service");
let PersonalizationService = class PersonalizationService {
    supabaseService;
    teamService;
    constructor(supabaseService, teamService) {
        this.supabaseService = supabaseService;
        this.teamService = teamService;
    }
    async createPersonalizationSet(workspaceId, userId, dto) {
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
    async getPersonalizationSets(workspaceId) {
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
    async getPersonalizationSet(workspaceId, setId) {
        const { data, error } = await this.supabaseService.client
            .from('personalization_sets')
            .select('*')
            .eq('id', setId)
            .eq('workspace_id', workspaceId)
            .single();
        if (error || !data) {
            throw new common_1.NotFoundException('Personalization set not found');
        }
        return this.toPersonalizationSetResponse(data);
    }
    async deletePersonalizationSet(workspaceId, setId) {
        const { error } = await this.supabaseService.client
            .from('personalization_sets')
            .delete()
            .eq('id', setId)
            .eq('workspace_id', workspaceId);
        if (error) {
            throw new Error(`Failed to delete personalization set: ${error.message}`);
        }
    }
    applyPersonalization(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
            result = result.replace(regex, value);
        }
        return result;
    }
    bulkPersonalize(dto) {
        if (!dto.recipients || dto.recipients.length === 0) {
            throw new common_1.BadRequestException('Recipients list cannot be empty');
        }
        if (dto.recipients.length > 1000) {
            throw new common_1.BadRequestException('Maximum 1000 recipients per batch');
        }
        return dto.recipients.map((recipient) => this.applyPersonalization(dto.template_content, recipient));
    }
    extractVariables(template) {
        const regex = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
        const variables = new Set();
        let match;
        while ((match = regex.exec(template)) !== null) {
            variables.add(match[1]);
        }
        return Array.from(variables);
    }
    validateVariables(template, variables) {
        const required = this.extractVariables(template);
        const provided = Object.keys(variables);
        const missing = required.filter((v) => !provided.includes(v));
        return {
            valid: missing.length === 0,
            missing,
        };
    }
    parseCSV(csvContent) {
        const lines = csvContent.trim().split('\n');
        if (lines.length < 2) {
            throw new common_1.BadRequestException('CSV must have header row and at least one data row');
        }
        const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
        const recipients = [];
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length !== headers.length) {
                throw new common_1.BadRequestException(`Row ${i + 1} has incorrect number of columns`);
            }
            const recipient = {};
            headers.forEach((header, index) => {
                recipient[header] = values[index];
            });
            recipients.push(recipient);
        }
        return recipients;
    }
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    generateCSVExport(recipients, personalizedContent) {
        if (recipients.length !== personalizedContent.length) {
            throw new common_1.BadRequestException('Recipients and content arrays must have same length');
        }
        const headers = Object.keys(recipients[0] || {});
        const csvLines = [];
        csvLines.push([...headers, 'generated_content'].join(','));
        for (let i = 0; i < recipients.length; i++) {
            const values = headers.map((h) => this.escapeCSVValue(recipients[i][h]));
            values.push(this.escapeCSVValue(personalizedContent[i]));
            csvLines.push(values.join(','));
        }
        return csvLines.join('\n');
    }
    escapeCSVValue(value) {
        if (!value)
            return '';
        const needsQuotes = value.includes(',') || value.includes('"') || value.includes('\n');
        if (needsQuotes) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
    }
    toPersonalizationSetResponse(data) {
        return {
            id: data.id,
            workspace_id: data.workspace_id,
            name: data.name,
            description: data.description,
            variables: data.variables,
            created_by: data.created_by,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
        };
    }
};
exports.PersonalizationService = PersonalizationService;
exports.PersonalizationService = PersonalizationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_1.SupabaseService,
        team_service_1.TeamService])
], PersonalizationService);
//# sourceMappingURL=personalization.service.js.map