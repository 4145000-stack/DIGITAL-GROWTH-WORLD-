/**
 * DIGITAL GROWTH WORLD™ — Lead Intelligence Engine
 * Deterministic lead scoring, temperature assessment, and agent routing.
 */

import { Lead, LeadIntelligenceDetail } from '../../types';

export class LeadIntelligence {
  /**
   * Qualifies and scores a CRM lead into actionable intelligence
   */
  public evaluateLead(lead: Lead): LeadIntelligenceDetail {
    let score = 50;
    const value = lead.estimatedValue || 0;

    // Value contribution (0-30 pts)
    if (value >= 80000) score += 30;
    else if (value >= 50000) score += 24;
    else if (value >= 25000) score += 18;
    else if (value >= 10000) score += 10;
    else score += 5;

    // Stage contribution (0-25 pts)
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    let temperature: 'cold' | 'warm' | 'hot' | 'urgent' = 'warm';
    let recommendedAgent = 'closer';
    let recommendedAction = 'Initial outreach and discovery booking';
    let rationale = '';

    switch (lead.status) {
      case 'qualified':
        score += 20;
        temperature = value >= 60000 ? 'urgent' : 'hot';
        priority = value >= 60000 ? 'urgent' : 'high';
        recommendedAgent = 'closer';
        recommendedAction = 'Send personalized commercial proposal & ROI model';
        rationale = `Qualified deal ($${value.toLocaleString()}) ready for formal contract closing.`;
        break;

      case 'contacted':
        score += 12;
        temperature = 'warm';
        priority = 'medium';
        recommendedAgent = 'closer';
        recommendedAction = 'Deliver diagnostic case study & overcome objections';
        rationale = `In-progress conversation with ${lead.contactName}. Follow-up required to secure commitment.`;
        break;

      case 'new':
        score += 8;
        temperature = value >= 50000 ? 'hot' : 'warm';
        priority = value >= 50000 ? 'high' : 'medium';
        recommendedAgent = value >= 50000 ? 'closer' : 'pixel';
        recommendedAction = 'Conduct research & initiate multi-channel discovery sequence';
        rationale = `Fresh inbound inquiry from ${lead.companyName} via ${lead.source}. Immediate response boosts conversion by 4x.`;
        break;

      case 'lost':
      default:
        score -= 20;
        temperature = 'cold';
        priority = 'low';
        recommendedAgent = 'pixel';
        recommendedAction = 'Enroll in automated nurture newsletter';
        rationale = `Deal lost or stalled. Retain in long-term automated retargeting.`;
        break;
    }

    // Source multiplier
    if (lead.source.toLowerCase().includes('inbound') || lead.source.toLowerCase().includes('search')) {
      score += 8;
    } else if (lead.source.toLowerCase().includes('referral')) {
      score += 12;
    }

    const finalScore = Math.min(100, Math.max(10, score));

    return {
      leadId: lead.id,
      score: finalScore,
      temperature,
      priority,
      recommendedAction,
      recommendedAgent,
      rationale,
    };
  }
}

export const leadIntelligence = new LeadIntelligence();
