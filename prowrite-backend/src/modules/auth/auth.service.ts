import { Injectable, UnauthorizedException, Inject, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { SupabaseService, PlanType, SubscriptionStatus, WorkspaceRow } from '@common/database';
import { AuthResponseDto, UserInfoDto } from './dto';

export interface TokenPayload {
  sub: string;
  email: string;
  workspace_id: string;
}

export const SUPABASE_CLIENT = 'SUPABASE_CLIENT';

@Injectable()
export class AuthService {
  private supabaseAuth: SupabaseClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly supabaseService: SupabaseService,
    @Optional() @Inject(SUPABASE_CLIENT) supabaseClient?: SupabaseClient,
  ) {
    if (supabaseClient) {
      this.supabaseAuth = supabaseClient;
    } else {
      const supabaseUrl = process.env.SUPABASE_URL;
      // Use anon key for auth verification (user tokens)
      const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
      if (supabaseUrl && supabaseKey) {
        this.supabaseAuth = createClient(supabaseUrl, supabaseKey);
      } else {
        this.supabaseAuth = null as unknown as SupabaseClient;
      }
    }
  }

  /**
   * Handle Supabase user login/registration
   * Creates workspace and subscription for new users
   */
  async handleSupabaseUser(supabaseAccessToken: string): Promise<AuthResponseDto> {
    if (!this.supabaseAuth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify the Supabase token and get user
    const { data: { user }, error } = await this.supabaseAuth.auth.getUser(supabaseAccessToken);

    if (error || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if workspace exists for this user
    const { data: workspaceData } = await this.supabaseService.workspaces
      .select('*')
      .eq('user_id', user.id)
      .single();

    const workspace = workspaceData as WorkspaceRow | null;
    let finalWorkspace: WorkspaceRow;

    // Create workspace and subscription for new users
    if (!workspace) {
      finalWorkspace = await this.createWorkspaceForUser(user);
    } else {
      finalWorkspace = workspace;
    }

    // Generate our own JWT token
    const payload: TokenPayload = {
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

  /**
   * Create workspace with default settings and free subscription for new user
   */
  async createWorkspaceForUser(user: SupabaseUser): Promise<WorkspaceRow> {
    console.log('Creating workspace for user:', user.id, user.email);
    
    // Create workspace with default settings
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

    const workspace = workspaceData as WorkspaceRow;
    console.log('Workspace created:', workspace.id);

    // Create free subscription for the workspace
    const { error: subError } = await this.supabaseService.subscriptions.insert({
      workspace_id: workspace.id,
      plan_type: PlanType.FREE,
      status: SubscriptionStatus.ACTIVE,
      stripe_subscription_id: null,
      current_period_start: null,
      current_period_end: null,
    });

    if (subError) {
      console.error('Failed to create subscription:', subError);
    }

    return workspace;
  }

  /**
   * Validate JWT token and return payload
   */
  validateToken(token: string): TokenPayload {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Get current user info from token payload
   */
  async getCurrentUser(payload: TokenPayload): Promise<UserInfoDto> {
    const { data: workspaceData } = await this.supabaseService.workspaces
      .select('*')
      .eq('id', payload.workspace_id)
      .single();

    const workspace = workspaceData as WorkspaceRow | null;

    if (!workspace) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: payload.sub,
      email: payload.email,
      workspace_id: workspace.id,
      workspace_name: workspace.name,
    };
  }
}
