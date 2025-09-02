/**
 * @fileoverview Logging types for application event tracking and audit trails.
 * 
 * This module provides type definitions for structured logging throughout the application.
 * Logs capture events, user actions, errors, and other significant occurrences with
 * flexible data payloads for comprehensive system monitoring and debugging.
 * 
 * @author Jacques Fourie
 */

/**
 * Represents a structured log entry for system events and user actions.
 * 
 * The Log interface provides a flexible structure for capturing various types of
 * events with arbitrary data payloads. This enables comprehensive logging for
 * debugging, auditing, and system monitoring purposes.
 * 
 * @example
 * ```typescript
 * const userActionLog: Log = {
 *   id: 'log_user_purchase_001',
 *   date: new Date(),
 *   data: {
 *     userId: 'user_123',
 *     action: 'purchase',
 *     productId: 'prod_456',
 *     amount: 25.99,
 *     paymentMethod: 'credit_card'
 *   }
 * };
 * 
 * const errorLog: Log = {
 *   id: 'log_error_001',
 *   date: new Date(),
 *   data: {
 *     level: 'error',
 *     message: 'Database connection failed',
 *     component: 'UserService',
 *     stack: '...'
 *   }
 * };
 * ```
 */
export interface Log {
  /** Unique identifier for this log entry */
  id: string;
  /** Timestamp when the logged event occurred */
  date: Date;
  /** Flexible data payload containing event-specific information */
  data: object;
}
  