/**
 * DIGITAL GROWTH WORLD™ — Opportunity Domain Service
 * Manages commercial opportunities, market vectors, conversion funnels, and Next Best Action.
 */

import { Opportunity, FunnelRecord, NextBestAction } from '../../types';
import { eventBus } from '../eventBus';

const OPP_STORAGE_KEY = 'dgw_domain_opportunities';
const FUNNEL_STORAGE_KEY = 'dgw_domain_funnels';
const NBA_STORAGE_KEY = 'dgw_domain_nba';

const DEFAULT_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    name: 'B2B Enterprise Migration Pipeline',
    category: 'High-Intent Search',
    score: 87,
    commercialIntent: 'EXTREME',
    conversionProbability: 'HIGH',
    offerFit: 91,
    competition: 'MEDIUM',
    estimatedValue: 75000,
    trafficPotential: '4.2k qualified leads/mo',
    recommendedAction: 'Deploy Dedicated Migration Funnel',
    assignedAgentId: 'agent_closer',
    status: 'actionable',
    funnelReady: true,
  },
  {
    id: 'opp-2',
    name: 'Agency Operating System Expansion',
    category: 'Expansion',
    score: 93,
    commercialIntent: 'HIGH',
    conversionProbability: 'HIGH',
    offerFit: 96,
    competition: 'LOW',
    estimatedValue: 120000,
    trafficPotential: '12.5k organic visits/mo',
    recommendedAction: 'Launch Viral Case Study & Calculator',
    assignedAgentId: 'agent_pixel',
    status: 'analyzing',
    funnelReady: true,
  },
  {
    id: 'opp-3',
    name: 'High-Ticket Audit & Security Add-On',
    category: 'Pricing Leverage',
    score: 79,
    commercialIntent: 'HIGH',
    conversionProbability: 'MEDIUM',
    offerFit: 84,
    competition: 'LOW',
    estimatedValue: 48000,
    trafficPotential: '1.8k targeted queries/mo',
    recommendedAction: 'Automate Diagnostic Readiness Scan',
    assignedAgentId: 'agent_nova',
    status: 'actionable',
    funnelReady: false,
  },
  {
    id: 'opp-4',
    name: 'Operations Sprint Retainer Upsell',
    category: 'Conversion Funnel',
    score: 82,
    commercialIntent: 'MEDIUM',
    conversionProbability: 'HIGH',
    offerFit: 88,
    competition: 'MEDIUM',
    estimatedValue: 36000,
    trafficPotential: '850 warm existing client touchpoints',
    recommendedAction: 'Schedule Sprint Planning Review with Orbit',
    assignedAgentId: 'agent_orbit',
    status: 'actionable',
    funnelReady: true,
  }
];

const DEFAULT_FUNNELS: FunnelRecord[] = [
  {
    id: 'fn-1',
    name: 'Enterprise Diagnostic Funnel',
    opportunityId: 'opp-1',
    status: 'active',
    trafficSource: 'LinkedIn B2B + Organic Search',
    targetOffer: '$45,000 Migration Retainer',
    totalRevenue: 135000,
    conversionRate: 4.8,
    steps: [
      { id: 's1', name: 'Interactive Audit Landing', visitors: 6420, conversionRate: 28.5, dropoffRate: 71.5, assignedAgent: 'PIXEL' },
      { id: 's2', name: 'Readiness Scorecard', visitors: 1830, conversionRate: 52.0, dropoffRate: 48.0, assignedAgent: 'NOVA' },
      { id: 's3', name: 'Executive Strategy Call', visitors: 950, conversionRate: 34.0, dropoffRate: 66.0, assignedAgent: 'CLOSER' },
      { id: 's4', name: 'Sprint Contract Signed', visitors: 323, conversionRate: 100, dropoffRate: 0, assignedAgent: 'ORBIT' },
    ]
  },
  {
    id: 'fn-2',
    name: 'Viral Playbook & Case Study Funnel',
    opportunityId: 'opp-2',
    status: 'optimizing',
    trafficSource: 'X / Social Thought Leadership',
    targetOffer: '$12,000 Annual OS License',
    totalRevenue: 84000,
    conversionRate: 6.2,
    steps: [
      { id: 'v1', name: 'Viral Breakdown Hook', visitors: 14200, conversionRate: 18.2, dropoffRate: 81.8, assignedAgent: 'PIXEL' },
      { id: 'v2', name: 'Free Interactive Workspace Template', visitors: 2580, conversionRate: 46.0, dropoffRate: 54.0, assignedAgent: 'COACH' },
      { id: 'v3', name: 'Team Onboarding Demo', visitors: 1180, conversionRate: 41.5, dropoffRate: 58.5, assignedAgent: 'CLOSER' },
    ]
  }
];

