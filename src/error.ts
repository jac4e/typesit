/**
 * @fileoverview Error type definitions for standardized error handling.
 * 
 * This module provides a common error interface used throughout the application
 * for consistent error reporting and handling. The IError interface standardizes
 * error objects with both human-readable messages and machine-readable codes.
 * 
 * @author Jacques Fourie
 */

/**
 * Standard error interface for consistent error handling across the application.
 * 
 * @example
 * ```typescript
 * const notFoundError: IError = {
 *   message: 'User account not found',
 *   code: 404
 * };
 * 
 * const validationError: IError = {
 *   message: 'Invalid email format provided',
 *   code: 1001
 * };
 * ```
 */
export interface IError {
    /** Human-readable error description */
    message: string;
    /** Numeric error code for programmatic handling */
    code: number;
}