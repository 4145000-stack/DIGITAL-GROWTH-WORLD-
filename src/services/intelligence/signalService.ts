/**
 * DIGITAL GROWTH WORLD™ — Operational Signal & Anomaly Detection Service
 * Detects commercial urgency, operational bottlenecks, revenue anomalies, and risk events.
 */

import { BusinessSignal, SignalType, SignalSeverity } from '../../types';
import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_signals';

const DEFAULT_SIGNALS: BusinessSignal[] = [
  {
    id: 'sig-1',
    type: 'HIGH_VALUE_LEAD',
    severity: 'high',
    title: 'High-Value Enterprise Lead Uncontacted',
    description: 'Apex Health Systems ($95,000 estimated value) requires immediate high-touch outreach.',
    entityType: 'lead',
    entityId: 'l3',
    evidence: { value: 95000, company: 'Apex Health Systems', stage: 'qualified' },
    detectedAt: Date.now() - 3600000,
    status: 'active',
  },
  {
    id: 'sig-2',
    type: 'STALLING_OPPORTUNITY',
    severity: 'medium',
    title: 'High-Intent Pipeline Awaiting Funnel Deployment',
    description: 'B2B Enterprise Migration Pipeline has score 87 but conversion funnel has not been published.',
    entityType: 'opportunity',
    entityId: 'opp-1',
    evidence: { score: 87, intent: 'EXTREME', daysStalled: 3 },
    detectedAt: Date.now() - 7200000,
    status: 'active',
  },
  {
    id: 'sig-3',
    type: 'EXPERIMENT_WIN',
    severity: 'low',
    title: 'Ad Variant B Outperforming Control (+14.2% CVR)',
    description: 'Interactive demo variant reached statistical significance on the agency expansion page.',
    entityType: 'funnel',
    entityId: 'funnel-1',
    evidence: { variant: 'Variant B', uplift: 14.2, pValue: 0.02 },
    detectedAt: Date.now() - 14400000,
    status: 'acknowledged',
  },
];

export type SignalListener = (signals: BusinessSignal[]) => void;

export class SignalService {
  private signals: BusinessSignal[] = [];
  private listeners: Set<SignalListener> = new Set();

  constructor() {
    this.loadSignals();
  }

  private loadSignals() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.signals = parsed;
          return;
        }
      }
    } catch {
      // ignore
    }
    this.signals = [...DEFAULT_SIGNALS];
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.signals));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.persist();
    const snapshot = [...this.signals];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[SignalService] Subscriber error:', err);
      }
    });
  }

  public subscribe(listener: SignalListener): () => void {
    this.listeners.add(listener);
    listener([...this.signals]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getActiveSignals(): BusinessSignal[] {
    return this.signals.filter((s) => s.status !== 'resolved');
  }

  public getAllSignals(): BusinessSignal[] {
    return [...this.signals];
  }

  /**
   * Emit or upsert a new operational signal
   */
  public emitSignal(params: {
    type: SignalType;
    severity: SignalSeverity;
    title: string;
    description: string;
    entityType: BusinessSignal['entityType'];
    entityId?: string;
    evidence: Record<string, any>;
  }): BusinessSignal {
    // Avoid duplicate active signal for same entity and type
    const existing = this.signals.find(
      (s) => s.type === params.type && s.entityId === params.entityId && s.status === 'active'
    );
    if (existing) {
      existing.title = params.title;
      existing.description = params.description;
      existing.evidence = params.evidence;
      existing.severity = params.severity;
      this.notify();
      return existing;
    }

    const signal: BusinessSignal = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: params.type,
      severity: params.severity,
      title: params.title,
      description: params.description,
      entityType: params.entityType,
      entityId: params.entityId,
      evidence: params.evidence,
      detectedAt: Date.now(),
      status: 'active',
    };

    this.signals.unshift(signal);
    this.notify();

    eventBus.emit('SIGNAL_DETECTED', { signal });
    return signal;
  }

  public resolveSignal(signalId: string): boolean {
    const sig = this.signals.find((s) => s.id === signalId);
    if (sig) {
      sig.status = 'resolved';
      this.notify();
      eventBus.emit('SIGNAL_RESOLVED', { signalId });
      return true;
    }
    return false;
  }

  public acknowledgeSignal(signalId: string): boolean {
    const sig = this.signals.find((s) => s.id === signalId);
    if (sig && sig.status === 'active') {
      sig.status = 'acknowledged';
      this.notify();
      return true;
    }
    return false;
  }

  /**
   * Deterministic Anomaly Evaluation Rules
   * Scans existing Business OS snapshot to uncover operational bottlenecks
   */
  public evaluateDomainAnomalies(domainData: {
    leads?: any[];
    opportunities?: any[];
    tasks?: any[];
    financeSummary?: any;
  }) {
    // 1. High value leads in 'qualified' stage
    if (Array.isArray(domainData.leads)) {
      for (const lead of domainData.leads) {
        if (lead.status === 'qualified' && (lead.estimatedValue || 0) >= 50000) {
          this.emitSignal({
            type: 'HIGH_VALUE_LEAD',
            severity: lead.estimatedValue >= 80000 ? 'critical' : 'high',
            title: `High-Value Opportunity Ready for Contract: ${lead.companyName}`,
            description: `${lead.companyName} ($${lead.estimatedValue.toLocaleString()}) has been qualified. Immediate proposal dispatch recommended.`,
            entityType: 'lead',
            entityId: lead.id,
            evidence: { estimatedValue: lead.estimatedValue, contactName: lead.contactName },
          });
        }
      }
    }

    // 2. High-score opportunities still in 'actionable' without active execution
    if (Array.isArray(domainData.opportunities)) {
      for (const opp of domainData.opportunities) {
        if (opp.score >= 85 && opp.status === 'actionable') {
          this.emitSignal({
            type: 'STALLING_OPPORTUNITY',
            severity: 'high',
            title: `Actionable Opportunity Awaiting Deployment: ${opp.name}`,
            description: `Opportunity score ${opp.score}/100 with ${opp.commercialIntent} commercial intent. Ready for agent assignment.`,
            entityType: 'opportunity',
            entityId: opp.id,
            evidence: { score: opp.score, estimatedValue: opp.estimatedValue },
          });
        }
      }
    }

    // 3. Overdue or high-priority tasks
    if (Array.isArray(domainData.tasks)) {
      const urgentTasks = domainData.tasks.filter((t) => t.priority === 'high' && t.status === 'todo');
      if (urgentTasks.length >= 3) {
        this.emitSignal({
          type: 'OVERDUE_TASK',
          severity: 'medium',
          title: `Operational Backlog Accumulating (${urgentTasks.length} Urgent Tasks)`,
          description: `Multiple high-priority tasks pending assignment to digital agents.`,
          entityType: 'task',
          evidence: { taskCount: urgentTasks.length },
        });
      }
    }
  }
}

export const signalService = new SignalService();
