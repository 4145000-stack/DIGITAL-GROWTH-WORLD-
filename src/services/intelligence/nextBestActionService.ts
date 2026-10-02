/**
 * DIGITAL GROWTH WORLD™ — Next Best Action Service
 * Synthesizes global Business OS state into the single highest-leverage commercial action
 * with transparent, inspectable contributing factors.
 */

import { NextBestAction, Opportunity, Lead, TaskItem } from '../../types';
import { eventBus } from '../eventBus';
import { opportunityIntelligence } from './opportunityIntelligence';

const STORAGE_KEY = 'dgw_domain_nba_active';

export class NextBestActionService {
  private currentAction: NextBestAction | null = null;
  private listeners: Set<(action: NextBestAction | null) => void> = new Set();

  constructor() {
    this.loadAction();
  }

  private loadAction() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.currentAction = JSON.parse(saved);
      }
    } catch {
      // ignore
    }
  }

  private persist() {
    try {
      if (this.currentAction) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.currentAction));
      }
    } catch {
      // ignore
    }
  }

  private notify() {
    this.persist();
    const action = this.currentAction ? { ...this.currentAction } : null;
    this.listeners.forEach((listener) => {
      try {
        listener(action);
      } catch (err) {
        console.error('[NextBestActionService] Subscriber error:', err);
      }
    });
  }

  public subscribe(listener: (action: NextBestAction | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentAction ? { ...this.currentAction } : null);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getNextBestAction(): NextBestAction | null {
    return this.currentAction ? { ...this.currentAction } : null;
  }

  /**
   * Recalculates the Next Best Action based on real domain state
   */
  public evaluateState(params: {
    opportunities: Opportunity[];
    leads: Lead[];
    tasks: TaskItem[];
  }): NextBestAction {
    const { opportunities = [], leads = [], tasks = [] } = params;

    // 1. Check for highest-value qualified lead awaiting closing
    const qualifiedLeads = leads
      .filter((l) => l.status === 'qualified')
      .sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));

    // 2. Check for highest-scored actionable opportunity
    const actionableOpps = opportunities
      .map((opp) => ({
        opp,
        scoreDetail: opportunityIntelligence.scoreOpportunity(opp),
      }))
      .sort((a, b) => b.scoreDetail.score - a.scoreDetail.score);

    // Decision: If we have an enterprise qualified lead >= R50,000, that is the immediate revenue priority for Closer
    if (qualifiedLeads.length > 0 && qualifiedLeads[0].estimatedValue >= 50000) {
      const topLead = qualifiedLeads[0];
      const action: NextBestAction = {
        id: `nba-lead-${topLead.id}`,
        title: `Dispatch Enterprise Commercial Proposal to ${topLead.companyName}`,
        tagline: `High-Intent Deal Stage: Contract Closing & Value Guarantee`,
        reason: `Qualified enterprise lead with $${topLead.estimatedValue.toLocaleString()} pipeline value. Rapid engagement within 24h yields a 3.8x higher win rate.`,
        impactScore: 96,
        actionType: 'call_prospect',
        agentId: 'closer',
        actionLabel: 'Execute Closer Sequence',
        metrics: {
          commercialIntent: 'EXTREME',
          opportunityScore: 96,
          offerFit: 94,
        },
        factors: [
          `Lead status: qualified enterprise tier`,
          `Commercial value: $${topLead.estimatedValue.toLocaleString()}`,
          `Primary contact: ${topLead.contactName}`,
          `Recommended agent: CLOSER`,
        ],
        expectedOutcome: `Secure signed retainer and advance lead to won status with $${topLead.estimatedValue.toLocaleString()} revenue`,
        targetEntityId: topLead.id,
        targetEntityType: 'lead',
      };

      this.currentAction = action;
      this.notify();
      eventBus.emit('NEXT_BEST_ACTION_GENERATED', { action });
      return action;
    }

    // Otherwise, check top actionable opportunity
    if (actionableOpps.length > 0) {
      const { opp, scoreDetail } = actionableOpps[0];
      const agent = opp.assignedAgentId ? opp.assignedAgentId.replace(/^agent_/, '') : 'nova';
      const action: NextBestAction = {
        id: `nba-opp-${opp.id}`,
        title: opp.recommendedAction || `Activate ${opp.name}`,
        tagline: `Top Opportunity Score: ${scoreDetail.score}/100 with ${opp.commercialIntent} Intent`,
        reason: scoreDetail.summary,
        impactScore: scoreDetail.score,
        actionType: opp.funnelReady ? 'launch_funnel' : 'analyze_opportunity',
        agentId: agent,
        actionLabel: opp.funnelReady ? 'Deploy Growth Funnel' : 'Assign Agent Execution',
        metrics: {
          commercialIntent: opp.commercialIntent,
          opportunityScore: scoreDetail.score,
          offerFit: opp.offerFit,
        },
        factors: [
          `Commercial Intent contribution: +${scoreDetail.factors.commercialIntent}`,
          `Economic Value contribution: +${scoreDetail.factors.economicValue}`,
          `Conversion Probability contribution: +${scoreDetail.factors.conversionProbability}`,
          `Urgency contribution: +${scoreDetail.factors.urgency}`,
          `Assigned operator: ${agent.toUpperCase()}`,
        ],
        expectedOutcome: `Capture estimated ${opp.trafficPotential || 'inbound leads'} and generate $${opp.estimatedValue.toLocaleString()} pipeline value`,
        targetEntityId: opp.id,
        targetEntityType: 'opportunity',
      };

      this.currentAction = action;
      this.notify();
      eventBus.emit('NEXT_BEST_ACTION_GENERATED', { action });
      return action;
    }

    // Fallback default strategic action
    const defaultAction: NextBestAction = {
      id: 'nba-default',
      title: 'Run Diagnostic Strategic Audit & Campaign Sprints',
      tagline: 'Align High-Leverage Strategic Vectors with Nova',
      reason: 'Synchronize commercial positioning and eliminate backlog bottlenecks.',
      impactScore: 84,
      actionType: 'run_audit',
      agentId: 'nova',
      actionLabel: 'Initiate Strategic Audit',
      metrics: {
        commercialIntent: 'HIGH',
        opportunityScore: 84,
        offerFit: 88,
      },
      factors: [
        'Multi-agent capacity available',
        'Cross-department synchronization ready',
      ],
      expectedOutcome: 'Identify new $100k+ growth opportunities across sales and marketing funnels',
    };

    this.currentAction = defaultAction;
    this.notify();
    return defaultAction;
  }
}

export const nextBestActionService = new NextBestActionService();
