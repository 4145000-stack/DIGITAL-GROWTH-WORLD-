/**
 * DIGITAL GROWTH WORLD™ — Agent Work Queue Service
 * Persistent, prioritized queues of actual domain tasks assigned to specific agents.
 */

import { AgentWorkItem, AgentOperationalState } from '../../types';
import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_work_queues';

const DEFAULT_WORK_ITEMS: AgentWorkItem[] = [
  {
    id: 'wi-1',
    agentId: 'closer',
    title: 'Outreach: Acme Corp',
    description: 'Reach out to decision maker regarding recent trial sign-up.',
    priority: 95,
    category: 'Sales',
    state: 'ASSIGNED',
    assignedAt: Date.now() - 3600000,
  },
  {
    id: 'wi-2',
    agentId: 'nova',
    title: 'Analyze Q3 Growth Metrics',
    description: 'Determine primary bottleneck in the mid-funnel conversion rate.',
    priority: 85,
    category: 'Strategy',
    state: 'EXECUTING',
    assignedAt: Date.now() - 7200000,
    startedAt: Date.now() - 1800000,
  }
];

export type WorkQueueListener = (items: AgentWorkItem[]) => void;

export class AgentWorkQueueService {
  private items: AgentWorkItem[] = [];
  private listeners: Set<WorkQueueListener> = new Set();

  constructor() {
    this.loadItems();
  }

  private loadItems() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.items = parsed;
          return;
        }
      }
    } catch {
      // ignore
    }
    this.items = [...DEFAULT_WORK_ITEMS];
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.persist();
    const snapshot = [...this.items];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[AgentWorkQueueService] Subscriber error:', err);
      }
    });
  }

  public subscribe(listener: WorkQueueListener): () => void {
    this.listeners.add(listener);
    listener([...this.items]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAgentQueue(agentId: string): AgentWorkItem[] {
    return this.items
      .filter((i) => i.agentId === agentId && !['COMPLETED', 'FAILED'].includes(i.state))
      .sort((a, b) => b.priority - a.priority);
  }

  public getAllItems(): AgentWorkItem[] {
    return [...this.items];
  }

  public assignWork(params: {
    agentId: string;
    title: string;
    description: string;
    priority: number;
    category: AgentWorkItem['category'];
    entityType?: AgentWorkItem['entityType'];
    entityId?: string;
    actionPayload?: AgentWorkItem['actionPayload'];
  }): AgentWorkItem {
    const item: AgentWorkItem = {
      id: `wi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agentId: params.agentId.toLowerCase().replace(/^agent_/, ''),
      title: params.title,
      description: params.description,
      priority: params.priority,
      category: params.category,
      state: 'ASSIGNED',
      entityType: params.entityType,
      entityId: params.entityId,
      actionPayload: params.actionPayload,
      assignedAt: Date.now(),
    };

    this.items.unshift(item);
    this.notify();
    
    eventBus.emit('WORK_ITEM_ASSIGNED', { workItem: item });
    eventBus.emit('AGENT_STATE_CHANGED', { agentId: item.agentId, state: 'ASSIGNED', workItemId: item.id });
    
    return item;
  }

  public updateState(itemId: string, state: AgentOperationalState, result?: any): AgentWorkItem | null {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return null;

    item.state = state;
    if (state === 'EXECUTING' && !item.startedAt) {
      item.startedAt = Date.now();
    }
    if (state === 'COMPLETED' || state === 'FAILED') {
      item.completedAt = Date.now();
      item.result = result;
    }

    this.notify();
    
    eventBus.emit('WORK_ITEM_UPDATED', { workItem: item });
    eventBus.emit('AGENT_STATE_CHANGED', { agentId: item.agentId, state, workItemId: item.id });
    
    return item;
  }
}

export const agentWorkQueueService = new AgentWorkQueueService();
