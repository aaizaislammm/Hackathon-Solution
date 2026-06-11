/**
 * datasets.server.ts — Server-only data layer
 *
 * Reads the Excel workbook once at startup and exposes typed arrays
 * for Bid History (120 rows) and Capability Library (50 rows).
 * Also contains the Evaluation Criteria Taxonomy (15 entries).
 *
 * The .server.ts suffix ensures Vite tree-shakes this from the client bundle.
 */

import * as XLSX from "xlsx";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import process from "node:process";

// ─── Types ───────────────────────────────────────────────────────────

export interface BidHistoryRecord {
  bidId: string;
  client: string;
  sector: string;
  budget: string;
  score: number;
  outcome: "Win" | "Loss";
  responseTimeHrs: number;
  compliancePct: number;
  docPages: number;
  gapsFound: number;
  bidManager: string;
  submissionDate: string;
}

export interface CapabilityRecord {
  capId: string;
  domain: string;
  projectSummary: string;
  certification: string;
  yearCompleted: number;
  contractValue: string;
  durationMonths: number;
  clientType: string;
}

export interface EvalCriterion {
  id: string;
  criterion: string;
  weight: number;
  sector: string;
  description: string;
}

// ─── Lazy-loaded data cache ──────────────────────────────────────────

let _bidHistory: BidHistoryRecord[] | null = null;
let _capabilityLibrary: CapabilityRecord[] | null = null;

function getWorkbookPath(): string {
  // Try multiple possible locations
  const candidates = [
    resolve(process.cwd(), "Problem#1_Sample_Datasets (TEKROWE).xlsx"),
    resolve(process.cwd(), "datasets", "Problem#1_Sample_Datasets (TEKROWE).xlsx"),
  ];
  for (const p of candidates) {
    try {
      readFileSync(p);
      return p;
    } catch {
      // try next
    }
  }
  console.warn("[datasets] Excel file not found at any candidate path:", candidates);
  return candidates[0]; // will throw on read
}

function loadWorkbook() {
  try {
    const filePath = getWorkbookPath();
    const buffer = readFileSync(filePath);
    return XLSX.read(buffer, { type: "buffer" });
  } catch (err) {
    console.error("[datasets] Failed to load Excel workbook:", err);
    return null;
  }
}

// ─── Bid History ─────────────────────────────────────────────────────

export function getBidHistory(): BidHistoryRecord[] {
  if (_bidHistory) return _bidHistory;

  const wb = loadWorkbook();
  if (!wb) {
    console.warn("[datasets] Using empty bid history (workbook not loaded)");
    _bidHistory = [];
    return _bidHistory;
  }

  // Find the bid history sheet (first sheet, or by name pattern)
  const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes("bid history")) ?? wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    console.warn("[datasets] Bid history sheet not found");
    _bidHistory = [];
    return _bidHistory;
  }

  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { range: 2 }); // skip title + description rows

  _bidHistory = rows.map((row) => ({
    bidId: String(row["Bid ID"] ?? ""),
    client: String(row["Client"] ?? ""),
    sector: String(row["Sector"] ?? ""),
    budget: String(row["Budget"] ?? ""),
    score: Number(row["Score (%)"] ?? 0),
    outcome: String(row["Outcome"] ?? "Loss") as "Win" | "Loss",
    responseTimeHrs: Number(row["Response Time (hrs)"] ?? 0),
    compliancePct: Number(row["Compliance %"] ?? 0),
    docPages: Number(row["Doc Pages"] ?? 0),
    gapsFound: Number(row["Gaps Found"] ?? 0),
    bidManager: String(row["Bid Manager"] ?? ""),
    submissionDate: String(row["Submission Date"] ?? ""),
  })).filter((r) => r.bidId.startsWith("BID-"));

  console.log(`[datasets] Loaded ${_bidHistory.length} bid history records`);
  return _bidHistory;
}

// ─── Capability Library ──────────────────────────────────────────────

export function getCapabilityLibrary(): CapabilityRecord[] {
  if (_capabilityLibrary) return _capabilityLibrary;

  const wb = loadWorkbook();
  if (!wb) {
    console.warn("[datasets] Using empty capability library (workbook not loaded)");
    _capabilityLibrary = [];
    return _capabilityLibrary;
  }

  const sheetName = wb.SheetNames.find((n) => n.toLowerCase().includes("capability")) ?? wb.SheetNames[1];
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    console.warn("[datasets] Capability library sheet not found");
    _capabilityLibrary = [];
    return _capabilityLibrary;
  }

  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { range: 2 });

  _capabilityLibrary = rows.map((row) => ({
    capId: String(row["Cap ID"] ?? ""),
    domain: String(row["Domain"] ?? ""),
    projectSummary: String(row["Project Summary"] ?? ""),
    certification: String(row["Certification"] ?? "N/A"),
    yearCompleted: Number(row["Year Completed"] ?? 0),
    contractValue: String(row["Contract Value"] ?? ""),
    durationMonths: Number(row["Duration (months)"] ?? 0),
    clientType: String(row["Client Type"] ?? ""),
  })).filter((r) => r.capId.startsWith("CAP-"));

  console.log(`[datasets] Loaded ${_capabilityLibrary.length} capability records`);
  return _capabilityLibrary;
}

