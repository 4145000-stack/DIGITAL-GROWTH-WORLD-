/**
 * DIGITAL GROWTH WORLD™ — Operational Learning Engine
 * Closes the feedback loop: DETECT → DECIDE → EXECUTE → MEASURE → LEARN
 */

import { LearningRecord } from '../../types';
import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_learnings';

const DEFAULT_LEARNINGS: LearningRecord[] = [
  {
    id: 'lr-1',
    action: 'Send Interactive ROI Calculator to Enterprise Lead',
    agentId: 'closer',
    context: { leadId: 'l1', dealSize: 60000 },
    expectedOutcome: 'Proposal acceptance within 48h',
    actualOutcome: 'Lead requested contract terms and onboarding kickoff',
    metric: 'Deal Velocity',
    result: 'positive',
    deltaValue: 60000,
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'lr-2',
    action: 'Deploy Contrarian Founder Hook Carousel',
    agentId: 'pixel',
    context: { platform: 'LinkedIn', targetOffer: 'Agency OS' },
    expectedOutcome: 'Achieve >3.5% CTR on inbound link',
    actualOutcome: 'Exceeded benchmark: 4.8% CTR with 42 email opt-ins',
    metric: 'Inbound CTR',
    result: 'positive',
    deltaValue: 4.8,
    timestamp: Date.now() - 86400000,
  },
];

export type LearningListener = (records: LearningRecord[]) => void;

export class LearningService {
  private records: LearningRecord[] = [];
  private listeners: Set<LearningListener> = new Set();

  constructor() {
    this.loadLearnings();
  }

  private loadLearnings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.records = parsed;
          return;
        }
      }
    } catch {
      // ignore
    }
    this.records = [...DEFAULT_LEARNINGS];
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.records));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.persist();
    const snapshot = [...this.records];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[LearningService] Subscriber error:', err);
      }
    });
  }

  public subscribe(listener: LearningListener): () => void {
    this.listeners.add(listener);
    listener([...this.records]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getLearnings(): LearningRecord[] {
    return [...this.records];
  }

  /**
   * Log an empirical operational outcome into the knowledge base
   */
  public recordLearning(params: {
    action: string;
    agentId: string;
    context: Record<string, any>;
    expectedOutcome: string;
    actualOutcome: string;
    metric: string;
    result: 'positive' | 'neutral' | 'negative';
    deltaValue?: number;
  }): LearningRecord {
    const record: LearningRecord = {
      id: `lr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action: params.action,
      agentId: params.agentId.toLowerCase().replace(/^agent_/, ''),
      context: params.context,
      expectedOutcome: params.expectedOutcome,
      actualOutcome: params.actualOutcome,
      metric: params.metric,
      result: params.result,
      deltaValue: params.deltaValue,
      timestamp: Date.now(),
    };

    this.records.unshift(record);
    this.notify();

    eventBus.emit('LEARNING_RECORD_CREATED', { record });
    return record;
  }
}

export const learningService = new LearningService();
