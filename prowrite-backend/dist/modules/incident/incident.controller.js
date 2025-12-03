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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IncidentController = void 0;
const common_1 = require("@nestjs/common");
const incident_service_1 = require("./incident.service");
const dto_1 = require("./dto");
const guards_1 = require("../../common/guards");
let IncidentController = class IncidentController {
    incidentService;
    constructor(incidentService) {
        this.incidentService = incidentService;
    }
    async generateAllCommunications(dto) {
        return this.incidentService.generateAllCommunications(dto);
    }
    async generateSlackEngineering(dto) {
        const comm = await this.incidentService.generateSlackEngineering(dto);
        return { communication: comm };
    }
    async generateSlackCompany(dto) {
        const comm = await this.incidentService.generateSlackCompany(dto);
        return { communication: comm };
    }
    async generateCustomerEmail(dto) {
        const comm = await this.incidentService.generateCustomerEmail(dto);
        return { communication: comm };
    }
    async generateStatusPage(dto) {
        const comm = await this.incidentService.generateStatusPage(dto);
        return { communication: comm };
    }
    async generateExecutiveSummary(dto) {
        const comm = await this.incidentService.generateExecutiveSummary(dto);
        return { communication: comm };
    }
    async generatePostmortem(dto) {
        const comm = await this.incidentService.generatePostmortemTemplate(dto);
        return { communication: comm };
    }
    async generateUpdateCommunications(body) {
        return this.incidentService.generateUpdateCommunications(body.original, body.update);
    }
};
exports.IncidentController = IncidentController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateIncidentCommsDto]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generateAllCommunications", null);
__decorate([
    (0, common_1.Post)('generate/slack-engineering'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateIncidentCommsDto]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generateSlackEngineering", null);
__decorate([
    (0, common_1.Post)('generate/slack-company'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateIncidentCommsDto]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generateSlackCompany", null);
__decorate([
    (0, common_1.Post)('generate/customer-email'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateIncidentCommsDto]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generateCustomerEmail", null);
__decorate([
    (0, common_1.Post)('generate/status-page'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateIncidentCommsDto]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generateStatusPage", null);
__decorate([
    (0, common_1.Post)('generate/executive-summary'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateIncidentCommsDto]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generateExecutiveSummary", null);
__decorate([
    (0, common_1.Post)('generate/postmortem'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.GenerateIncidentCommsDto]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generatePostmortem", null);
__decorate([
    (0, common_1.Post)('update'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], IncidentController.prototype, "generateUpdateCommunications", null);
exports.IncidentController = IncidentController = __decorate([
    (0, common_1.Controller)('api/incident'),
    (0, common_1.UseGuards)(guards_1.AuthGuard, guards_1.WorkspaceGuard),
    __metadata("design:paramtypes", [incident_service_1.IncidentService])
], IncidentController);
//# sourceMappingURL=incident.controller.js.map