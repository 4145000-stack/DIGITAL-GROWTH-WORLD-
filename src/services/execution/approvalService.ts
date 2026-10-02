/**
 * DIGITAL GROWTH WORLD™ — Human Approval Centre (HITL) Service
 * Manages founder sign-offs for high-impact commercial, financial, and external actions.
 * Durable persistence guarantees pending approvals survive browser reload.
 */

import { ApprovalRequest, ActionRiskLevel } from '../../types';
import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_approvals';

const DEFAULT_APPROVALS: ApprovalRequest[] = [
  {
    id: 'appr-1',
    requestedBy: 'agent_closer',
    agentId: 'closer',
    tool: 'sendProposal',
    action: 'Dispatch Enterprise Proposal & ROI Contract',
    payload: {
      leadId: 'l3',
      clientName: 'Apex Health Systems',
      value: 95000,
      proposalTitle: 'Enterprise Growth OS & Migration SLA',
    },
    riskLevel: 'HIGH',
    reason: 'Enterprise deal ready for contract closing. Formal terms require founder review before external dispatch.',
    customerName: 'Apex Health Systems',
    commercialValue: 95000,
    status: 'PENDING',
    requestedAt: Date.now() - 3600000,
  },
];

export type ApprovalListener = (approvals: ApprovalRequest[]) => void;

export class ApprovalService {
  private approvals: ApprovalRequest[] = [];
  private listeners: Set<ApprovalListener> = new Set();

  constructor() {
    this.loadApprovals();
  }

  private loadApprovals() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.approvals = parsed;
          return;
        }
      }
    } catch {
      // ignore
    }
    this.approvals = [...DEFAULT_APPROVALS];
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.approvals));
    } catch {
      // ignore
    }
  }

  private notify() {
    this.persist();
    const snapshot = [...this.approvals];
    this.listeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[ApprovalService] Subscriber error:', err);
      }
    });
  }

  public subscribe(listener: ApprovalListener): () => void {
    this.listeners.add(listener);
    listener([...this.approvals]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getPendingApprovals(): ApprovalRequest[] {
    return this.approvals.filter((a) => a.status === 'PENDING');
  }

  public getAllApprovals(): ApprovalRequest[] {
    return [...this.approvals];
  }

  /**
   * Request founder sign-off for a high-risk operational action
   */
  public requestApproval(params: {
    agentId: string;
    tool: string;
    action: string;
    payload: Record<string, any>;
    riskLevel: ActionRiskLevel;
    reason: string;
    customerName?: string;
    commercialValue?: number;
  }): ApprovalRequest {
    const cleanAgent = params.agentId.toLowerCase().replace(/^agent_/, '');
    const request: ApprovalRequest = {
      id: `appr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      requestedBy: `agent_${cleanAgent}`,
      agentId: cleanAgent,
      tool: params.tool,
      action: params.action,
      payload: params.payload,
      riskLevel: params.riskLevel,
      reason: params.reason,
      customerName: params.customerName,
      commercialValue: params.commercialValue,
      status: 'PENDING',
      requestedAt: Date.now(),
    };

    this.approvals.unshift(request);
    this.notify();

    eventBus.emit('APPROVAL_REQUESTED', { request });
    eventBus.emit('NOTIFICATION_DISPATCHED', {
      message: `Approval requested: ${cleanAgent.toUpperCase()} wants to execute "${params.action}".`,
      type: 'warning',
    });

    return request;
  }

  /**
   * Founder approves the requested action
   */
  public approve(requestId: string, founderName = 'Alex (Founder)'): ApprovalRequest | null {
    const request = this.approvals.find((a) => a.id === requestId);
    if (!request || request.status !== 'PENDING') return null;

    request.status = 'APPROVED';
    request.resolvedAt = Date.now();
    request.resolvedBy = founderName;

    this.notify();

    eventBus.emit('APPROVAL_RESOLVED', {
      requestId,
      status: 'APPROVED',
      resolvedBy: founderName,
    });

    eventBus.emit('NOTIFICATION_DISPATCHED', {
      message: `Action Approved: "${request.action}" authorized by ${founderName}.`,
      type: 'success',
    });

    return request;
  }

  /**
   * Founder rejects the requested action
   */
  public reject(requestId: string, reason = 'Rejected by Founder', founderName = 'Alex (Founder)'): ApprovalRequest | null {
    const request = this.approvals.find((a) => a.id === requestId);
    if (!request || request.status !== 'PENDING') return null;

    request.status = 'REJECTED';
    request.resolvedAt = Date.now();
    request.resolvedBy = founderName;
    request.rejectionReason = reason;

    this.notify();

    eventBus.emit('APPROVAL_RESOLVED', {
      requestId,
      status: 'REJECTED',
      resolvedBy: founderName,
    });

    eventBus.emit('NOTIFICATION_DISPATCHED', {
      message: `Action Rejected: "${request.action}" denied by ${founderName}.`,
      type: 'error',
    });

    return request;
  }
}

export const approvalService = new ApprovalService();
