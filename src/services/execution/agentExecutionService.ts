/**
 * DIGITAL GROWTH WORLD™ — Agent Execution Service
 * Manages the state machine and autonomous execution pipeline:
 * TOOL REQUEST → VALIDATION → PERMISSION → HITL CHECK → EXECUTE → VERIFY → LOG
 */

import { agentToolRegistry } from '../agentToolRegistry';
import { approvalService } from './approvalService';
import { executionLedger } from './executionLedger';
import { autonomyService } from './autonomyService';
import { agentWorkQueueService } from './agentWorkQueueService';
import { eventBus } from '../eventBus';
import { ActionRiskLevel } from '../../types';

export class AgentExecutionService {
  constructor() {
    // Listen for founder approvals to resume execution
    eventBus.on('APPROVAL_RESOLVED', this.handleApprovalResolved.bind(this));
  }

  /**
   * Main entry point for an agent attempting to execute a tool.
   * Can be triggered by chat, or autonomously by NextBestAction processing.
   */
  public async requestExecution(params: {
    agentId: string;
    toolName: string;
    args: Record<string, any>;
    workItemId?: string;
  }): Promise<{ status: string; result?: any; executionId?: string; approvalId?: string; error?: string }> {
    const { agentId, toolName, args, workItemId } = params;
    const cleanAgent = agentId.toLowerCase().replace(/^agent_/, '');

    if (workItemId) {
      agentWorkQueueService.updateState(workItemId, 'EXECUTING');
    }

    // 1. Check Autonomy & Paused State
    const autonomy = autonomyService.getSettings(cleanAgent);
    if (autonomy.isPaused) {
      const err = 'Agent is currently paused by Founder.';
      if (workItemId) agentWorkQueueService.updateState(workItemId, 'BLOCKED', err);
      return { status: 'BLOCKED', error: err };
    }

    // 2. Fetch Tool Definition
    const toolDef = agentToolRegistry.getToolDefinition(toolName);
    if (!toolDef) {
      const err = `Tool ${toolName} not found in registry.`;
      if (workItemId) agentWorkQueueService.updateState(workItemId, 'FAILED', err);
      return { status: 'FAILED', error: err };
    }

    // 3. Evaluate Risk Level (Proxy via requiredPermissionLevel for now, could be explicit in registry)
    let riskLevel: ActionRiskLevel = 'LOW';
    if (toolDef.requiresHITLApproval) riskLevel = 'HIGH';
    else if (toolDef.permissionLevel >= 3) riskLevel = 'MEDIUM';

    // 4. Permission Check
    // (In a real app, verify against authenticated user or agent role explicitly. Registry enforces this via executeTool internally)

    // 5. HITL Approval Check
    if (toolDef.requiresHITLApproval) {
      // Create approval request
      const approval = approvalService.requestApproval({
        agentId: cleanAgent,
        tool: toolName,
        action: `Execute ${toolName}`,
        payload: args,
        riskLevel,
        reason: `Automated request by ${cleanAgent.toUpperCase()} for ${toolName}.`,
      });

      // Log pending execution
      const record = executionLedger.logExecutionStart({
        agentId: cleanAgent,
        toolName,
        requestArgs: args,
        riskLevel,
        approvalStatus: 'PENDING',
        approvalId: approval.id,
      });

      if (workItemId) {
        agentWorkQueueService.updateState(workItemId, 'WAITING_APPROVAL');
      }

      return {
        status: 'WAITING_APPROVAL',
        executionId: record.executionId,
        approvalId: approval.id,
      };
    }

    // 6. Immediate Execution (No HITL Required)
    const record = executionLedger.logExecutionStart({
      agentId: cleanAgent,
      toolName,
      requestArgs: args,
      riskLevel,
      approvalStatus: 'NOT_REQUIRED',
    });

    try {
      // Actually execute
      const result = await agentToolRegistry.executeTool(cleanAgent, toolName, args);

      // Log success
      executionLedger.logExecutionComplete(record.executionId, result);

      if (workItemId) {
        agentWorkQueueService.updateState(workItemId, 'COMPLETED', result);
      }

      return {
        status: 'SUCCEEDED',
        executionId: record.executionId,
        result,
      };
    } catch (err: any) {
      // Log failure
      executionLedger.logExecutionFailure(record.executionId, err.message || 'Unknown error');
      
      if (workItemId) {
        agentWorkQueueService.updateState(workItemId, 'FAILED', err.message);
      }

      return {
        status: 'FAILED',
        executionId: record.executionId,
        error: err.message,
      };
    }
  }

  /**
   * Resumes execution if a pending request is approved
   */
  private async handleApprovalResolved(payload: { requestId: string; status: 'APPROVED' | 'REJECTED'; resolvedBy: string }) {
    // Find matching execution record
    const records = executionLedger.getAllRecords();
    const record = records.find(r => r.approvalId === payload.requestId && r.executionStatus === 'RUNNING');
    
    if (!record) return; // Not found or already processed

    // Find associated work item
    const queues = agentWorkQueueService.getAllItems();
    const workItem = queues.find(i => i.agentId === record.agentId && i.state === 'WAITING_APPROVAL'); // Rough match

    if (payload.status === 'REJECTED') {
      executionLedger.logExecutionFailure(record.executionId, `Rejected by ${payload.resolvedBy}`);
      if (workItem) agentWorkQueueService.updateState(workItem.id, 'FAILED', 'Rejected by founder');
      return;
    }

    // Approved -> Execute
    if (workItem) agentWorkQueueService.updateState(workItem.id, 'EXECUTING');
    
    try {
      const result = await agentToolRegistry.executeTool(record.agentId, record.toolName, record.requestArgs);
      executionLedger.logExecutionComplete(record.executionId, result);
      if (workItem) agentWorkQueueService.updateState(workItem.id, 'COMPLETED', result);
    } catch (err: any) {
      executionLedger.logExecutionFailure(record.executionId, err.message || 'Unknown error');
      if (workItem) agentWorkQueueService.updateState(workItem.id, 'FAILED', err.message);
    }
  }
}

export const agentExecutionService = new AgentExecutionService();
