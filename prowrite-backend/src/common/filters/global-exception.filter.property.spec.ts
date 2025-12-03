import * as fc from 'fast-check';
import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

/**
 * **Feature: prowrite-ai, Property 31: Database Error Response**
 * **Validates: Requirements 10.4**
 *
 * For any database operation failure, the API response SHALL be 500
 * with a generic error message that does not expose internal details.
 */
describe('GlobalExceptionFilter Property Tests', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  // Helper to create a mock ArgumentsHost
  const createMockHost = (): {
    host: ArgumentsHost;
    response: { status: jest.Mock; json: jest.Mock };
    request: { url: string };
  } => {
    const jsonMock = jest.fn();
    const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    const response = { status: statusMock, json: jsonMock };
    const request = { url: '/api/test' };

    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => request,
      }),
    } as unknown as ArgumentsHost;

    return { host, response, request };
  };

  // Arbitrary for generating database-like error messages with sensitive info
  const sensitiveErrorMessageArb = fc.oneof(
    // SQL error patterns
    fc.record({
      type: fc.constant('sql'),
      table: fc.stringMatching(/^[a-z_]+$/),
      column: fc.stringMatching(/^[a-z_]+$/),
      value: fc.string(),
    }).map(({ table, column, value }) =>
      `ERROR: duplicate key value violates unique constraint "${table}_${column}_key" (value: ${value})`
    ),
    // Connection string patterns
    fc.record({
      host: fc.domain(),
      port: fc.integer({ min: 1000, max: 65535 }),
      user: fc.string({ minLength: 1, maxLength: 20 }),
      password: fc.string({ minLength: 8, maxLength: 32 }),
    }).map(({ host, port, user, password }) =>
      `Connection failed: postgresql://${user}:${password}@${host}:${port}/database`
    ),
    // Stack trace patterns
    fc.record({
      file: fc.stringMatching(/^[a-zA-Z0-9_/]+\.ts$/),
      line: fc.integer({ min: 1, max: 1000 }),
      func: fc.stringMatching(/^[a-zA-Z_]+$/),
    }).map(({ file, line, func }) =>
      `Error at ${func} (${file}:${line}:10)\n    at Object.<anonymous>`
    ),
    // Generic database errors
    fc.constantFrom(
      'FATAL: password authentication failed for user "admin"',
      'ERROR: relation "users" does not exist',
      'ERROR: column "password_hash" of relation "users" does not exist',
      'QueryFailedError: ECONNREFUSED 127.0.0.1:5432',
      'TypeORMError: Entity metadata for "Workspace" was not found',
    ),
  );

  // Sensitive patterns that should NEVER appear in error responses
  const sensitivePatterns = [
    /password/i,
    /secret/i,
    /key/i,
    /token/i,
    /credential/i,
    /postgresql:\/\//i,
    /mysql:\/\//i,
    /mongodb:\/\//i,
    /\.ts:\d+/,  // Stack trace file references
    /at\s+\w+\s+\(/,  // Stack trace function calls
    /FATAL:/i,
    /ERROR:/i,
    /QueryFailedError/i,
    /TypeORMError/i,
    /ECONNREFUSED/i,
    /duplicate key/i,
    /constraint/i,
    /relation.*does not exist/i,
  ];

  it('should return 500 status for non-HTTP exceptions', () => {
    // **Feature: prowrite-ai, Property 31: Database Error Response**
    fc.assert(
      fc.property(sensitiveErrorMessageArb, (errorMessage) => {
        const { host, response } = createMockHost();
        const error = new Error(errorMessage);

        filter.catch(error, host);

        // Should always return 500 for non-HTTP exceptions
        expect(response.status).toHaveBeenCalledWith(
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should return generic message that does not expose internal details', () => {
    // **Feature: prowrite-ai, Property 31: Database Error Response**
    fc.assert(
      fc.property(sensitiveErrorMessageArb, (errorMessage) => {
        const { host, response } = createMockHost();
        const error = new Error(errorMessage);

        filter.catch(error, host);

        // Get the response body
        const jsonCall = response.status.mock.results[0].value.json;
        const responseBody = jsonCall.mock.calls[0][0];

        // The message should be generic
        expect(responseBody.message).toBe('Internal server error');

        // The response should NOT contain any sensitive patterns
        const responseString = JSON.stringify(responseBody);
        for (const pattern of sensitivePatterns) {
          expect(responseString).not.toMatch(pattern);
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should include required response fields without sensitive data', () => {
    // **Feature: prowrite-ai, Property 31: Database Error Response**
    fc.assert(
      fc.property(sensitiveErrorMessageArb, (errorMessage) => {
        const { host, response } = createMockHost();
        const error = new Error(errorMessage);

        filter.catch(error, host);

        const jsonCall = response.status.mock.results[0].value.json;
        const responseBody = jsonCall.mock.calls[0][0];

        // Should have required fields
        expect(responseBody).toHaveProperty('statusCode', 500);
        expect(responseBody).toHaveProperty('message', 'Internal server error');
        expect(responseBody).toHaveProperty('timestamp');
        expect(responseBody).toHaveProperty('path');

        // Timestamp should be valid ISO string
        expect(() => new Date(responseBody.timestamp)).not.toThrow();

        return true;
      }),
      { numRuns: 100 },
    );
  });

  it('should preserve HTTP exception messages (non-sensitive)', () => {
    // HTTP exceptions are intentional and should preserve their messages
    const httpErrorArb = fc.record({
      status: fc.constantFrom(400, 401, 403, 404, 422),
      message: fc.constantFrom(
        'Bad Request',
        'Unauthorized',
        'Forbidden',
        'Not Found',
        'Validation failed',
        'Invalid input',
      ),
    });

    fc.assert(
      fc.property(httpErrorArb, ({ status, message }) => {
        const { host, response } = createMockHost();
        const error = new HttpException(message, status);

        filter.catch(error, host);

        expect(response.status).toHaveBeenCalledWith(status);

        const jsonCall = response.status.mock.results[0].value.json;
        const responseBody = jsonCall.mock.calls[0][0];

        // HTTP exceptions should preserve their message
        expect(responseBody.message).toBe(message);

        return true;
      }),
      { numRuns: 100 },
    );
  });
});
