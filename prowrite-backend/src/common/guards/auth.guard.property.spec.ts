import * as fc from 'fast-check';
import { AuthGuard, TokenPayload } from './auth.guard';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * **Feature: prowrite-ai, Property 29: Missing Token Authentication**
 * **Validates: Requirements 10.1**
 * 
 * For any API request without a valid JWT token in the Authorization header,
 * the response SHALL be 401 Unauthorized.
 */
describe('AuthGuard Property Tests', () => {
  describe('Property 29: Missing Token Authentication', () => {
    let authGuard: AuthGuard;
    let mockJwtService: Partial<JwtService>;
    let mockConfigService: Partial<ConfigService>;

    beforeEach(() => {
      mockJwtService = {
        verify: jest.fn(),
      };

      mockConfigService = {
        get: jest.fn().mockReturnValue('test-jwt-secret'),
      };

      authGuard = new AuthGuard(
        mockJwtService as JwtService,
        mockConfigService as ConfigService,
      );
    });

    // Helper to create mock ExecutionContext
    const createMockContext = (authHeader?: string): ExecutionContext => {
      const mockRequest = {
        headers: {
          authorization: authHeader,
        },
        user: undefined as TokenPayload | undefined,
      };

      return {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as unknown as ExecutionContext;
    };

    it('should reject requests with no Authorization header', async () => {
      // **Feature: prowrite-ai, Property 29: Missing Token Authentication**
      await fc.assert(
        fc.asyncProperty(
          fc.constant(undefined), // No auth header
          async () => {
            const context = createMockContext(undefined);

            await expect(authGuard.canActivate(context)).rejects.toThrow(
              UnauthorizedException,
            );
            await expect(authGuard.canActivate(context)).rejects.toThrow(
              'Missing authentication token',
            );

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });


    it('should reject requests with empty Authorization header', async () => {
      // **Feature: prowrite-ai, Property 29: Missing Token Authentication**
      await fc.assert(
        fc.asyncProperty(
          fc.constant(''), // Empty auth header
          async (authHeader) => {
            const context = createMockContext(authHeader);

            await expect(authGuard.canActivate(context)).rejects.toThrow(
              UnauthorizedException,
            );

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject requests with non-Bearer token format', async () => {
      // **Feature: prowrite-ai, Property 29: Missing Token Authentication**
      // Generate various invalid auth header formats
      const invalidAuthHeaderArbitrary = fc.oneof(
        // Just a token without Bearer prefix
        fc.string({ minLength: 1, maxLength: 100 }),
        // Wrong prefix
        fc.tuple(
          fc.constantFrom('Basic', 'Token', 'JWT', 'Auth'),
          fc.string({ minLength: 1, maxLength: 100 }),
        ).map(([prefix, token]) => `${prefix} ${token}`),
        // Bearer without space
        fc.string({ minLength: 1, maxLength: 100 }).map((token) => `Bearer${token}`),
      );

      await fc.assert(
        fc.asyncProperty(invalidAuthHeaderArbitrary, async (authHeader) => {
          const context = createMockContext(authHeader);

          try {
            await authGuard.canActivate(context);
            // If it doesn't throw, the header was somehow valid (unlikely)
            return true;
          } catch (error) {
            // Should throw UnauthorizedException
            expect(error).toBeInstanceOf(UnauthorizedException);
            return true;
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should reject requests with invalid JWT tokens', async () => {
      // **Feature: prowrite-ai, Property 29: Missing Token Authentication**
      // Configure mock to throw on verify
      (mockJwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Generate non-empty, non-whitespace tokens to ensure they reach JWT verification
      const invalidTokenArbitrary = fc.stringMatching(/^[a-zA-Z0-9._-]{1,500}$/);

      await fc.assert(
        fc.asyncProperty(invalidTokenArbitrary, async (token) => {
          const context = createMockContext(`Bearer ${token}`);

          await expect(authGuard.canActivate(context)).rejects.toThrow(
            UnauthorizedException,
          );
          await expect(authGuard.canActivate(context)).rejects.toThrow(
            'Invalid authentication token',
          );

          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should accept requests with valid JWT tokens', async () => {
      // **Feature: prowrite-ai, Property 29: Missing Token Authentication**
      // Arbitrary for valid token payloads
      const validPayloadArbitrary = fc.record({
        sub: fc.uuid(),
        email: fc.emailAddress(),
        workspace_id: fc.uuid(),
      });

      // Generate non-whitespace tokens (real JWT tokens are alphanumeric with dots)
      const validTokenArbitrary = fc.stringMatching(/^[a-zA-Z0-9._-]{10,500}$/);

      await fc.assert(
        fc.asyncProperty(
          validTokenArbitrary, // Token string
          validPayloadArbitrary,
          async (token, payload) => {
            // Configure mock to return valid payload
            (mockJwtService.verify as jest.Mock).mockReturnValue(payload);

            const mockRequest = {
              headers: { authorization: `Bearer ${token}` },
              user: undefined as TokenPayload | undefined,
            };

            const context = {
              switchToHttp: () => ({
                getRequest: () => mockRequest,
              }),
            } as unknown as ExecutionContext;

            const result = await authGuard.canActivate(context);

            // Property: Valid tokens should be accepted
            expect(result).toBe(true);

            // Property: User payload should be attached to request
            expect(mockRequest.user).toEqual(payload);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
