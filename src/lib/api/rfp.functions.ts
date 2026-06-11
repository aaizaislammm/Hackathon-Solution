/**
 * rfp.functions.ts — TanStack Server Functions for the RFP pipeline
 *
 * These functions run server-side (via Nitro) and are callable
 * from React components using `await analyzeRfp({ data: ... })`.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { runFullPipeline } from "../ai-pipeline.server";
import { calculateWinProbability, calculateComplianceScore } from "../scoring.server";
import {
  getCapabilityLibrary,
  getBidHistory,
  evaluationCriteria,
} from "../datasets.server";

// ─── Types shared between server and client ──────────────────────────

export interface AnalysisResponse {
  success: boolean;
  rfpMeta: {
    title: string;
    client: string;
    sector: string;
    deadline: string;
    budget: string;
    pages: number;
    summary: string;
  };
  requirements: Array<{
    id: string;
    category: string;
    text: string;
    priority: string;
    section: string;
    confidence: number;
  }>;
  compliance: Array<{
    requirementId: string;
    status: string;
    evidence: string;
    similarity: number;
    matchedCapabilities: Array<{
      capId: string;
      domain: string;
      projectSummary: string;
      certification: string;
      yearCompleted: number;
      contractValue: string;
      clientType: string;
      similarity: number;
      rank: number;
    }>;
  }>;
  complianceScore: {
    total: number;
    matched: number;
    partial: number;
    gaps: number;
    info: number;
    score: number;
  };
  winProbability: {
    score: number;
    decision: string;
    decisionLabel: string;
    decisionColor: string;
    factors: Array<{
      label: string;
      value: number;
      weight: number;
      color: string;
      description: string;
    }>;
    riskLevel: string;
    strengths: string[];
    risks: string[];
    missingDocuments: string[];
    recommendations: string[];
  };
  proposalSections: Array<{
    id: string;
    title: string;
    content: string;
    words: number;
    linkedRequirements: string[];
  }>;
  processingLog: string[];
  errors: string[];
}

// ─── Main Analysis Pipeline ──────────────────────────────────────────

/**
 * Analyze an uploaded RFP document.
 * Accepts base64-encoded PDF data, runs the full AI pipeline,
 * and returns structured analysis results.
 */
export const analyzeRfp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      fileBase64: z.string().min(1, "File data is required"),
      fileName: z.string().default("document.pdf"),
    }),
  )
  .handler(async ({ data }): Promise<AnalysisResponse> => {
    const errors: string[] = [];

    try {
      console.log(`[rfp-api] Starting analysis of ${data.fileName}`);

      // Decode base64 to buffer
      const fileBuffer = Buffer.from(data.fileBase64, "base64");

      if (fileBuffer.length === 0) {
        return {
          success: false,
          rfpMeta: { title: "", client: "", sector: "", deadline: "", budget: "", pages: 0, summary: "" },
          requirements: [],
          compliance: [],
          complianceScore: { total: 0, matched: 0, partial: 0, gaps: 0, info: 0, score: 0 },
          winProbability: {
            score: 0,
            decision: "NO_GO",
            decisionLabel: "NO-GO",
            decisionColor: "neon-red",
            factors: [],
            riskLevel: "Critical",
            strengths: [],
            risks: ["Empty file uploaded"],
            missingDocuments: [],
            recommendations: ["Upload a valid PDF document"],
          },
          proposalSections: [],
          processingLog: ["ERROR: Empty file received"],
          errors: ["Empty file received"],
        };
      }

      // Run full pipeline
      const result = await runFullPipeline(fileBuffer);

      // Calculate scores
      const complianceScore = calculateComplianceScore(result.compliance);
      const winProbability = calculateWinProbability(result.compliance, result.rfpMeta);

      console.log(`[rfp-api] Analysis complete. Win probability: ${winProbability.score}%, Decision: ${winProbability.decisionLabel}`);

      return {
        success: true,
        rfpMeta: result.rfpMeta,
        requirements: result.requirements.map((r) => ({
          id: r.id,
          category: r.category,
          text: r.text,
          priority: r.priority,
          section: r.section,
          confidence: r.confidence,
        })),
        compliance: result.compliance.map((c) => ({
          requirementId: c.requirementId,
          status: c.status,
          evidence: c.evidence,
          similarity: c.similarity,
          matchedCapabilities: c.matchedCapabilities.map((m) => ({
            capId: m.capId,
            domain: m.capability.domain,
            projectSummary: m.capability.projectSummary,
            certification: m.capability.certification,
            yearCompleted: m.capability.yearCompleted,
            contractValue: m.capability.contractValue,
            clientType: m.capability.clientType,
            similarity: m.similarity,
            rank: m.rank,
          })),
        })),
        complianceScore,
        winProbability,
        proposalSections: result.proposalSections,
        processingLog: result.processingLog,
        errors,
      };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[rfp-api] Pipeline error:", errMsg);
      errors.push(errMsg);

      return {
        success: false,
        rfpMeta: { title: "Error", client: "", sector: "", deadline: "", budget: "", pages: 0, summary: "" },
        requirements: [],
        compliance: [],
        complianceScore: { total: 0, matched: 0, partial: 0, gaps: 0, info: 0, score: 0 },
        winProbability: {
          score: 0,
          decision: "NO_GO",
          decisionLabel: "Error",
          decisionColor: "neon-red",
          factors: [],
          riskLevel: "Critical",
          strengths: [],
          risks: [errMsg],
          missingDocuments: [],
          recommendations: ["Check server logs and API key configuration"],
        },
        proposalSections: [],
        processingLog: [`ERROR: ${errMsg}`],
        errors,
      };
    }
  });

// ─── Capability Library Endpoint ─────────────────────────────────────

export const fetchCapabilityLibrary = createServerFn({ method: "GET" })
  .handler(async () => {
    const capabilities = getCapabilityLibrary();
    return {
      capabilities: capabilities.map((c) => ({
        capId: c.capId,
        domain: c.domain,
        projectSummary: c.projectSummary,
        certification: c.certification,
        yearCompleted: c.yearCompleted,
        contractValue: c.contractValue,
        durationMonths: c.durationMonths,
        clientType: c.clientType,
      })),
      total: capabilities.length,
    };
  });

// ─── Bid History Endpoint ────────────────────────────────────────────

export const fetchBidHistory = createServerFn({ method: "GET" })
  .handler(async () => {
    const history = getBidHistory();
    const wins = history.filter((b) => b.outcome === "Win").length;
    return {
      records: history,
      total: history.length,
      wins,
      losses: history.length - wins,
      winRate: history.length > 0 ? Math.round((wins / history.length) * 100) : 0,
    };
  });

// ─── Evaluation Criteria Endpoint ────────────────────────────────────

export const fetchEvaluationCriteria = createServerFn({ method: "GET" })
  .handler(async () => {
    return { criteria: evaluationCriteria };
  });
