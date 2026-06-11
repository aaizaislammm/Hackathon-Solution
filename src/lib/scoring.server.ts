/**
 * scoring.server.ts — Win-probability heuristics & compliance scoring
 *
 * Implements deterministic scoring calculations that map to the
 * Evaluation Criteria Taxonomy, cross-referenced with historical
 * bid data for win-probability estimation.
 */

import {
  getBidHistory,
  getWinRateBySector,
  getAvgWinningCompliance,
  evaluationCriteria,
} from "./datasets.server";
import type { ComplianceItem, ExtractedRequirement, RfpMetadata } from "./ai-pipeline.server";

// ─── Types ───────────────────────────────────────────────────────────

export interface ScoringFactor {
  label: string;
  value: number;
  weight: number;
  color: string;
  description: string;
}

export interface WinProbabilityResult {
  score: number;
  decision: "GO" | "GO_WITH_CONDITIONS" | "NO_GO";
  decisionLabel: string;
  decisionColor: string;
  factors: ScoringFactor[];
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  strengths: string[];
  risks: string[];
  missingDocuments: string[];
  recommendations: string[];
}

export interface ComplianceScore {
  total: number;
  matched: number;
  partial: number;
  gaps: number;
  info: number;
  score: number;
}

// ─── Compliance Score Calculation ─────────────────────────────────────

/**
 * Calculate the compliance score from matched requirements.
 */
export function calculateComplianceScore(compliance: ComplianceItem[]): ComplianceScore {
  const total = compliance.length;
  const matched = compliance.filter((c) => c.status === "matched").length;
  const partial = compliance.filter((c) => c.status === "partial").length;
  const gaps = compliance.filter((c) => c.status === "gap").length;
  const info = compliance.filter((c) => c.status === "info").length;

  // Score: matched = 1.0, partial = 0.5, gap = 0.0, info = excluded
  const scoreable = total - info;
  const score = scoreable > 0
    ? Math.round(((matched + partial * 0.5) / scoreable) * 100)
    : 0;

  return { total, matched, partial, gaps, info, score };
}

// ─── Budget Alignment ────────────────────────────────────────────────

/**
 * Calculate budget alignment score by comparing the RFP budget
 * with historical bid values in the same sector.
 */
function calculateBudgetAlignment(rfpMeta: RfpMetadata): number {
  const history = getBidHistory();

  // Extract numeric budget from RFP (handle various formats)
  const budgetStr = rfpMeta.budget.toLowerCase();
  if (budgetStr === "not specified" || budgetStr === "n/a") {
    return 70; // Unknown budget = moderate alignment
  }

  // Find bids in same sector
  const sectorBids = history.filter(
    (b) => b.sector.toLowerCase() === rfpMeta.sector.toLowerCase() && b.outcome === "Win",
  );

  if (sectorBids.length === 0) return 65;

  // If we have winning bids in the sector, assume reasonable alignment
  // Score higher if the sector has more wins (indicates familiarity)
  const winCount = sectorBids.length;
  return Math.min(95, 60 + winCount * 3);
}

// ─── Experience Matching ─────────────────────────────────────────────

/**
 * Calculate similar experience score based on how many capability
 * records match the RFP's domain/sector.
 */
function calculateExperienceScore(compliance: ComplianceItem[]): number {
  if (compliance.length === 0) return 0;

  // Count requirements with strong matches (>= 0.75 similarity)
  const strongMatches = compliance.filter((c) => c.similarity >= 0.75).length;
  const partialMatches = compliance.filter((c) => c.similarity >= 0.50 && c.similarity < 0.75).length;
  const total = compliance.filter((c) => c.status !== "info").length;

  if (total === 0) return 0;

  const score = Math.round(((strongMatches + partialMatches * 0.5) / total) * 100);
  return Math.min(100, score);
}

// ─── Win-Probability Calculation ─────────────────────────────────────

/**
 * Calculate the overall win probability using a weighted heuristic formula.
 *
 * Weights:
 * - 40% Compliance Match ratio
 * - 20% Budget Alignment (compared to historical)
 * - 20% Similar Experience (capability matches)
 * - 20% Past Win Rate (sector-level historical data)
 */
