/**
 * @fileoverview Test suite for task module types.
 */

import { ITaskLean } from './task';

describe('Task Module', () => {
  describe('ITaskLean interface', () => {
    it('should accept valid task objects', () => {
      const task: ITaskLean = {
        stopped: false,
        name: 'data_cleanup',
        lastRun: new Date('2023-01-01T12:00:00.000Z'),
        nextRun: new Date('2023-01-01T18:00:00.000Z'),
      };

      expect(task.stopped).toBe(false);
      expect(task.name).toBe('data_cleanup');
      expect(task.lastRun).toBeInstanceOf(Date);
      expect(task.nextRun).toBeInstanceOf(Date);
    });

    it('should handle stopped tasks', () => {
      const stoppedTask: ITaskLean = {
        stopped: true,
        name: 'email_notifications',
        lastRun: new Date('2023-01-01T10:00:00.000Z'),
        nextRun: null,
      };

      expect(stoppedTask.stopped).toBe(true);
      expect(stoppedTask.nextRun).toBeNull();
      expect(stoppedTask.lastRun).toBeInstanceOf(Date);
    });

    it('should handle never-run tasks', () => {
      const neverRunTask: ITaskLean = {
        stopped: false,
        name: 'new_task',
        lastRun: null,
        nextRun: new Date('2023-01-02T00:00:00.000Z'),
      };

      expect(neverRunTask.lastRun).toBeNull();
      expect(neverRunTask.nextRun).toBeInstanceOf(Date);
      expect(neverRunTask.stopped).toBe(false);
    });

    it('should handle tasks with null timestamps', () => {
      const nullTimestampTask: ITaskLean = {
        stopped: true,
        name: 'disabled_task',
        lastRun: null,
        nextRun: null,
      };

      expect(nullTimestampTask.lastRun).toBeNull();
      expect(nullTimestampTask.nextRun).toBeNull();
      expect(nullTimestampTask.stopped).toBe(true);
    });

    it('should handle various task names', () => {
      const taskNames = [
        'simple_task',
        'email-sender',
        'Data Cleanup Task',
        'backup_database_v2',
        'send_notifications',
        'process_orders',
        'generate_reports',
        'a',
        '123',
        'task_with_very_long_descriptive_name_that_explains_everything',
      ];

      taskNames.forEach((name) => {
        const task: ITaskLean = {
          stopped: false,
          name: name,
          lastRun: new Date(),
          nextRun: new Date(),
        };

        expect(task.name).toBe(name);
        expect(typeof task.name).toBe('string');
      });
    });

    it('should handle empty task names', () => {
      const emptyNameTask: ITaskLean = {
        stopped: false,
        name: '',
        lastRun: new Date(),
        nextRun: new Date(),
      };

      expect(emptyNameTask.name).toBe('');
    });

    it('should handle date edge cases', () => {
      const edgeCaseDates = [
        new Date(0), // Unix epoch
        new Date('1970-01-01T00:00:00.000Z'),
        new Date('2099-12-31T23:59:59.999Z'),
        new Date(Date.now()),
        new Date(Date.now() + 86400000), // Tomorrow
      ];

      edgeCaseDates.forEach((date, index) => {
        const task: ITaskLean = {
          stopped: false,
          name: `edge_case_task_${index}`,
          lastRun: date,
          nextRun: date,
        };

        expect(task.lastRun).toBeInstanceOf(Date);
        expect(task.nextRun).toBeInstanceOf(Date);
        expect(task.lastRun?.getTime()).toBe(date.getTime());
        expect(task.nextRun?.getTime()).toBe(date.getTime());
      });
    });

    it('should handle boolean stopped states correctly', () => {
      const runningTask: ITaskLean = {
        stopped: false,
        name: 'running_task',
        lastRun: new Date(),
        nextRun: new Date(),
      };

      const stoppedTask: ITaskLean = {
        stopped: true,
        name: 'stopped_task',
        lastRun: new Date(),
        nextRun: null,
      };

      expect(runningTask.stopped).toBe(false);
      expect(stoppedTask.stopped).toBe(true);
      expect(typeof runningTask.stopped).toBe('boolean');
      expect(typeof stoppedTask.stopped).toBe('boolean');
    });
  });

  describe('Task scheduling scenarios', () => {
    it('should represent a regularly scheduled task', () => {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 3600000);
      
      const scheduledTask: ITaskLean = {
        stopped: false,
        name: 'hourly_cleanup',
        lastRun: now,
        nextRun: nextHour,
      };

      expect(scheduledTask.nextRun!.getTime()).toBeGreaterThan(scheduledTask.lastRun!.getTime());
    });

    it('should represent an overdue task', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      const evenPastDate = new Date(Date.now() - 172800000); // Day before yesterday
      
      const overdueTask: ITaskLean = {
        stopped: false,
        name: 'overdue_backup',
        lastRun: evenPastDate,
        nextRun: pastDate,
      };

      expect(overdueTask.nextRun!.getTime()).toBeLessThan(Date.now());
      expect(overdueTask.lastRun!.getTime()).toBeLessThan(overdueTask.nextRun!.getTime());
    });

    it('should represent a one-time completed task', () => {
      const completedTask: ITaskLean = {
        stopped: true,
        name: 'migration_task',
        lastRun: new Date('2023-01-01T12:00:00.000Z'),
        nextRun: null,
      };

      expect(completedTask.stopped).toBe(true);
      expect(completedTask.nextRun).toBeNull();
      expect(completedTask.lastRun).toBeInstanceOf(Date);
    });

    it('should represent a pending initial task', () => {
      const pendingTask: ITaskLean = {
        stopped: false,
        name: 'initial_setup',
        lastRun: null,
        nextRun: new Date(Date.now() + 3600000), // In 1 hour
      };

      expect(pendingTask.lastRun).toBeNull();
      expect(pendingTask.nextRun).toBeInstanceOf(Date);
      expect(pendingTask.stopped).toBe(false);
    });
  });

  describe('Type safety and structure', () => {
    it('should work with object destructuring', () => {
      const task: ITaskLean = {
        stopped: false,
        name: 'test_task',
        lastRun: new Date(),
        nextRun: new Date(),
      };

      const { stopped, name, lastRun, nextRun } = task;
      
      expect(stopped).toBe(false);
      expect(name).toBe('test_task');
      expect(lastRun).toBeInstanceOf(Date);
      expect(nextRun).toBeInstanceOf(Date);
    });

    it('should work with object spreading', () => {
      const baseTask: ITaskLean = {
        stopped: false,
        name: 'base_task',
        lastRun: new Date(),
        nextRun: new Date(),
      };

      const extendedTask = {
        ...baseTask,
        priority: 'high',
        description: 'Extended task with additional properties',
      };

      expect(extendedTask.stopped).toBe(baseTask.stopped);
      expect(extendedTask.name).toBe(baseTask.name);
      expect(extendedTask.priority).toBe('high');
      expect(extendedTask.description).toBeTruthy();
    });

    it('should handle partial updates', () => {
      const originalTask: ITaskLean = {
        stopped: false,
        name: 'original_task',
        lastRun: null,
        nextRun: new Date(),
      };

      const updatedTask: ITaskLean = {
        ...originalTask,
        stopped: true,
        lastRun: new Date(),
      };

      expect(updatedTask.stopped).toBe(true);
      expect(updatedTask.lastRun).toBeInstanceOf(Date);
      expect(updatedTask.name).toBe(originalTask.name);
      expect(updatedTask.nextRun).toBe(originalTask.nextRun);
    });

    it('should maintain type safety for nullable dates', () => {
      const task: ITaskLean = {
        stopped: true,
        name: 'nullable_date_task',
        lastRun: null,
        nextRun: null,
      };

      // These should work without type errors
      const lastRunTime = task.lastRun?.getTime();
      const nextRunTime = task.nextRun?.getTime();

      expect(lastRunTime).toBeUndefined();
      expect(nextRunTime).toBeUndefined();
    });
  });

  describe('Common task patterns', () => {
    it('should represent background service tasks', () => {
      const backgroundTasks: ITaskLean[] = [
        {
          stopped: false,
          name: 'email_queue_processor',
          lastRun: new Date(),
          nextRun: new Date(Date.now() + 60000), // Next minute
        },
        {
          stopped: false,
          name: 'cache_cleaner',
          lastRun: new Date(),
          nextRun: new Date(Date.now() + 3600000), // Next hour
        },
        {
          stopped: false,
          name: 'log_rotator',
          lastRun: new Date(),
          nextRun: new Date(Date.now() + 86400000), // Next day
        },
      ];

      backgroundTasks.forEach((task) => {
        expect(task.stopped).toBe(false);
        expect(task.lastRun).toBeInstanceOf(Date);
        expect(task.nextRun).toBeInstanceOf(Date);
        expect(task.nextRun!.getTime()).toBeGreaterThan(task.lastRun!.getTime());
      });
    });

    it('should represent maintenance tasks', () => {
      const maintenanceTasks: ITaskLean[] = [
        {
          stopped: false,
          name: 'database_backup',
          lastRun: new Date('2023-01-01T02:00:00.000Z'),
          nextRun: new Date('2023-01-02T02:00:00.000Z'), // Daily backup
        },
        {
          stopped: false,
          name: 'security_scan',
          lastRun: new Date('2023-01-01T01:00:00.000Z'),
          nextRun: new Date('2023-01-08T01:00:00.000Z'), // Weekly scan
        },
        {
          stopped: true,
          name: 'legacy_cleanup',
          lastRun: new Date('2023-01-01T00:00:00.000Z'),
          nextRun: null, // One-time cleanup, now stopped
        },
      ];

      expect(maintenanceTasks[0].stopped).toBe(false);
      expect(maintenanceTasks[1].stopped).toBe(false);
      expect(maintenanceTasks[2].stopped).toBe(true);
      expect(maintenanceTasks[2].nextRun).toBeNull();
    });
  });
});
