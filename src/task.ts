/**
 * @fileoverview Background task management types.
 * 
 * This module provides type definitions for background task scheduling and management.
 * Tasks represent scheduled or recurring operations that run in the background, such as
 * data cleanup, email processing, backups, and other maintenance operations.
 * 
 * @author Jacques Fourie
 */

/**
 * Represents a lightweight task definition for background operations.
 * 
 * This interface provides the essential information needed to track and manage
 * background tasks without including the full execution context or configuration.
 * It's particularly useful for task listing, monitoring, and basic task control.
 * 
 * @example
 * ```typescript
 * // Regular running task
 * const emailProcessor: ITaskLean = {
 *   stopped: false,
 *   name: 'email_queue_processor',
 *   lastRun: new Date('2023-01-01T10:00:00.000Z'),
 *   nextRun: new Date('2023-01-01T11:00:00.000Z')
 * };
 * 
 * // Stopped/completed task
 * const migration: ITaskLean = {
 *   stopped: true,
 *   name: 'database_migration_v2',
 *   lastRun: new Date('2023-01-01T02:00:00.000Z'),
 *   nextRun: null
 * };
 * 
 * // Never-run pending task
 * const newTask: ITaskLean = {
 *   stopped: false,
 *   name: 'new_feature_sync',
 *   lastRun: null,
 *   nextRun: new Date('2023-01-02T00:00:00.000Z')
 * };
 * ```
 */
export interface ITaskLean {
    /** Whether the task is currently stopped/disabled */
    stopped: boolean; 
    /** Human-readable task identifier/name */
    name: string;
    /** Timestamp of the last task execution, null if never run */
    lastRun: Date | null;
    /** Timestamp of the next scheduled execution, null if not scheduled */
    nextRun: Date | null;
}