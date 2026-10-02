/**
 * DIGITAL GROWTH WORLD™ — Business OS Unified Facade
 * Provides orchestrating facade connecting TaskService, OpportunityService,
 * LeadService, and FinanceService with the UI, World Engine, and Agent Runtime.
 */

import {
  ClientRecord,
  AuditRecord,
  Proposal,
  Project,
  Lead,
  MarketingCampaign,
  AnalyticsData,
  Opportunity,
  FunnelRecord,
  NextBestAction,
  TaskItem,
  BusinessSignal,
  AgentWorkItem,
  ApprovalRequest
} from '../types';
import { taskService } from './domain/taskService';
import { opportunityService } from './domain/opportunityService';
import { leadService } from './domain/leadService';
import { financeService, CompanyFinanceSummary } from './domain/financeService';
import { signalService, nextBestActionService } from './intelligence';
import { agentWorkQueueService, approvalService } from './execution';

export interface BOSStateSnapshot {
  opportunities: Opportunity[];
  funnels: FunnelRecord[];
  nextBestAction: NextBestAction;
  leads: Lead[];
  proposals: Proposal[];
  clients: ClientRecord[];
  audits: AuditRecord[];
  moneySummary: CompanyFinanceSummary;
  tasks: TaskItem[];
  campaigns: MarketingCampaign[];
  analytics: AnalyticsData;
  projects: Project[];
  signals: BusinessSignal[];
  agentWorkQueues: AgentWorkItem[];
  pendingApprovals: ApprovalRequest[];
}

export type BOSListener = (snapshot: BOSStateSnapshot) => void;

class BusinessOperatingSystem {
  // Static marketing & analytics data
  public campaigns: MarketingCampaign[] = [
    { id: 'm1', name: 'Q4 Enterprise Inbound (LinkedIn)', platform: 'LinkedIn B2B', status: 'active', budget: 8000, spend: 3400, leadsGenerated: 42 },
    { id: 'm2', name: 'Founder Growth Playbook (Organic X)', platform: 'Twitter / X', status: 'active', budget: 1500, spend: 450, leadsGenerated: 88 },
    { id: 'm3', name: 'High-Intent Google Search Vector', platform: 'Google Ads', status: 'active', budget: 6000, spend: 2800, leadsGenerated: 31 }
  ];

  public analytics: AnalyticsData = {
    pageViews: 48920,
    conversionRate: 4.6,
    bounceRate: 36.2,
    topChannels: [
      { channel: 'High-Intent Organic Search', visitors: 24500 },
      { channel: 'Direct / Referral Loops', visitors: 13200 },
      { channel: 'Social / Viral Playbooks', visitors: 11220 }
    ]
  };

  public projects: Project[] = [
    { id: 'pr1', clientId: 'c1', name: 'Core Infrastructure Cloud Upgrade', description: 'Migrate legacy microservices to containerized architecture.', status: 'active', progress: 68 },
    { id: 'pr2', clientId: 'c2', name: 'Onboarding Funnel Integration', description: 'Setup data pipelines and telemetry tracking for new user cohorts.', status: 'active', progress: 42 },
    { id: 'pr3', clientId: 'c3', name: 'Automated Dispatch Pipeline', description: 'Real-time routing synchronization with 99.9% uptime SLA.', status: 'planning', progress: 15 }
  ];

  private listeners: Set<BOSListener> = new Set();

  constructor() {
    // Bind updates from domain services to notify BOS subscribers
    taskService.subscribe(() => this.notify());
    opportunityService.subscribe(() => this.notify());
    leadService.subscribe(() => this.notify());
    financeService.subscribe(() => this.notify());
    
    // Bind intelligence and execution services
    signalService.subscribe(() => this.notify());
    agentWorkQueueService.subscribe(() => this.notify());
    approvalService.subscribe(() => this.notify());
    nextBestActionService.subscribe(() => this.notify());
  }

  public getSnapshot(): BOSStateSnapshot {
    return {
      opportunities: this.opportunities,
      funnels: this.funnels,
      nextBestAction: nextBestActionService.getNextBestAction() || this.nextBestAction,
      leads: this.leads,
      proposals: this.proposals,
      clients: this.clients,
      audits: this.audits,
      moneySummary: this.moneySummary,
      tasks: this.tasks,
      campaigns: [...this.campaigns],
      analytics: { ...this.analytics },
      projects: [...this.projects],
      signals: signalService.getAllSignals(),
      agentWorkQueues: agentWorkQueueService.getAllItems(),
      pendingApprovals: approvalService.getPendingApprovals(),
    };
  }

  // 1. High-Intent Commercial Opportunities (delegated to OpportunityService)
  public get opportunities(): Opportunity[] {
    return opportunityService.getAll();
  }

  // 2. Conversion Funnels (delegated to OpportunityService)
  public get funnels(): FunnelRecord[] {
    return opportunityService.getFunnels();
  }

  // 3. Next Best Action (delegated to OpportunityService)
  public get nextBestAction(): NextBestAction {
    return opportunityService.getNextBestAction();
  }

  // 4. Inbound & Outbound Leads (delegated to LeadService)
  public get leads(): Lead[] {
    return leadService.getLeads();
  }

  // 5. Commercial Proposals (delegated to LeadService)
  public get proposals(): Proposal[] {
    return leadService.getProposals();
  }

  // 6. Clients (delegated to LeadService)
  public get clients(): ClientRecord[] {
    return leadService.getClients();
  }

  // 7. Strategy Audits (delegated to LeadService)
  public get audits(): AuditRecord[] {
    return leadService.getAudits();
  }

  // 8. Financial Summary (delegated to FinanceService)
  public get moneySummary() {
    return financeService.getSummary();
  }

  // 9. Backlog Tasks (delegated to TaskService)
  public get tasks(): TaskItem[] {
    return taskService.getAll();
  }

  public subscribe(listener: BOSListener): () => void {
    this.listeners.add(listener);
    try {
      listener(this.getSnapshot());
    } catch (err) {
      console.error('[bosManager] Initial listener call error:', err);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify() {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((l) => {
      try {
        l(snapshot);
      } catch (err) {
        console.error('[bosManager] Subscriber error:', err);
      }
    });
  }

  // Action methods delegating to Domain Services
  public updateOpportunityStatus(id: string, status: Opportunity['status']) {
    return opportunityService.updateOpportunityStatus(id, status);
  }

  public setNextBestAction(action: NextBestAction) {
    return opportunityService.setNextBestAction(action);
  }

  public addLead(lead: Omit<Lead, 'id'>) {
    return leadService.addLead(lead);
  }

  public updateLeadStatus(id: string, status: Lead['status']) {
    return leadService.updateLeadStatus(id, status);
  }

  public addProposal(proposal: Omit<Proposal, 'id' | 'createdAt'>) {
    return leadService.addProposal(proposal);
  }
}

export const bosManager = new BusinessOperatingSystem();
export { taskService, opportunityService, leadService, financeService };
