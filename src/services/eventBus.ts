/**
 * DIGITAL GROWTH WORLD™ — Universal Event Bus
 * Decouples World Engine, Business OS, Agent Runtime, and React Experience layers.
 */

import {
  BusinessSignal,
  NextBestAction,
  AgentOperationalState,
  AgentWorkItem,
  ApprovalRequest,
  ToolExecutionRecord,
  LearningRecord,
  AutonomyLevel,
} from '../types';

export type EventCallback<T = any> = (payload: T) => void;

export interface EventPayloadMap {
  'AGENT_SELECTED': { agentId: string; room?: string };
  'AGENT_ANIMATION_CHANGED': { agentId: string; animation: string; emote?: any };
  'AGENT_STATE_CHANGED': { agentId: string; state: AgentOperationalState; workItemId?: string };
  'TASK_CREATED': { id: string; title: string; description: string; category: string; assignedToAgentId?: string };
  'TASK_PROGRESS_UPDATED': { taskId: string; progress: number; isDone: boolean };
  'TASK_COMPLETED': { taskId: string; xpReward: number };
  'OPPORTUNITY_UPDATED': { opportunityId: string; status: string };
  'OPPORTUNITY_SCORE_CHANGED': { opportunityId: string; score: number };
  'NEXT_BEST_ACTION_UPDATED': { actionId: string; title: string };
  'NEXT_BEST_ACTION_GENERATED': { action: NextBestAction };
  'LEAD_CREATED': { leadId: string; companyName: string; estimatedValue: number };
  'LEAD_STATUS_CHANGED': { leadId: string; status: string; companyName: string };
  'PROPOSAL_CREATED': { proposalId: string; title: string; value: number };
  'FINANCE_METRICS_UPDATED': { mrr: number; arr: number; pipelineValue: number };
  'MEETING_STARTED': { agenda: string; attendeeIds: string[] };
  'MEETING_TURN_COMPLETED': { speakerId: string; utteranceId: string };
  'FOCUS_SESSION_STARTED': { durationMinutes: number; goal: string };
  'FOCUS_SESSION_COMPLETED': { durationMinutes: number; goal: string };
  'AGENT_TOOL_REQUESTED': { agentId: string; toolName: string; args: any };
  'AGENT_TOOL_EXECUTED': { agentId: string; toolName: string; success: boolean; result?: any; error?: string };
  'NOTIFICATION_DISPATCHED': { message: string; type?: 'info' | 'success' | 'warning' | 'error' };
  'SIGNAL_DETECTED': { signal: BusinessSignal };
  'SIGNAL_RESOLVED': { signalId: string };
  'WORK_ITEM_ASSIGNED': { workItem: AgentWorkItem };
  'WORK_ITEM_UPDATED': { workItem: AgentWorkItem };
  'APPROVAL_REQUESTED': { request: ApprovalRequest };
  'APPROVAL_RESOLVED': { requestId: string; status: 'APPROVED' | 'REJECTED'; resolvedBy: string };
  'TOOL_EXECUTION_RECORDED': { record: ToolExecutionRecord };
  'LEARNING_RECORD_CREATED': { record: LearningRecord };
  'AUTONOMY_LEVEL_CHANGED': { agentId: string; level: AutonomyLevel };
}

export type BusinessEventType = keyof EventPayloadMap;

class UniversalEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to a typed application event
   */
  public on<K extends BusinessEventType>(event: K, callback: EventCallback<EventPayloadMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscription lambda
    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit a typed event to all registered listeners
   */
  public emit<K extends BusinessEventType>(event: K, payload: EventPayloadMap[K]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks && callbacks.size > 0) {
      callbacks.forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error(`[EventBus] Error in listener for event "${String(event)}":`, err);
        }
      });
    }
  }

  /**
   * Clear all subscriptions (used in testing & lifecycle resets)
   */
  public clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new UniversalEventBus();
