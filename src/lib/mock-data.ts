/**
 * mock-data.ts — Cleaned up to export just the types and enums used
 * by UI components, now that real data is fetched via the server.
 */

export type ReqStatus = "matched" | "partial" | "gap" | "info";
export type ReqCategory = "Mandatory" | "Technical" | "Financial" | "Legal" | "Submission";

export interface Requirement {
  id: string;
  category: ReqCategory;
  text: string;
  priority: "High" | "Medium" | "Low";
  confidence: number;
  status: ReqStatus;
}

export interface Capability {
  id: string;
  project: string;
  domain: string;
  certification: string;
  year: number;
  contractValue: string;
  clientType: string;
  matchStrength: number;
}

export const missionSteps = [
  { key: "intake", label: "Document Intake", status: "complete" as const },
  { key: "extract", label: "Requirement Extraction", status: "complete" as const },
  { key: "match", label: "Capability Matching", status: "complete" as const },
  { key: "compliance", label: "Compliance Review", status: "active" as const },
  { key: "draft", label: "Proposal Drafting", status: "pending" as const },
  { key: "score", label: "Win Scoring", status: "pending" as const },
  { key: "decision", label: "Final Decision", status: "pending" as const },
];
