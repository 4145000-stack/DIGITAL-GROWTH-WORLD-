/**
 * DIGITAL GROWTH WORLD™ — Lead & CRM Domain Service
 * Manages sales pipeline, lead stage progressions, commercial proposals, and client relationships.
 */

import { Lead, Proposal, ClientRecord, AuditRecord } from '../../types';
import { eventBus } from '../eventBus';

const LEADS_KEY = 'dgw_domain_leads';
const PROPOSALS_KEY = 'dgw_domain_proposals';
const CLIENTS_KEY = 'dgw_domain_clients';
const AUDITS_KEY = 'dgw_domain_audits';

const DEFAULT_LEADS: Lead[] = [
  { id: 'l1', companyName: 'Global Retail Holdings', contactName: 'Sarah Jenkins', source: 'Inbound Search', status: 'qualified', estimatedValue: 60000 },
  { id: 'l2', companyName: 'StartUp Scaling Inc', contactName: 'Mike Ross', source: 'Referral Partner', status: 'contacted', estimatedValue: 18000 },
  { id: 'l3', companyName: 'Apex Health Systems', contactName: 'Dr. Elena Vance', source: 'Webinar Funnel', status: 'qualified', estimatedValue: 95000 },
  { id: 'l4', companyName: 'Starlight Fintech', contactName: 'David Chen', source: 'Organic LinkedIn', status: 'new', estimatedValue: 32000 }
];

const DEFAULT_PROPOSALS: Proposal[] = [
  { id: 'p1', leadId: 'l1', title: 'Enterprise Migration & Growth OS Retainer', value: 45000, status: 'sent', createdAt: Date.now() - 172800000 },
  { id: 'p2', leadId: 'l2', title: 'Q4 Performance Marketing & Viral Campaign Plan', value: 24000, status: 'accepted', createdAt: Date.now() - 345600000 },
  { id: 'p3', leadId: 'l3', title: 'Workflow Orchestration & Operations Overhaul', value: 38000, status: 'draft', createdAt: Date.now() - 86400000 }
];

const DEFAULT_CLIENTS: ClientRecord[] = [
  { id: 'c1', name: 'Acme Corp', industry: 'Manufacturing & Supply Chain', status: 'active', mrr: 14500, contactEmail: 'alex.director@acme.com' },
  { id: 'c2', name: 'TechFlow Cloud', industry: 'Enterprise SaaS', status: 'onboarding', mrr: 9200, contactEmail: 'leadership@techflow.io' },
  { id: 'c3', name: 'Nexus Logistics', industry: 'Global Transport', status: 'active', mrr: 18000, contactEmail: 'partners@nexuslog.com' },
  { id: 'c4', name: 'Vanguard Media', industry: 'Digital Publishing', status: 'active', mrr: 8800, contactEmail: 'sarah@vanguard.media' }
];

const DEFAULT_AUDITS: AuditRecord[] = [
  { id: 'a1', clientId: 'c1', title: 'Q3 Enterprise Architecture & Security Audit', date: Date.now() - 86400000, score: 92, findings: ['Rotate Cloud API Keys', 'Optimize DB Read Pool', 'Enable MFA on Gateway'] },
  { id: 'a2', clientId: 'c2', title: 'Product-Led Growth & Conversion Diagnostic', date: Date.now() - 259200000, score: 78, findings: ['Friction on Sign-up Step 2', 'Pricing Anchor Misaligned', 'Self-Serve Tour Missing'] },
  { id: 'a3', clientId: 'c3', title: 'Workflow Automation & Delivery Audit', date: Date.now() - 432000000, score: 85, findings: ['Automate Inbound Webhooks', 'Sync Jira Epics with Orbit', 'SLA Alert Webhook'] }
];

export type LeadDomainState = {
  leads: Lead[];
  proposals: Proposal[];
  clients: ClientRecord[];
  audits: AuditRecord[];
};

export type LeadDomainListener = (state: LeadDomainState) => void;

class LeadDomainService {
  private leads: Lead[] = [];
  private proposals: Proposal[] = [];
  private clients: ClientRecord[] = [];
  private audits: AuditRecord[] = [];
  private listeners: Set<LeadDomainListener> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const savedLeads = localStorage.getItem(LEADS_KEY);
      this.leads = savedLeads ? JSON.parse(savedLeads) : [...DEFAULT_LEADS];

