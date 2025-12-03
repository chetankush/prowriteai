import { JwtService } from '@nestjs/jwt';
import { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { SupabaseService, WorkspaceRow } from '@common/database';
import { AuthResponseDto, UserInfoDto } from './dto';
export interface TokenPayload {
    sub: string;
    email: string;
    workspace_id: string;
}
export declare const SUPABASE_CLIENT = "SUPABASE_CLIENT";
export declare class AuthService {
    private readonly jwtService;
    private readonly supabaseService;
    private supabaseAuth;
    constructor(jwtService: JwtService, supabaseService: SupabaseService, supabaseClient?: SupabaseClient);
    handleSupabaseUser(supabaseAccessToken: string): Promise<AuthResponseDto>;
    createWorkspaceForUser(user: SupabaseUser): Promise<WorkspaceRow>;
    validateToken(token: string): TokenPayload;
    getCurrentUser(payload: TokenPayload): Promise<UserInfoDto>;
}
