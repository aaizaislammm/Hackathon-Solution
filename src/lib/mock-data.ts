// Mock data for BidPilot AI — replace with API/backend integration later.

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

export const rfpMeta = {
  client: "Ministry of Digital Affairs",
  sector: "Government / Public Sector",
  deadline: "Dec 18, 2026",
  budget: "$2.4M USD",
  pages: 84,
  title: "National Citizen Services Platform — RFP-2026-0471",
};

export const requirements: Requirement[] = [
  { id: "R-01", category: "Mandatory", text: "Company must have at least 3 similar past projects", priority: "High", confidence: 0.94, status: "partial" },
  { id: "R-02", category: "Mandatory", text: "ISO 9001 / 27001 certification required", priority: "High", confidence: 0.98, status: "matched" },
  { id: "R-03", category: "Technical", text: "Cloud-native, multi-region deployment architecture", priority: "High", confidence: 0.91, status: "matched" },
  { id: "R-04", category: "Technical", text: "Technical methodology document (Agile/SAFe)", priority: "Medium", confidence: 0.87, status: "matched" },
  { id: "R-05", category: "Technical", text: "Citizen identity integration via national eID", priority: "High", confidence: 0.82, status: "partial" },
  { id: "R-06", category: "Financial", text: "Financial proposal submitted in a separate sealed envelope", priority: "High", confidence: 0.96, status: "info" },
  { id: "R-07", category: "Financial", text: "Audited financial statements (last 3 years)", priority: "High", confidence: 0.95, status: "gap" },
  { id: "R-08", category: "Financial", text: "Performance bond — 5% of contract value", priority: "Medium", confidence: 0.90, status: "matched" },
  { id: "R-09", category: "Legal", text: "Local entity registration or partnership", priority: "High", confidence: 0.92, status: "matched" },
  { id: "R-10", category: "Legal", text: "Data residency compliance — in-country hosting", priority: "High", confidence: 0.89, status: "partial" },
  { id: "R-11", category: "Legal", text: "Conflict of interest declaration", priority: "Low", confidence: 0.97, status: "matched" },
  { id: "R-12", category: "Submission", text: "Proposal submitted before Dec 18, 2026 17:00 local", priority: "High", confidence: 1.00, status: "info" },
  { id: "R-13", category: "Submission", text: "CVs of all proposed team members (signed)", priority: "High", confidence: 0.93, status: "gap" },
  { id: "R-14", category: "Submission", text: "Cover letter on company letterhead", priority: "Low", confidence: 0.99, status: "matched" },
  { id: "R-15", category: "Technical", text: "SLA: 99.95% uptime with monthly reporting", priority: "Medium", confidence: 0.85, status: "matched" },
  { id: "R-16", category: "Technical", text: "Accessibility WCAG 2.2 AA compliance", priority: "Medium", confidence: 0.88, status: "matched" },
  { id: "R-17", category: "Mandatory", text: "Project Manager with PMP certification", priority: "High", confidence: 0.94, status: "matched" },
  { id: "R-18", category: "Technical", text: "Open-source first; vendor lock-in mitigation plan", priority: "Low", confidence: 0.80, status: "matched" },
  { id: "R-19", category: "Financial", text: "Pricing in USD with VAT itemized", priority: "Medium", confidence: 0.96, status: "matched" },
  { id: "R-20", category: "Mandatory", text: "Local language support (Arabic + English UI)", priority: "Medium", confidence: 0.86, status: "matched" },
];

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