      const savedProposals = localStorage.getItem(PROPOSALS_KEY);
      this.proposals = savedProposals ? JSON.parse(savedProposals) : [...DEFAULT_PROPOSALS];

      const savedClients = localStorage.getItem(CLIENTS_KEY);
      this.clients = savedClients ? JSON.parse(savedClients) : [...DEFAULT_CLIENTS];

      const savedAudits = localStorage.getItem(AUDITS_KEY);
      this.audits = savedAudits ? JSON.parse(savedAudits) : [...DEFAULT_AUDITS];
    } catch {
      this.leads = [...DEFAULT_LEADS];
      this.proposals = [...DEFAULT_PROPOSALS];
      this.clients = [...DEFAULT_CLIENTS];
      this.audits = [...DEFAULT_AUDITS];
    }
  }

  private persist() {
    try {
      localStorage.setItem(LEADS_KEY, JSON.stringify(this.leads));
      localStorage.setItem(PROPOSALS_KEY, JSON.stringify(this.proposals));
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(this.clients));
      localStorage.setItem(AUDITS_KEY, JSON.stringify(this.audits));
    } catch {
      // quota
    }
  }

  private notify() {
    this.persist();
    const snapshot: LeadDomainState = {
      leads: [...this.leads],
      proposals: [...this.proposals],
      clients: [...this.clients],
      audits: [...this.audits],
    };
    this.listeners.forEach((l) => {
      try {
        l(snapshot);
      } catch (err) {
        console.error('[LeadService] Error in listener callback:', err);
      }
    });
  }

  public subscribe(listener: LeadDomainListener): () => void {
    this.listeners.add(listener);
    listener({
      leads: [...this.leads],
      proposals: [...this.proposals],
      clients: [...this.clients],
      audits: [...this.audits],
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getLeads(): Lead[] {
    return [...this.leads];
  }

  public getProposals(): Proposal[] {
    return [...this.proposals];
  }

  public getClients(): ClientRecord[] {
    return [...this.clients];
  }

  public getAudits(): AuditRecord[] {
    return [...this.audits];
  }

  /**
   * Add a new prospective lead
   */
  public addLead(lead: Omit<Lead, 'id'>): Lead {
    const newLead: Lead = {
      ...lead,
      id: `l-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    this.leads.unshift(newLead);
    this.notify();

    eventBus.emit('LEAD_CREATED', {
      leadId: newLead.id,
      companyName: newLead.companyName,
      estimatedValue: newLead.estimatedValue,
    });

    return newLead;
  }

  /**
   * Transition lead stage
   */
  public updateLeadStatus(id: string, status: Lead['status']): Lead | undefined {
    let updated: Lead | undefined;
    this.leads = this.leads.map((l) => {
      if (l.id === id) {
        updated = { ...l, status };
        return updated;
      }
      return l;
    });

    if (updated) {
      this.notify();
      eventBus.emit('LEAD_STATUS_CHANGED', {
        leadId: updated.id,
        status: updated.status,
        companyName: updated.companyName,
      });
    }

    return updated;
  }

  /**
   * Add a proposal for a lead
   */
  public addProposal(proposal: Omit<Proposal, 'id' | 'createdAt'>): Proposal {
    const newProp: Proposal = {
      ...proposal,
      id: `p-${Date.now()}`,
      createdAt: Date.now(),
    };
    this.proposals.unshift(newProp);
    this.notify();

    eventBus.emit('PROPOSAL_CREATED', {
      proposalId: newProp.id,
      title: newProp.title,
      value: newProp.value,
    });

    return newProp;
  }

  /**
   * Update proposal status (draft, sent, accepted, rejected)
   */
  public updateProposalStatus(id: string, status: Proposal['status']): Proposal | undefined {
    let updated: Proposal | undefined;
    this.proposals = this.proposals.map((p) => {
      if (p.id === id) {
        updated = { ...p, status };
        return updated;
      }
      return p;
    });

    if (updated) {
      this.notify();
    }
    return updated;
  }

  /**
   * Total active CRM pipeline value
   */
  public getTotalPipelineValue(): number {
    return this.leads
      .filter((l) => l.status !== 'lost')
      .reduce((acc, l) => acc + (l.estimatedValue || 0), 0);
  }
}

export const leadService = new LeadDomainService();
