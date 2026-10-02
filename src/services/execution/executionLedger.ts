/**
 * DIGITAL GROWTH WORLD™ — Tool Execution Ledger
 * Durable audit trail of all AI agent operational tool invocations.
 */

import { ToolExecutionRecord, ExecutionStatus, ActionRiskLevel } from '../../types';
import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_execution_ledger';

export type ExecutionListener = (records: ToolExecutionRecord[]) => void;

export class ExecutionLedgerService {
  private records: ToolExecutionRecord[] = [];
  private listeners: Set<ExecutionListener> = new Set();

  constructor() {
    this.loadRecords();
  }

  private loadRecords() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          this.records = parsed;
          return;
        }
      }
    } catch {
      // ignore
    }
    this.records = [];
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
        console.error('[ExecutionLedger] Subscriber error:', err);
      }
    });
  }

  public subscribe(listener: ExecutionListener): () => void {
    this.listeners.add(listener);
    listener([...this.records]);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAllRecords(): ToolExecutionRecord[] {
    return [...this.records];
  }

  public getAgentRecords(agentId: string): ToolExecutionRecord[] {
    return this.records.filter((r) => r.agentId === agentId);
  }

  /**
   * Log the start of a tool execution
   */
  public logExecutionStart(params: {
    agentId: string;
    toolName: string;
    requestArgs: Record<string, any>;
    riskLevel: ActionRiskLevel;
    approvalStatus: ToolExecutionRecord['approvalStatus'];
    approvalId?: string;
    idempotencyKey?: string;
  }): ToolExecutionRecord {
    const record: ToolExecutionRecord = {
      executionId: `exec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      agentId: params.agentId.toLowerCase().replace(/^agent_/, ''),
      toolName: params.toolName,
      requestArgs: params.requestArgs,
      riskLevel: params.riskLevel,
      approvalStatus: params.approvalStatus,
      approvalId: params.approvalId,
      executionStatus: 'RUNNING',
      startedAt: Date.now(),
      idempotencyKey: params.idempotencyKey,
    };

    this.records.unshift(record);
    this.notify();
    
    eventBus.emit('TOOL_EXECUTION_RECORDED', { record });
    return record;
  }

  /**
   * Complete an execution log
   */
  public logExecutionComplete(executionId: string, result: any) {
    const record = this.records.find((r) => r.executionId === executionId);
    if (!record) return;

    record.executionStatus = 'SUCCEEDED';
    record.completedAt = Date.now();
    record.result = result;
    this.notify();
    
    eventBus.emit('TOOL_EXECUTION_RECORDED', { record });
  }

  /**
   * Fail an execution log
   */
  public logExecutionFailure(executionId: string, error: string) {
    const record = this.records.find((r) => r.executionId === executionId);
    if (!record) return;

    record.executionStatus = 'FAILED';
    record.completedAt = Date.now();
    record.error = error;
    this.notify();
    
    eventBus.emit('TOOL_EXECUTION_RECORDED', { record });
  }
}

export const executionLedger = new ExecutionLedgerService();