const DEFAULT_NEXT_BEST_ACTION: NextBestAction = {
  id: 'nba-1',
  title: 'High-Intent Enterprise Pipeline Opportunity',
  tagline: 'Conversion window is optimal. Immediate attention recommended.',
  reason: 'Commercial intent score surged to 87. Offer fit is at 91% for Acme Corp and Global Retail prospects.',
  impactScore: 92,
  actionType: 'analyze_opportunity',
  agentId: 'agent_nova',
  actionLabel: 'Analyse Opportunity',
  metrics: {
    commercialIntent: 'EXTREME',
    opportunityScore: 87,
    offerFit: 91,
  }
};

export type OpportunityListener = (state: {
  opportunities: Opportunity[];
  funnels: FunnelRecord[];
  nextBestAction: NextBestAction;
}) => void;

class OpportunityDomainService {
  private opportunities: Opportunity[] = [];
  private funnels: FunnelRecord[] = [];
  private nextBestAction: NextBestAction = DEFAULT_NEXT_BEST_ACTION;
  private listeners: Set<OpportunityListener> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedOpps = localStorage.getItem(OPP_STORAGE_KEY);
      if (savedOpps) {
        const parsed = JSON.parse(savedOpps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.opportunities = parsed;
        } else {
          this.opportunities = [...DEFAULT_OPPORTUNITIES];
        }
      } else {
        this.opportunities = [...DEFAULT_OPPORTUNITIES];
      }

