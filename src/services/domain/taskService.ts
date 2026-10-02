/**
 * DIGITAL GROWTH WORLD™ — Task Domain Service
 * Manages sprint backlogs, agent assignments, task status transitions, and XP rewards.
 */

import { TaskItem } from '../../types';
import { INITIAL_TASKS } from '../../game/constants';
import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_tasks';

export type TaskListener = (tasks: TaskItem[]) => void;

class TaskDomainService {
  private tasks: TaskItem[] = [];
  private listeners: Set<TaskListener> = new Set();

  constructor() {
    this.loadInitialTasks();
  }

  private loadInitialTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.tasks = parsed;
          return;
        }
      }
    } catch {
      // Fall back to default INITIAL_TASKS
    }
    this.tasks = [...INITIAL_TASKS];
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks));
    } catch {
      // LocalStorage quota or disabled
    }
  }

  private notify() {
    this.persist();
    const snapshot = [...this.tasks];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[TaskService] Error in subscriber callback:', err);
      }
    });
  }

  /**
   * Subscribe to task collection mutations
   */
  public subscribe(listener: TaskListener): () => void {
    this.listeners.add(listener);
    listener([...this.tasks]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Get all tasks in backlog
   */
  public getAll(): TaskItem[] {
    return [...this.tasks];
  }

  /**
   * Find single task by ID
   */
  public getById(id: string): TaskItem | undefined {
    return this.tasks.find((t) => t.id === id);
  }

  /**
   * Create a new task item
   */
  public createTask(input: Partial<TaskItem> & { title: string }): TaskItem {
    const newTask: TaskItem = {
      id: input.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: input.title,
      description: input.description || 'Sprint task item',
      assignedToAgentId: input.assignedToAgentId,
      status: input.status || 'todo',
      progress: input.progress || 0,
      priority: input.priority || 'medium',
      xpReward: input.xpReward || 200,
      category: input.category || 'Operations',
      createdAt: input.createdAt || Date.now(),
    };

    this.tasks = [newTask, ...this.tasks];
    this.notify();

    eventBus.emit('TASK_CREATED', {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      assignedToAgentId: newTask.assignedToAgentId,
    });

    return newTask;
  }

  /**
   * Toggle task completion status
   */
  public toggleTaskStatus(id: string): TaskItem | undefined {
    const target = this.tasks.find((t) => t.id === id);
    if (!target) return undefined;

    const newStatus: TaskItem['status'] = target.status === 'done' ? 'todo' : 'done';
    return this.updateTaskStatus(id, newStatus);
  }

  /**
   * Update task status (todo, in_progress, done)
   */
  public updateTaskStatus(id: string, status: TaskItem['status']): TaskItem | undefined {
    let updated: TaskItem | undefined;

    this.tasks = this.tasks.map((t) => {
      if (t.id === id) {
        const isNowDone = status === 'done';
        updated = {
          ...t,
          status,
          progress: isNowDone ? 100 : t.progress,
        };
        return updated;
      }
      return t;
    });

    if (updated) {
      this.notify();

      if (status === 'done') {
        eventBus.emit('TASK_COMPLETED', {
          taskId: updated.id,
          xpReward: updated.xpReward,
        });
      } else {
        eventBus.emit('TASK_PROGRESS_UPDATED', {
          taskId: updated.id,
          progress: updated.progress,
          isDone: false,
        });
      }
    }

    return updated;
  }

  /**
   * Update simulated progress percentage (0 - 100)
   */
  public updateTaskProgress(id: string, progress: number): TaskItem | undefined {
    let updated: TaskItem | undefined;
    const clamped = Math.min(100, Math.max(0, progress));

    this.tasks = this.tasks.map((t) => {
      if (t.id === id) {
        const isDone = clamped >= 100;
        updated = {
          ...t,
          progress: clamped,
          status: isDone ? 'done' : t.status === 'todo' ? 'in_progress' : t.status,
        };
        return updated;
      }
      return t;
    });

    if (updated) {
      this.notify();
      eventBus.emit('TASK_PROGRESS_UPDATED', {
        taskId: updated.id,
        progress: clamped,
        isDone: clamped >= 100,
      });

      if (clamped >= 100 && updated.status === 'done') {
        eventBus.emit('TASK_COMPLETED', {
          taskId: updated.id,
          xpReward: updated.xpReward,
        });
      }
    }

    return updated;
  }

  /**
   * Assign task to an AI agent
   */
  public assignTask(id: string, agentId?: string): TaskItem | undefined {
    let updated: TaskItem | undefined;

    this.tasks = this.tasks.map((t) => {
      if (t.id === id) {
        updated = {
          ...t,
          assignedToAgentId: agentId,
          status: agentId && t.status === 'todo' ? 'in_progress' : t.status,
        };
        return updated;
      }
      return t;
    });

    if (updated) {
      this.notify();
    }

    return updated;
  }

  /**
   * Delete a task
   */
  public deleteTask(id: string): boolean {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter((t) => t.id !== id);
    if (this.tasks.length !== initialLen) {
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Metrics and aggregations
   */
  public getPendingCount(): number {
    return this.tasks.filter((t) => t.status !== 'done').length;
  }

  public getCompletedCount(): number {
    return this.tasks.filter((t) => t.status === 'done').length;
  }

  public getTotalEarnedXP(): number {
    return this.tasks
      .filter((t) => t.status === 'done')
      .reduce((acc, t) => acc + (t.xpReward || 100), 0);
  }
}

export const taskService = new TaskDomainService();
