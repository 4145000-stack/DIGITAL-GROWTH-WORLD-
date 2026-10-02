/**
 * DIGITAL GROWTH WORLD™ — Opportunity Intelligence Engine
 * Transparent, multi-factor scoring model with inspectable weighting.
 */

import { Opportunity, OpportunityScoreDetail, ScoringFactors } from '../../types';

export interface ScoringWeights {
  intentMax: number;        // 25 pts
  valueMax: number;         // 20 pts
  probabilityMax: number;   // 18 pts
  urgencyMax: number;       // 12 pts
  fitMax: number;           // 8 pts
  evidenceMax: number;      // 4 pts
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  intentMax: 25,
  valueMax: 20,
  probabilityMax: 18,
  urgencyMax: 12,
  fitMax: 8,
  evidenceMax: 4,
};

export class OpportunityIntelligence {
  private weights: ScoringWeights;

  constructor(weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Calculates an inspectable OpportunityScoreDetail with transparent factor contribution
   */
  public scoreOpportunity(opp: Partial<Opportunity>): OpportunityScoreDetail {
    // 1. Commercial Intent (0-25 pts)
    let commercialIntentScore = 10;
    switch (opp.commercialIntent) {
      case 'EXTREME':
        commercialIntentScore = this.weights.intentMax;
        break;
      case 'HIGH':
        commercialIntentScore = Math.round(this.weights.intentMax * 0.84); // 21
        break;
      case 'MEDIUM':
        commercialIntentScore = Math.round(this.weights.intentMax * 0.56); // 14
        break;
      case 'LOW':
      default:
        commercialIntentScore = Math.round(this.weights.intentMax * 0.28); // 7
        break;
    }

    // 2. Economic Value (0-20 pts)
    const val = opp.estimatedValue || 0;
    let economicValueScore = 5;
    if (val >= 100000) economicValueScore = this.weights.valueMax; // 20
    else if (val >= 60000) economicValueScore = Math.round(this.weights.valueMax * 0.85); // 17
    else if (val >= 30000) economicValueScore = Math.round(this.weights.valueMax * 0.65); // 13
    else if (val >= 15000) economicValueScore = Math.round(this.weights.valueMax * 0.45); // 9
    else economicValueScore = Math.round(this.weights.valueMax * 0.25); // 5

    // 3. Conversion Probability (0-18 pts)
    let conversionProbScore = 8;
    switch (opp.conversionProbability) {
      case 'HIGH':
        conversionProbScore = this.weights.probabilityMax; // 18
        break;
      case 'MEDIUM':
        conversionProbScore = Math.round(this.weights.probabilityMax * 0.66); // 12
        break;
      case 'LOW':
      default:
        conversionProbScore = Math.round(this.weights.probabilityMax * 0.33); // 6
        break;
    }

    // 4. Urgency (0-12 pts)
    let urgencyScore = 6;
    if (opp.status === 'actionable' || opp.funnelReady) {
      urgencyScore = this.weights.urgencyMax; // 12
    } else if (opp.status === 'analyzing') {
      urgencyScore = Math.round(this.weights.urgencyMax * 0.65); // 8
    } else {
      urgencyScore = Math.round(this.weights.urgencyMax * 0.4); // 5
    }

    // 5. Offer Fit (0-8 pts)
    const fitPct = opp.offerFit !== undefined ? opp.offerFit : 75;
    const fitScore = Math.round((fitPct / 100) * this.weights.fitMax);

    // 6. Evidence Strength (0-4 pts)
    const evidenceScore = opp.trafficPotential ? 4 : 2;

    const factors: ScoringFactors = {
      commercialIntent: commercialIntentScore,
      economicValue: economicValueScore,
      conversionProbability: conversionProbScore,
      urgency: urgencyScore,
      fit: fitScore,
      evidenceStrength: evidenceScore,
    };

    const totalScore = Math.min(
      100,
      factors.commercialIntent +
      factors.economicValue +
      factors.conversionProbability +
      factors.urgency +
      factors.fit +
      factors.evidenceStrength
    );

    const confidence = Math.round(
      (factors.evidenceStrength / this.weights.evidenceMax) * 60 +
      (factors.fit / this.weights.fitMax) * 40
    );

    const summary = `Commercial intent (+${factors.commercialIntent}), Economic value (+${factors.economicValue}), Conversion prob (+${factors.conversionProbability}), Urgency (+${factors.urgency}), Fit (+${factors.fit}), Evidence (+${factors.evidenceStrength}).`;

    return {
      score: totalScore,
      confidence,
      factors,
      calculatedAt: Date.now(),
      version: '1.2.0',
      summary,
    };
  }
}

export const opportunityIntelligence = new OpportunityIntelligence();