export const capabilities: Capability[] = [
  { id: "C-01", project: "ERP Implementation for Federal Tax Authority", domain: "ERP / Government", certification: "ISO 27001", year: 2024, contractValue: "$3.8M", clientType: "Government", matchStrength: 92 },
  { id: "C-02", project: "Cloud Infrastructure Migration — National Bank", domain: "Cloud / Infra", certification: "ISO 9001", year: 2023, contractValue: "$2.1M", clientType: "Finance", matchStrength: 88 },
  { id: "C-03", project: "IT Helpdesk Support — Provincial Government", domain: "Managed Services", certification: "ITIL v4", year: 2025, contractValue: "$1.4M", clientType: "Government", matchStrength: 76 },
  { id: "C-04", project: "Data Analytics Dashboard — Ministry of Health", domain: "Analytics / BI", certification: "ISO 27001", year: 2024, contractValue: "$960K", clientType: "Government", matchStrength: 84 },
  { id: "C-05", project: "Citizen Identity Wallet Pilot", domain: "Identity / eGov", certification: "eIDAS", year: 2025, contractValue: "$1.8M", clientType: "Government", matchStrength: 95 },
  { id: "C-06", project: "Smart City Operations Center", domain: "IoT / Platform", certification: "ISO 9001", year: 2023, contractValue: "$4.2M", clientType: "Municipal", matchStrength: 71 },
];

export const matches = [
  { reqId: "R-01", capId: "C-01", evidence: "ERP rollout for federal tax authority (2024)", pct: 92, status: "Strong Match" },
  { reqId: "R-02", capId: "C-01", evidence: "ISO 27001 certificate, valid through 2027", pct: 100, status: "Strong Match" },
  { reqId: "R-03", capId: "C-02", evidence: "Multi-region AWS deployment for national bank", pct: 88, status: "Strong Match" },
  { reqId: "R-05", capId: "C-05", evidence: "Citizen Identity Wallet pilot — eID integration", pct: 74, status: "Partial Match" },
  { reqId: "R-07", capId: "—", evidence: "Audit reports not yet uploaded to vault", pct: 0, status: "No Match" },
  { reqId: "R-10", capId: "C-02", evidence: "In-country hosting region exists but uncertified", pct: 62, status: "Partial Match" },
  { reqId: "R-13", capId: "—", evidence: "Team CVs require signature refresh", pct: 0, status: "No Match" },
  { reqId: "R-15", capId: "C-06", evidence: "Smart City SLA 99.92% — needs slight uplift", pct: 81, status: "Strong Match" },
];

export const aiChat = [
  { role: "ai", text: "Mission initialized. Document ingested in 1.4s — 84 pages, 6 sections." },
  { role: "ai", text: "I extracted 20 requirements across 5 categories." },
  { role: "ai", text: "14 are fully compliant, 4 need review, 2 are high-risk gaps." },
  { role: "ai", text: "Recommended decision: GO with conditions. Resolve financial documentation gaps before submission." },
];

export const missionSteps = [
  { key: "intake", label: "Document Intake", status: "complete" as const },
  { key: "extract", label: "Requirement Extraction", status: "complete" as const },
  { key: "match", label: "Capability Matching", status: "complete" as const },
  { key: "compliance", label: "Compliance Review", status: "active" as const },
  { key: "draft", label: "Proposal Drafting", status: "pending" as const },
  { key: "score", label: "Win Scoring", status: "pending" as const },
  { key: "decision", label: "Final Decision", status: "pending" as const },
];

export const winFactors = [
  { label: "Compliance Match", value: 78, color: "neon-green" },
  { label: "Budget Alignment", value: 82, color: "neon-cyan" },
  { label: "Similar Experience", value: 88, color: "neon-blue" },
  { label: "Past Win Rate", value: 65, color: "neon-amber" },
  { label: "Risk Level (inverted)", value: 58, color: "neon-violet" },
];

export const proposalSections = [
  { id: "exec", title: "Executive Summary", words: 312 },
  { id: "und", title: "Understanding of Requirements", words: 540 },
  { id: "exp", title: "Company Experience", words: 720 },
  { id: "tech", title: "Technical Approach", words: 1180 },
  { id: "team", title: "Project Team", words: 380 },
  { id: "time", title: "Implementation Timeline", words: 290 },
  { id: "comp", title: "Compliance Response", words: 640 },
  { id: "con", title: "Conclusion", words: 180 },
];
