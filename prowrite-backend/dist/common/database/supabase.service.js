"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = exports.MessageRole = exports.GenerationStatus = exports.ModuleType = exports.SubscriptionStatus = exports.PlanType = void 0;
const common_1 = require("@nestjs/common");
const supabase_js_1 = require("@supabase/supabase-js");
var PlanType;
(function (PlanType) {
    PlanType["FREE"] = "free";
    PlanType["STARTER"] = "starter";
    PlanType["PRO"] = "pro";
    PlanType["ENTERPRISE"] = "enterprise";
})(PlanType || (exports.PlanType = PlanType = {}));
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELED"] = "canceled";
    SubscriptionStatus["PAST_DUE"] = "past_due";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
var ModuleType;
(function (ModuleType) {
    ModuleType["COLD_EMAIL"] = "cold_email";
    ModuleType["WEBSITE_COPY"] = "website_copy";
    ModuleType["YOUTUBE_SCRIPTS"] = "youtube_scripts";
    ModuleType["HR_DOCS"] = "hr_docs";
})(ModuleType || (exports.ModuleType = ModuleType = {}));
var GenerationStatus;
(function (GenerationStatus) {
    GenerationStatus["PENDING"] = "pending";
    GenerationStatus["COMPLETED"] = "completed";
    GenerationStatus["FAILED"] = "failed";
})(GenerationStatus || (exports.GenerationStatus = GenerationStatus = {}));
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
let SupabaseService = class SupabaseService {
    _client;
    get client() {
        return this._client;
    }
    onModuleInit() {
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('SUPABASE_URL and SUPABASE_KEY must be defined');
        }
        this._client = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
    }
    get supabase() {
        return this._client;
    }
    get workspaces() {
        return this.client.from('workspaces');
    }
    get subscriptions() {
        return this.client.from('subscriptions');
    }
    get templates() {
        return this.client.from('templates');
    }
    get generations() {
        return this.client.from('generations');
    }
    get conversations() {
        return this.client.from('conversations');
    }
    get messages() {
        return this.client.from('messages');
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)()
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map