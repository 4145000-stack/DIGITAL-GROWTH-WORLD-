/**
 * DIGITAL GROWTH WORLD™ — Finance Domain Service
 * Manages core financial vitals, MRR, ARR, cash runway, and pipeline valuation.
 */

import { eventBus } from '../eventBus';

const STORAGE_KEY = 'dgw_domain_finance';

export interface CompanyFinanceSummary {
  mrr: number;
  arr: number;
  pipelineValue: number;
  grossMargin: number;
  cashRunwayMonths: number;
  activeSubscribers: number;
  avgRevenuePerUser: number;
}

const DEFAULT_FINANCE: CompanyFinanceSummary = {
  mrr: 50500,
  arr: 606000,
  pipelineValue: 247000,
  grossMargin: 84.5,
  cashRunwayMonths: 26,
  activeSubscribers: 42,
  avgRevenuePerUser: 1202,
};

export type FinanceListener = (summary: CompanyFinanceSummary) => void;

class FinanceDomainService {
  private summary: CompanyFinanceSummary = { ...DEFAULT_FINANCE };
  private listeners: Set<FinanceListener> = new Set();

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.summary = { ...DEFAULT_FINANCE, ...JSON.parse(saved) };
      }
    } catch {
      this.summary = { ...DEFAULT_FINANCE };
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.summary));
    } catch {
      // quota
    }
  }

  private notify() {
    this.persist();
    const snapshot = { ...this.summary };
    this.listeners.forEach((l) => {
      try {
        l(snapshot);
      } catch (err) {
        console.error('[FinanceService] Error notifying listener:', err);
      }
    });
    eventBus.emit('FINANCE_METRICS_UPDATED', {
      mrr: snapshot.mrr,
      arr: snapshot.arr,
      pipelineValue: snapshot.pipelineValue,
    });
  }

  public subscribe(listener: FinanceListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.summary });
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSummary(): CompanyFinanceSummary {
    return { ...this.summary };
  }

  public updateMetrics(partial: Partial<CompanyFinanceSummary>) {
    this.summary = {
      ...this.summary,
      ...partial,
      arr: partial.mrr ? partial.mrr * 12 : partial.arr || this.summary.arr,
    };
    this.notify();
  }

  public recordRetainerClosed(monthlyAmount: number) {
    this.updateMetrics({
      mrr: this.summary.mrr + monthlyAmount,
      activeSubscribers: this.summary.activeSubscribers + 1,
    });
  }
}

export const financeService = new FinanceDomainService();
