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
exports.AuthService = exports.SUPABASE_CLIENT = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const supabase_js_1 = require("@supabase/supabase-js");
const database_1 = require("../../common/database");
exports.SUPABASE_CLIENT = 'SUPABASE_CLIENT';
let AuthService = class AuthService {
    jwtService;
    supabaseService;
    supabaseAuth;
    constructor(jwtService, supabaseService, supabaseClient) {
        this.jwtService = jwtService;
        this.supabaseService = supabaseService;
        if (supabaseClient) {
            this.supabaseAuth = supabaseClient;
        }
        else {
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
            if (supabaseUrl && supabaseKey) {
                this.supabaseAuth = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
            }
            else {
                this.supabaseAuth = null;
            }
        }
    }
    async handleSupabaseUser(supabaseAccessToken) {
        if (!this.supabaseAuth) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { data: { user }, error } = await this.supabaseAuth.auth.getUser(supabaseAccessToken);
        if (error || !user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const { data: workspaceData } = await this.supabaseService.workspaces
            .select('*')
            .eq('user_id', user.id)
            .single();
        const workspace = workspaceData;
        let finalWorkspace;
        if (!workspace) {
            finalWorkspace = await this.createWorkspaceForUser(user);
        }
        else {
            finalWorkspace = workspace;
        }
        const payload = {
            sub: user.id,
            email: user.email || '',
            workspace_id: finalWorkspace.id,
        };
        const accessToken = this.jwtService.sign(payload);
        return {
            access_token: accessToken,
            workspace_id: finalWorkspace.id,
            email: user.email || '',
        };
    }
    async createWorkspaceForUser(user) {
        console.log('Creating workspace for user:', user.id, user.email);
        const { data: workspaceData, error: workspaceError } = await this.supabaseService.workspaces
            .insert({
            user_id: user.id,
            name: `${user.email?.split('@')[0] || 'User'}'s Workspace`,
            description: null,
            brand_voice_guide: null,
            usage_limit: 100,
            usage_count: 0,
        })
            .select()
            .single();
        if (workspaceError) {
            console.error('Failed to create workspace:', workspaceError);
            throw new Error(`Failed to create workspace: ${workspaceError.message}`);
        }
        if (!workspaceData) {
            throw new Error('Failed to create workspace: No data returned');
        }
        const workspace = workspaceData;
        console.log('Workspace created:', workspace.id);
        const { error: subError } = await this.supabaseService.subscriptions.insert({
            workspace_id: workspace.id,
            plan_type: database_1.PlanType.FREE,
            status: database_1.SubscriptionStatus.ACTIVE,
            stripe_subscription_id: null,
            current_period_start: null,
            current_period_end: null,
        });
        if (subError) {
            console.error('Failed to create subscription:', subError);
        }
        return workspace;
    }
    validateToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async getCurrentUser(payload) {
        const { data: workspaceData } = await this.supabaseService.workspaces
            .select('*')
            .eq('id', payload.workspace_id)
            .single();
        const workspace = workspaceData;
        if (!workspace) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return {
            id: payload.sub,
            email: payload.email,
            workspace_id: workspace.id,
            workspace_name: workspace.name,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)(exports.SUPABASE_CLIENT)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        database_1.SupabaseService,
        supabase_js_1.SupabaseClient])
], AuthService);
//# sourceMappingURL=auth.service.js.map