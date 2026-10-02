/**
 * DIGITAL GROWTH WORLD™ — Agent Tool Registry & Security Layer
 * Enforces typed schemas, permission levels, and Human-In-The-Loop gating.
 */

import { eventBus } from './eventBus';
import { taskService, opportunityService, leadService } from './domain';

export type ToolPermissionLevel = 0 | 1 | 2 | 3 | 4;

export interface ToolExecutionResult {
  success: boolean;
  toolName: string;
  result?: any;
  error?: string;
  requiresApproval?: boolean;
}

export interface RegisteredTool {
  name: string;
  description: string;
  allowedAgents: string[]; // Agent IDs permitted to invoke this tool
  permissionLevel: ToolPermissionLevel;
  requiresHITLApproval: boolean;
  validateArgs: (args: any) => { valid: boolean; error?: string };
  execute: (agentId: string, args: any, context?: any) => Promise<any>;
}

class AgentToolRegistryService {
  private tools: Map<string, RegisteredTool> = new Map();

  constructor() {
    this.registerCoreTools();
  }

  /**
   * Register system-level tools with security constraints
   */
  private registerCoreTools() {
    // 1. createTask (Operations, Strategy, Creative)
    this.register({
      name: 'createTask',
      description: 'Creates a structured task card in the sprint backlog.',
      allowedAgents: ['nova', 'pixel', 'closer', 'orbit', 'coach'],
      permissionLevel: 3,
      requiresHITLApproval: false,
      validateArgs: (args) => {
        if (!args || typeof args !== 'object') return { valid: false, error: 'Arguments must be an object' };
        const title = args.title || args.taskName || args.projectName;
        if (!title || typeof title !== 'string') return { valid: false, error: 'Task title is required' };
        return { valid: true };
      },
      execute: async (agentId, args, context) => {
        const title = args.title || args.taskName || args.projectName || 'New Action Task';
        const description = args.description || args.message || `Created by ${agentId.toUpperCase()}`;
        const category = args.category || 'Operations';
        const agentTag = `agent_${agentId.toLowerCase().replace(/^agent_/, '')}`;

        // Create in TaskDomainService (emits TASK_CREATED and persists to Storage)
        const createdTask = taskService.createTask({
          title,
          description,
          category,
          assignedToAgentId: agentTag,
          priority: args.priority || 'medium',
          xpReward: args.xpReward || 200,
        });

        if (context?.onTaskCreated) {
          context.onTaskCreated({ title, description, category });
        }

        return { created: true, task: createdTask };
      },
    });

    // 2. startFocusSession (Coach only)
    this.register({
      name: 'startFocusSession',
      description: 'Activates a timed deep work Pomodoro focus session.',
      allowedAgents: ['coach'],
      permissionLevel: 3,
      requiresHITLApproval: false,
      validateArgs: (args) => {
        const duration = args?.durationMinutes || 25;
        if (typeof duration !== 'number' || duration < 1 || duration > 180) {
          return { valid: false, error: 'Duration must be a number between 1 and 180 minutes' };
        }
        return { valid: true };
      },
      execute: async (_agentId, args, context) => {
        const duration = Number(args?.durationMinutes) || 25;
        const goal = args?.goal || 'Deep focus sprint';

        if (context?.onStartFocusSession) {
          context.onStartFocusSession(duration);
        }

        eventBus.emit('FOCUS_SESSION_STARTED', {
          durationMinutes: duration,
          goal,
        });

        return { sessionStarted: true, durationMinutes: duration, goal };
      },
    });

    // 3. getAudit / calculateReadiness (Nova only)
    this.register({
      name: 'getAudit',
      description: 'Retrieves diagnostic readiness analysis across enterprise pillars.',
      allowedAgents: ['nova'],
      permissionLevel: 0,
      requiresHITLApproval: false,
      validateArgs: () => ({ valid: true }),
      execute: async () => {
        return {
          readinessScore: 84,
          pillars: {
            architecture: 78,
            marketing: 89,
            sales: 82,
            operations: 87,
          },
          summary: 'High market momentum, operational automation recommended.',
        };
      },
    });

    // 4. createActionPlan (Nova, Orbit)
    this.register({
      name: 'createActionPlan',
      description: 'Synthesizes multi-step strategic execution plan.',
      allowedAgents: ['nova', 'orbit'],
      permissionLevel: 2,
      requiresHITLApproval: false,
      validateArgs: (args) => {
        if (!args?.title) return { valid: false, error: 'Action plan title is required' };
        return { valid: true };
      },
      execute: async (agentId, args, context) => {
        const title = args.title;
        const steps = Array.isArray(args.steps) ? args.steps : ['Initial audit', 'Sprint execution', 'Review'];
        const agentTag = `agent_${agentId.toLowerCase().replace(/^agent_/, '')}`;

        const createdTask = taskService.createTask({
          title: `Plan: ${title}`,
          description: steps.join(' → '),
          category: agentId === 'nova' ? 'Growth' : 'Operations',
          assignedToAgentId: agentTag,
          priority: 'high',
          xpReward: 350,
        });

        if (context?.onTaskCreated) {
          context.onTaskCreated({
            title: `Plan: ${title}`,
            description: steps.join(' → '),
            category: agentId === 'nova' ? 'Growth' : 'Operations',
          });
        }

        return { planCreated: true, title, task: createdTask, stepCount: steps.length };
      },
    });

    // 5. sendProposal (Closer only - High-Impact HITL)
    this.register({
      name: 'sendProposal',
      description: 'Sends formal commercial proposal to client prospect.',
      allowedAgents: ['closer'],
      permissionLevel: 4,
      requiresHITLApproval: true,
      validateArgs: (args) => {
        if (!args?.leadId && !args?.clientName) return { valid: false, error: 'Client or Lead ID required' };
        return { valid: true };
      },
      execute: async (_agentId, args) => {
        // High impact action requires human approval
        return {
          status: 'PENDING_FOUNDER_APPROVAL',
          message: `Proposal for ${args.clientName || args.leadId} ($${args.value || 'Custom'}) prepared. Awaiting Alex's sign-off.`,
        };
      },
    });

    // 6. addLead (Closer, Nova)
    this.register({
      name: 'addLead',
      description: 'Adds a high-intent prospect to the CRM and sales pipeline.',
      allowedAgents: ['closer', 'nova'],
      permissionLevel: 2,
      requiresHITLApproval: false,
      validateArgs: (args) => {
        if (!args?.companyName) return { valid: false, error: 'companyName is required' };
        return { valid: true };
      },
      execute: async (_agentId, args) => {
        const newLead = leadService.addLead({
          companyName: args.companyName,
          contactName: args.contactName || 'Lead Executive',
          source: args.source || 'Agent Discovery',
          status: args.status || 'new',
          estimatedValue: Number(args.estimatedValue) || 35000,
        });
        return { leadCreated: true, lead: newLead };
      },
    });

    // 7. updateOpportunity (Nova, Orbit)
    this.register({
      name: 'updateOpportunity',
      description: 'Updates commercial opportunity status or analysis score.',
      allowedAgents: ['nova', 'orbit'],
      permissionLevel: 2,
      requiresHITLApproval: false,
      validateArgs: (args) => {
        if (!args?.id) return { valid: false, error: 'opportunity id is required' };
        return { valid: true };
      },
      execute: async (_agentId, args) => {
        let opp;
        if (args.status) {
          opp = opportunityService.updateOpportunityStatus(args.id, args.status);
        }
        if (args.score !== undefined) {
          opp = opportunityService.updateOpportunityScore(args.id, Number(args.score));
        }
        return { updated: true, opportunity: opp };
      },
    });
  }