      const savedFunnels = localStorage.getItem(FUNNEL_STORAGE_KEY);
      if (savedFunnels) {
        const parsed = JSON.parse(savedFunnels);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.funnels = parsed;
        } else {
          this.funnels = [...DEFAULT_FUNNELS];
        }
      } else {
        this.funnels = [...DEFAULT_FUNNELS];
      }

      const savedNba = localStorage.getItem(NBA_STORAGE_KEY);
      if (savedNba) {
        this.nextBestAction = JSON.parse(savedNba);
      } else {
        this.nextBestAction = { ...DEFAULT_NEXT_BEST_ACTION };
      }
    } catch {
      this.opportunities = [...DEFAULT_OPPORTUNITIES];
      this.funnels = [...DEFAULT_FUNNELS];
      this.nextBestAction = { ...DEFAULT_NEXT_BEST_ACTION };
    }
  }

  private persist() {
    try {
      localStorage.setItem(OPP_STORAGE_KEY, JSON.stringify(this.opportunities));
      localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(this.funnels));
      localStorage.setItem(NBA_STORAGE_KEY, JSON.stringify(this.nextBestAction));
    } catch {
      // quota
    }
  }

  private notify() {
    this.persist();
    const snapshot = {
      opportunities: [...this.opportunities],
      funnels: [...this.funnels],
      nextBestAction: { ...this.nextBestAction },
    };
    this.listeners.forEach((l) => {
      try {
        l(snapshot);
      } catch (err) {
        console.error('[OpportunityService] Error notifying listener:', err);
      }
    });
  }

  /**
   * Subscribe to opportunity domain state changes
   */
  public subscribe(listener: OpportunityListener): () => void {
    this.listeners.add(listener);
    listener({
      opportunities: [...this.opportunities],
      funnels: [...this.funnels],
      nextBestAction: { ...this.nextBestAction },
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getAll(): Opportunity[] {
    return [...this.opportunities];
  }

  public getById(id: string): Opportunity | undefined {
    return this.opportunities.find((o) => o.id === id);
  }

  public getFunnels(): FunnelRecord[] {
    return [...this.funnels];
  }

  public getNextBestAction(): NextBestAction {
    return { ...this.nextBestAction };
  }

  /**
   * Transition opportunity status (analyzing, actionable, executed)
   */
  public updateOpportunityStatus(id: string, status: Opportunity['status']): Opportunity | undefined {
    let updated: Opportunity | undefined;
    this.opportunities = this.opportunities.map((o) => {
      if (o.id === id) {
        updated = { ...o, status };
        return updated;
      }
      return o;
    });

    if (updated) {
      this.recalculateNextBestAction();
      this.notify();
      eventBus.emit('OPPORTUNITY_UPDATED', {
        opportunityId: updated.id,
        status: updated.status,
      });
    }
    return updated;
  }

  /**
   * Update opportunity score
   */
  public updateOpportunityScore(id: string, score: number): Opportunity | undefined {
    let updated: Opportunity | undefined;
    this.opportunities = this.opportunities.map((o) => {
      if (o.id === id) {
        updated = { ...o, score: Math.max(0, Math.min(100, score)) };
        return updated;
      }
      return o;
    });

    if (updated) {
      this.notify();
      eventBus.emit('OPPORTUNITY_SCORE_CHANGED', {
        opportunityId: updated.id,
        score: updated.score,
      });
    }
    return updated;
  }

  /**
   * Set custom Next Best Action
   */
  public setNextBestAction(action: NextBestAction) {
    this.nextBestAction = action;
    this.notify();
    eventBus.emit('NEXT_BEST_ACTION_UPDATED', {
      actionId: action.id,
      title: action.title,
    });
  }

  /**
   * Recalculates Next Best Action automatically from top scoring actionable opportunity
   */
  public recalculateNextBestAction() {
    const highestOpp = [...this.opportunities]
      .filter((o) => o.status !== 'executed')
      .sort((a, b) => b.score - a.score)[0];

    if (highestOpp) {
      this.nextBestAction = {
        id: `nba-${highestOpp.id}`,
        title: highestOpp.name,
        tagline: `${highestOpp.category} opportunity with ${highestOpp.commercialIntent} commercial intent.`,
        reason: `Opportunity score is ${highestOpp.score}/100 with ${highestOpp.offerFit}% offer fit. Potential value: $${highestOpp.estimatedValue.toLocaleString()}.`,
        impactScore: highestOpp.score,
        actionType: highestOpp.funnelReady ? 'launch_funnel' : 'analyze_opportunity',
        agentId: highestOpp.assignedAgentId || 'agent_nova',
        actionLabel: highestOpp.funnelReady ? 'Launch Funnel' : 'Analyze Pipeline',
        metrics: {
          commercialIntent: highestOpp.commercialIntent,
          opportunityScore: highestOpp.score,
          offerFit: highestOpp.offerFit,
        }
      };
      eventBus.emit('NEXT_BEST_ACTION_UPDATED', {
        actionId: this.nextBestAction.id,
        title: this.nextBestAction.title,
      });
    }
  }

  /**
   * Add a new commercial opportunity
   */
  public addOpportunity(opp: Omit<Opportunity, 'id'>): Opportunity {
    const newOpp: Opportunity = {
      ...opp,
      id: `opp-${Date.now()}`,
    };
    this.opportunities.unshift(newOpp);
    this.recalculateNextBestAction();
    this.notify();
    eventBus.emit('OPPORTUNITY_UPDATED', {
      opportunityId: newOpp.id,
      status: newOpp.status,
    });
    return newOpp;
  }
}

export const opportunityService = new OpportunityDomainService();
