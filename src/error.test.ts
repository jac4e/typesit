/**
 * @fileoverview Test suite for error module types.
 */

import { IError } from './error';

describe('Error Module', () => {
  describe('IError interface', () => {
    it('should accept valid error objects', () => {
      const error: IError = {
        message: 'Something went wrong',
        code: 500,
      };

      expect(error.message).toBe('Something went wrong');
      expect(error.code).toBe(500);
    });

    it('should handle various error codes', () => {
      const testCases: IError[] = [
        { message: 'Not found', code: 404 },
        { message: 'Unauthorized', code: 401 },
        { message: 'Bad request', code: 400 },
        { message: 'Internal server error', code: 500 },
        { message: 'Success', code: 200 },
        { message: 'Created', code: 201 },
      ];

      testCases.forEach((testCase) => {
        expect(testCase.message).toBeDefined();
        expect(typeof testCase.message).toBe('string');
        expect(testCase.code).toBeDefined();
        expect(typeof testCase.code).toBe('number');
      });
    });

    it('should handle empty error messages', () => {
      const error: IError = {
        message: '',
        code: 400,
      };

      expect(error.message).toBe('');
      expect(error.code).toBe(400);
    });

    it('should handle long error messages', () => {
      const longMessage = 'A'.repeat(1000);
      const error: IError = {
        message: longMessage,
        code: 500,
      };

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(1000);
    });

    it('should handle zero error code', () => {
      const error: IError = {
        message: 'Zero code error',
        code: 0,
      };

      expect(error.code).toBe(0);
    });

    it('should handle negative error codes', () => {
      const error: IError = {
        message: 'Negative code error',
        code: -1,
      };

      expect(error.code).toBe(-1);
    });

    it('should handle large error codes', () => {
      const error: IError = {
        message: 'Large code error',
        code: 999999,
      };

      expect(error.code).toBe(999999);
    });
  });

  describe('Common error patterns', () => {
    it('should support HTTP status code patterns', () => {
      const httpErrors: IError[] = [
        { message: 'Bad Request', code: 400 },
        { message: 'Unauthorized', code: 401 },
        { message: 'Forbidden', code: 403 },
        { message: 'Not Found', code: 404 },
        { message: 'Method Not Allowed', code: 405 },
        { message: 'Conflict', code: 409 },
        { message: 'Internal Server Error', code: 500 },
        { message: 'Bad Gateway', code: 502 },
        { message: 'Service Unavailable', code: 503 },
      ];

      httpErrors.forEach((error) => {
        expect(error.code).toBeGreaterThanOrEqual(400);
        expect(error.code).toBeLessThan(600);
        expect(error.message).toBeTruthy();
      });
    });

    it('should support application-specific error codes', () => {
      const appErrors: IError[] = [
        { message: 'Insufficient balance', code: 1001 },
        { message: 'Product out of stock', code: 1002 },
        { message: 'Invalid cart item', code: 1003 },
        { message: 'Account not verified', code: 1004 },
        { message: 'Transaction failed', code: 1005 },
      ];

      appErrors.forEach((error) => {
        expect(error.code).toBeGreaterThan(1000);
        expect(error.message).toContain(' ');
        expect(error.message.length).toBeGreaterThan(5);
      });
    });

    it('should support system error codes', () => {
      const systemErrors: IError[] = [
        { message: 'Database connection failed', code: 5001 },
        { message: 'External service unavailable', code: 5002 },
        { message: 'Configuration error', code: 5003 },
        { message: 'Memory allocation failed', code: 5004 },
      ];

      systemErrors.forEach((error) => {
        expect(error.code).toBeGreaterThan(5000);
        expect(error.message).toBeTruthy();
      });
    });
  });

  describe('Error message formatting', () => {
    it('should handle messages with special characters', () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
      const error: IError = {
        message: `Error with special chars: ${specialChars}`,
        code: 400,
      };

      expect(error.message).toContain(specialChars);
    });

    it('should handle messages with unicode characters', () => {
      const error: IError = {
        message: 'Error with unicode: 🚨 ❌ ⚠️',
        code: 400,
      };

      expect(error.message).toContain('🚨');
      expect(error.message).toContain('❌');
      expect(error.message).toContain('⚠️');
    });

    it('should handle multiline error messages', () => {
      const error: IError = {
        message: 'Line 1\nLine 2\nLine 3',
        code: 500,
      };

      expect(error.message).toContain('\n');
      expect(error.message.split('\n')).toHaveLength(3);
    });
  });

  describe('Type safety', () => {
    it('should enforce required properties at compile time', () => {
      // These should compile successfully
      const validError1: IError = { message: 'Test', code: 400 };
      const validError2: IError = { message: '', code: 0 };
      
      expect(validError1.message).toBeDefined();
      expect(validError1.code).toBeDefined();
      expect(validError2.message).toBeDefined();
      expect(validError2.code).toBeDefined();
    });

    it('should work with object destructuring', () => {
      const error: IError = { message: 'Test error', code: 404 };
      const { message, code } = error;

      expect(message).toBe('Test error');
      expect(code).toBe(404);
    });

    it('should work with object spreading', () => {
      const baseError: IError = { message: 'Base error', code: 500 };
      const extendedError = { ...baseError, timestamp: new Date() };

      expect(extendedError.message).toBe('Base error');
      expect(extendedError.code).toBe(500);
      expect(extendedError.timestamp).toBeInstanceOf(Date);
    });
  });
});