// ─── Evaluation Criteria Taxonomy ────────────────────────────────────
// Built from the problem statement + rubrics — 15 common RFP evaluation
// criteria grouped by sector relevance.

export const evaluationCriteria: EvalCriterion[] = [
  { id: "EC-01", criterion: "Technical Approach & Methodology", weight: 25, sector: "All", description: "Quality and appropriateness of the proposed technical solution, including architecture, tools, and standards." },
  { id: "EC-02", criterion: "Relevant Experience & Past Performance", weight: 20, sector: "All", description: "Track record of similar projects completed successfully, with references and contract values." },
  { id: "EC-03", criterion: "Team Qualifications & Key Personnel", weight: 15, sector: "All", description: "Qualifications, certifications, and experience of proposed team members (PMP, ITIL, etc.)." },
  { id: "EC-04", criterion: "Financial Proposal & Budget Alignment", weight: 15, sector: "All", description: "Competitiveness, transparency, and reasonableness of pricing relative to scope." },
  { id: "EC-05", criterion: "Compliance with Mandatory Requirements", weight: 10, sector: "All", description: "Adherence to all mandatory/pass-fail requirements specified in the RFP." },
  { id: "EC-06", criterion: "Project Management Plan", weight: 5, sector: "All", description: "Quality of implementation timeline, milestones, risk management, and governance." },
  { id: "EC-07", criterion: "Quality Assurance & Testing", weight: 5, sector: "IT Services", description: "Testing methodology, QA processes, and defect management approach." },
  { id: "EC-08", criterion: "Security & Data Protection", weight: 5, sector: "IT Services", description: "Information security controls, data residency, encryption, and compliance certifications." },
  { id: "EC-09", criterion: "SLA & Support Model", weight: 5, sector: "IT Services", description: "Service level agreements, uptime guarantees, response times, and support structure." },
  { id: "EC-10", criterion: "Innovation & Value-Added Services", weight: 5, sector: "All", description: "Creative solutions, automation, AI integration, and additional value beyond base requirements." },
  { id: "EC-11", criterion: "Local Content & Partnerships", weight: 5, sector: "Construction", description: "Use of local resources, subcontractors, materials, and community engagement." },
  { id: "EC-12", criterion: "Environmental & Safety Compliance", weight: 5, sector: "Construction", description: "Environmental impact assessment, safety protocols, and regulatory compliance." },
  { id: "EC-13", criterion: "Supply Chain & Logistics Plan", weight: 5, sector: "Logistics", description: "Procurement strategy, supply chain management, and delivery logistics." },
  { id: "EC-14", criterion: "Scalability & Future-Proofing", weight: 5, sector: "IT Services", description: "Ability to scale the solution and adapt to changing requirements over time." },
  { id: "EC-15", criterion: "Transition & Knowledge Transfer", weight: 5, sector: "All", description: "Plan for handover, training, documentation, and operational transition." },
];

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Get historical win rate for a given sector from bid history.
 */
export function getWinRateBySector(sector: string): { wins: number; total: number; rate: number } {
  const history = getBidHistory();
  const sectorBids = history.filter((b) => b.sector.toLowerCase() === sector.toLowerCase());
  if (sectorBids.length === 0) {
    // Fall back to overall win rate
    const wins = history.filter((b) => b.outcome === "Win").length;
    return { wins, total: history.length, rate: history.length > 0 ? wins / history.length : 0.5 };
  }
  const wins = sectorBids.filter((b) => b.outcome === "Win").length;
  return { wins, total: sectorBids.length, rate: wins / sectorBids.length };
}

/**
 * Get average compliance % for winning bids in a sector.
 */
export function getAvgWinningCompliance(sector: string): number {
  const history = getBidHistory();
  const wins = history.filter(
    (b) => b.outcome === "Win" && (sector === "All" || b.sector.toLowerCase() === sector.toLowerCase()),
  );
  if (wins.length === 0) return 75;
  return Math.round(wins.reduce((sum, b) => sum + b.compliancePct, 0) / wins.length);
}

/**
 * Get average score for winning bids to use as baseline comparison.
 */
export function getAvgWinningScore(sector?: string): number {
  const history = getBidHistory();
  const wins = history.filter(
    (b) => b.outcome === "Win" && (!sector || b.sector.toLowerCase() === sector.toLowerCase()),
  );
  if (wins.length === 0) return 70;
  return Math.round(wins.reduce((sum, b) => sum + b.score, 0) / wins.length);
}
