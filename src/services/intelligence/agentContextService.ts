/**
 * DIGITAL GROWTH WORLD™ — Scoped Agent Context Builder
 * Provides contextual retrieval for digital workers rather than unbounded prompt dumps.
 */

import { getAgentDefinition } from '../../agents/agentDefinitions';
import { bosManager } from '../bosManager';

export interface AgentContextPayload {
  agentId: string;
  agentRole: string;
  department: string;
  specialty: string;
  businessFacts: {
    mrr: number;
    cashRunwayMonths: number;
    activeSubscribers: number;
    pipelineValue: number;
  };
  taskContext?: {
    taskId: string;
    title: string;
    priority: string;
    category: string;
    description: string;
  };
  entityContext?: {
    entityType: 'lead' | 'opportunity' | 'funnel';
    entityId: string;
    name: string;
    status: string;
    value: number;
    details: Record<string, any>;
  };
  recentExecutions?: Array<{
    toolName: string;
    status: string;
    timestamp: number;
  }>;
}

export class AgentContextService {
  /**
   * Builds targeted operational context for an agent
   */
  public buildContext(params: {
    agentId: string;
    taskId?: string;
    entityId?: string;
    entityType?: 'lead' | 'opportunity' | 'funnel';
  }): AgentContextPayload {
    const cleanAgentId = params.agentId.toLowerCase().replace(/^agent_/, '');
    const def = getAgentDefinition(cleanAgentId);
    const snapshot = bosManager.getSnapshot();

    const payload: AgentContextPayload = {
      agentId: cleanAgentId,
      agentRole: def?.role || 'Digital Worker',
      department: def?.department || 'Operations',
      specialty: def?.specialty || 'General',
      businessFacts: {
        mrr: snapshot.moneySummary.mrr,
        cashRunwayMonths: snapshot.moneySummary.cashRunwayMonths,
        activeSubscribers: snapshot.moneySummary.activeSubscribers,
        pipelineValue: snapshot.moneySummary.pipelineValue,
      },
    };

    // 1. Task Context if taskId provided
    if (params.taskId) {
      const task = (snapshot.tasks || []).find((t) => t.id === params.taskId);
      if (task) {
        payload.taskContext = {
          taskId: task.id,
          title: task.title,
          priority: task.priority,
          category: task.category,
          description: task.description,
        };
      }
    }

    // 2. Entity Context (Lead or Opportunity)
    if (params.entityId) {
      if (params.entityType === 'lead' || !params.entityType) {
        const lead = (snapshot.leads || []).find((l) => l.id === params.entityId);
        if (lead) {
          payload.entityContext = {
            entityType: 'lead',
            entityId: lead.id,
            name: lead.companyName,
            status: lead.status,
            value: lead.estimatedValue,
            details: {
              contactName: lead.contactName,
              source: lead.source,
            },
          };
        }
      }

      if (!payload.entityContext && (params.entityType === 'opportunity' || !params.entityType)) {
        const opp = (snapshot.opportunities || []).find((o) => o.id === params.entityId);
        if (opp) {
          payload.entityContext = {
            entityType: 'opportunity',
            entityId: opp.id,
            name: opp.name,
            status: opp.status,
            value: opp.estimatedValue,
            details: {
              score: opp.score,
              intent: opp.commercialIntent,
              trafficPotential: opp.trafficPotential,
              action: opp.recommendedAction,
            },
          };
        }
      }
    }

    return payload;
  }
}

export const agentContextService = new AgentContextService();