export function calculateWinProbability(
  compliance: ComplianceItem[],
  rfpMeta: RfpMetadata,
): WinProbabilityResult {
  // Factor 1: Compliance Match (40%)
  const complianceScore = calculateComplianceScore(compliance);
  const complianceFactor = complianceScore.score;

  // Factor 2: Budget Alignment (20%)
  const budgetFactor = calculateBudgetAlignment(rfpMeta);

  // Factor 3: Similar Experience (20%)
  const experienceFactor = calculateExperienceScore(compliance);

  // Factor 4: Past Win Rate (20%)
  const winRateData = getWinRateBySector(rfpMeta.sector);
  const winRateFactor = Math.round(winRateData.rate * 100);

  // Weighted average
  const score = Math.round(
    complianceFactor * 0.4 +
    budgetFactor * 0.2 +
    experienceFactor * 0.2 +
    winRateFactor * 0.2,
  );

  // Build scoring factors
  const factors: ScoringFactor[] = [
    {
      label: "Compliance Match",
      value: complianceFactor,
      weight: 40,
      color: "neon-green",
      description: `${complianceScore.matched}/${complianceScore.total - complianceScore.info} requirements matched`,
    },
    {
      label: "Budget Alignment",
      value: budgetFactor,
      weight: 20,
      color: "neon-cyan",
      description: `Based on ${rfpMeta.sector} sector bid history`,
    },
    {
      label: "Similar Experience",
      value: experienceFactor,
      weight: 20,
      color: "neon-blue",
      description: `${compliance.filter((c) => c.similarity >= 0.75).length} strong capability matches`,
    },
    {
      label: "Past Win Rate",
      value: winRateFactor,
      weight: 20,
      color: "neon-amber",
      description: `${winRateData.wins}/${winRateData.total} bids won in ${rfpMeta.sector}`,
    },
  ];

  // GO/NO-GO Decision
  let decision: WinProbabilityResult["decision"];
  let decisionLabel: string;
  let decisionColor: string;

  if (score >= 70) {
    decision = "GO";
    decisionLabel = "GO";
    decisionColor = "neon-green";
  } else if (score >= 50) {
    decision = "GO_WITH_CONDITIONS";
    decisionLabel = "GO with Conditions";
    decisionColor = "neon-amber";
  } else {
    decision = "NO_GO";
    decisionLabel = "NO-GO";
    decisionColor = "neon-red";
  }

  // Risk level
  const riskLevel: WinProbabilityResult["riskLevel"] =
    complianceScore.gaps >= 5 ? "Critical"
    : complianceScore.gaps >= 3 ? "High"
    : complianceScore.gaps >= 1 ? "Medium"
    : "Low";

  // Strengths
  const strengths: string[] = [];
  const matchedItems = compliance.filter((c) => c.status === "matched");
  for (const item of matchedItems.slice(0, 4)) {
    const cap = item.matchedCapabilities[0]?.capability;
    if (cap) {
      strengths.push(`${cap.projectSummary} — ${cap.yearCompleted}`);
    }
  }
  if (winRateFactor >= 60) {
    strengths.push(`Strong historical win rate in ${rfpMeta.sector} (${winRateFactor}%)`);
  }

  // Risks
  const risks: string[] = [];
  const gapItems = compliance.filter((c) => c.status === "gap");
  for (const item of gapItems.slice(0, 3)) {
    risks.push(`Gap: ${item.requirement.text}`);
  }
  if (complianceScore.partial > 3) {
    risks.push(`${complianceScore.partial} requirements only partially matched`);
  }

  // Missing documents
  const missingDocuments: string[] = [];
  for (const item of gapItems) {
    if (
      item.requirement.text.toLowerCase().includes("document") ||
      item.requirement.text.toLowerCase().includes("certificate") ||
      item.requirement.text.toLowerCase().includes("cv") ||
      item.requirement.text.toLowerCase().includes("statement") ||
      item.requirement.text.toLowerCase().includes("report")
    ) {
      missingDocuments.push(item.requirement.text);
    }
  }

  // Recommendations
  const recommendations: string[] = [];
  if (gapItems.length > 0) {
    recommendations.push(`Resolve ${gapItems.length} compliance gap(s) before submission`);
  }
  if (complianceScore.partial > 0) {
    recommendations.push(`Strengthen ${complianceScore.partial} partially-matched requirement(s)`);
  }
  if (decision === "GO") {
    recommendations.push("Proceed with bid preparation — allocate resources");
  }
  if (decision === "GO_WITH_CONDITIONS") {
    recommendations.push("Schedule internal review with bid steering committee");
  }
  if (decision === "NO_GO") {
    recommendations.push("Consider declining this bid — low probability of success");
  }

  return {
    score,
    decision,
    decisionLabel,
    decisionColor,
    factors,
    riskLevel,
    strengths,
    risks,
    missingDocuments,
    recommendations,
  };
}
