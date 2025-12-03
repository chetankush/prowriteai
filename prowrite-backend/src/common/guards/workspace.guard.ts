import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { TokenPayload } from './auth.guard';

/**
 * WorkspaceGuard verifies that the authenticated user has access to the requested workspace.
 * 
 * This guard checks if the workspace_id in the request (from params, body, or query)
 * matches the workspace_id from the authenticated user's JWT token.
 * 
 * Usage:
 * - Apply after AuthGuard on workspace-specific endpoints
 * - The guard extracts workspace_id from request params, body, or query
 * - Returns 403 Forbidden if the user attempts to access another workspace
 * 
 * **Validates: Requirements 10.2**
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as TokenPayload;

    // If no user is attached (AuthGuard should run first), deny access
    if (!user || !user.workspace_id) {
      throw new ForbiddenException('Access denied');
    }

    // Extract workspace_id from various sources in the request
    const requestedWorkspaceId = this.extractWorkspaceId(request);

    // If no workspace_id is specified in the request, allow access
    // (the endpoint will use the user's own workspace_id)
    if (!requestedWorkspaceId) {
      return true;
    }

    // Verify the user has access to the requested workspace
    if (requestedWorkspaceId !== user.workspace_id) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }

  /**
   * Extract workspace_id from request params, body, or query
   */
  private extractWorkspaceId(request: {
    params?: Record<string, string>;
    body?: Record<string, unknown>;
    query?: Record<string, string>;
  }): string | undefined {
    // Check route params first (e.g., /api/workspace/:workspace_id)
    if (request.params?.workspace_id) {
      return request.params.workspace_id;
    }

    // Check request body (e.g., POST with workspace_id in body)
    if (request.body?.workspace_id && typeof request.body.workspace_id === 'string') {
      return request.body.workspace_id;
    }

    // Check query params (e.g., ?workspace_id=xxx)
    if (request.query?.workspace_id) {
      return request.query.workspace_id;
    }

    return undefined;
  }
}