  /**
   * Register a new tool
   */
  public register(tool: RegisteredTool) {
    this.tools.set(tool.name, tool);
  }

  /**
   * Get a registered tool definition
   */
  public getToolDefinition(name: string): RegisteredTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Validate and execute a tool safely
   */
  public async executeTool(
    agentId: string,
    toolName: string,
    args: any,
    context?: any
  ): Promise<ToolExecutionResult> {
    const cleanAgentId = agentId.toLowerCase().replace(/^agent_/, '');
    const tool = this.tools.get(toolName);

    eventBus.emit('AGENT_TOOL_REQUESTED', {
      agentId: cleanAgentId,
      toolName,
      args,
    });

    // Check 1: Tool Existence
    if (!tool) {
      const error = `Tool "${toolName}" is not registered in the system.`;
      eventBus.emit('AGENT_TOOL_EXECUTED', { agentId: cleanAgentId, toolName, success: false, error });
      return { success: false, toolName, error };
    }

    // Check 2: Permission Enforcement
    if (!tool.allowedAgents.includes(cleanAgentId)) {
      const error = `Permission Denied: Agent "${cleanAgentId.toUpperCase()}" is not authorized to invoke tool "${toolName}".`;
      eventBus.emit('AGENT_TOOL_EXECUTED', { agentId: cleanAgentId, toolName, success: false, error });
      return { success: false, toolName, error };
    }

    // Check 3: Argument Validation
    const validation = tool.validateArgs(args);
    if (!validation.valid) {
      const error = `Argument Validation Failed for "${toolName}": ${validation.error}`;
      eventBus.emit('AGENT_TOOL_EXECUTED', { agentId: cleanAgentId, toolName, success: false, error });
      return { success: false, toolName, error };
    }

    // Check 4: Human-in-the-Loop Gating
    if (tool.requiresHITLApproval) {
      const result = await tool.execute(cleanAgentId, args, context);
      eventBus.emit('AGENT_TOOL_EXECUTED', { agentId: cleanAgentId, toolName, success: true, result });
      return { success: true, toolName, result, requiresApproval: true };
    }

    // Execution
    try {
      const result = await tool.execute(cleanAgentId, args, context);
      eventBus.emit('AGENT_TOOL_EXECUTED', { agentId: cleanAgentId, toolName, success: true, result });
      return { success: true, toolName, result };
    } catch (err: any) {
      const error = err?.message || 'Unexpected tool execution failure';
      eventBus.emit('AGENT_TOOL_EXECUTED', { agentId: cleanAgentId, toolName, success: false, error });
      return { success: false, toolName, error };
    }
  }
}

export const agentToolRegistry = new AgentToolRegistryService();
