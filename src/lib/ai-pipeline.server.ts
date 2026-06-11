/**
 * ai-pipeline.server.ts — Core AI logic using Gemini Flash
 *
 * Handles PDF parsing, requirement extraction with structured JSON output,
 * capability matching via RAG, and proposal section drafting.
 *
 * All functions run server-side only (.server.ts suffix).
 */

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import process from "node:process";
import { findTopKMatches, classifyMatch, type VectorMatch } from "./vector-engine.server";
import { getCapabilityLibrary, type CapabilityRecord } from "./datasets.server";

// ─── Types ───────────────────────────────────────────────────────────

export interface ExtractedRequirement {
  id: string;
  category: "Mandatory" | "Technical" | "Financial" | "Legal" | "Submission";
  text: string;
  priority: "High" | "Medium" | "Low";
  section: string;
  confidence: number;
}

export interface RfpMetadata {
  title: string;
  client: string;
  sector: string;
  deadline: string;
  budget: string;
  pages: number;
  summary: string;
}

export interface ComplianceItem {
  requirementId: string;
  requirement: ExtractedRequirement;
  status: "matched" | "partial" | "gap" | "info";
  matchedCapabilities: VectorMatch[];
  evidence: string;
  similarity: number;
}

export interface ProposalSection {
  id: string;
  title: string;
  content: string;
  words: number;
  linkedRequirements: string[];
}

export interface AnalysisResult {
  rfpMeta: RfpMetadata;
  requirements: ExtractedRequirement[];
  compliance: ComplianceItem[];
  proposalSections: ProposalSection[];
  processingLog: string[];
}

// ─── Gemini Client ───────────────────────────────────────────────────

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_API_KEY || "missing-key";
  return new GoogleGenerativeAI(apiKey);
}

async function callGeminiWithRetry(
  prompt: string,
  systemInstruction: string,
  maxRetries: number = 3,
): Promise<string> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction,
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`[ai-pipeline] Gemini call attempt ${attempt}/${maxRetries} failed:`, errMsg);

      if (attempt === maxRetries) throw err;

      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`[ai-pipeline] Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("[ai-pipeline] All retry attempts exhausted");
}

// ─── PDF Parsing ─────────────────────────────────────────────────────

/**
 * Parse a PDF buffer and extract text content.
 * Returns the extracted text and page count.
 */
export async function parsePDF(
  fileBuffer: Buffer,
): Promise<{ text: string; pages: number; errors: string[] }> {
  const errors: string[] = [];

  try {
    // Dynamic import for pdf-parse (CommonJS module)
    const pdfParseMod = await import("pdf-parse") as any;
    const pdfParse = pdfParseMod.default || pdfParseMod;
    // @ts-ignore - pdfParse types might be weird
    const data = await pdfParse(fileBuffer);

    if (!data.text || data.text.trim().length < 50) {
      errors.push(
        "PDF appears to be scanned/image-based with minimal extractable text. " +
        "OCR is not supported — please provide a text-based PDF."
      );
    }

    return {
      text: data.text || "",
      pages: data.numpages || 0,
      errors,
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[ai-pipeline] PDF parsing failed:", errMsg);
    errors.push(`PDF parsing error: ${errMsg}`);
    return { text: "", pages: 0, errors };
  }
}

// ─── Requirement Extraction ──────────────────────────────────────────

/**
 * Use Gemini Flash with structured output to extract requirements from RFP text.
 * Does NOT use regex or string splits — all extraction is LLM-powered.
 */
export async function extractRequirements(
  pdfText: string,
): Promise<{ requirements: ExtractedRequirement[]; metadata: RfpMetadata; errors: string[] }> {
  const errors: string[] = [];

  // Truncate very long documents to fit context window
  const maxChars = 100_000;
  const truncatedText = pdfText.length > maxChars
    ? pdfText.slice(0, maxChars) + "\n\n[DOCUMENT TRUNCATED — remaining pages not processed]"
    : pdfText;

  const systemInstruction = `You are an expert bid analyst. You extract structured data from RFP/RFQ/Tender documents.
You MUST respond with valid JSON only — no markdown, no explanations, no code fences.`;

  const prompt = `Analyze this RFP/Tender document and extract ALL requirements and metadata.

DOCUMENT TEXT:
${truncatedText}

Respond with this EXACT JSON structure (no markdown code fences, just raw JSON):
{
  "metadata": {
    "title": "Full title of the RFP/Tender",
    "client": "Issuing organization name",
    "sector": "One of: IT Services, Construction, Energy, Healthcare, Finance, Telecom, Education, Logistics, or Other",
    "deadline": "Submission deadline date or 'Not specified'",
    "budget": "Budget/estimated value or 'Not specified'",
    "summary": "2-3 sentence summary of what the RFP is requesting"
  },
  "requirements": [
    {
      "id": "R-01",
      "category": "Mandatory|Technical|Financial|Legal|Submission",
      "text": "Clear description of the requirement",
      "priority": "High|Medium|Low",
      "section": "Section reference from the document (e.g., 'Section 4.2' or 'General')",
      "confidence": 0.95
    }
  ]
}

RULES:
- Extract EVERY identifiable requirement, compliance clause, and submission instruction
- Use sequential IDs: R-01, R-02, R-03, etc.
- Mandatory requirements that cause disqualification if missed = "High" priority
- Set confidence between 0.0 and 1.0 based on how clearly the requirement is stated
- Categories: Mandatory (pass/fail), Technical (solution specs), Financial (pricing/budget), Legal (certifications/compliance), Submission (format/deadline)
- If no clear RFP structure is found, still extract any identifiable requirements or goals`;

  try {
    const responseText = await callGeminiWithRetry(prompt, systemInstruction);

    // Clean the response — strip markdown code fences if present
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleanJson);

    const requirements: ExtractedRequirement[] = (parsed.requirements || []).map(
      (r: Record<string, unknown>, i: number) => ({
        id: String(r.id || `R-${String(i + 1).padStart(2, "0")}`),
        category: validateCategory(String(r.category || "Technical")),
        text: String(r.text || ""),
        priority: validatePriority(String(r.priority || "Medium")),
        section: String(r.section || "General"),
        confidence: Number(r.confidence || 0.8),
      }),
    );

    const metadata: RfpMetadata = {
      title: String(parsed.metadata?.title || "Untitled RFP"),
      client: String(parsed.metadata?.client || "Unknown Client"),
      sector: String(parsed.metadata?.sector || "Other"),
      deadline: String(parsed.metadata?.deadline || "Not specified"),
      budget: String(parsed.metadata?.budget || "Not specified"),
      pages: 0, // filled in later
      summary: String(parsed.metadata?.summary || ""),
    };

    if (requirements.length === 0) {
      errors.push("No requirements could be extracted. The document may not contain a standard RFP structure.");
    }

    console.log(`[ai-pipeline] Extracted ${requirements.length} requirements from RFP`);
    return { requirements, metadata, errors };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[ai-pipeline] Requirement extraction failed:", errMsg);
    errors.push(`AI extraction error: ${errMsg}`);
    return {
      requirements: [],
      metadata: {
        title: "Untitled RFP",
        client: "Unknown",
        sector: "Other",
        deadline: "Not specified",
        budget: "Not specified",
        pages: 0,
        summary: "",
      },
      errors,
    };
  }
}

function validateCategory(cat: string): ExtractedRequirement["category"] {
  const valid = ["Mandatory", "Technical", "Financial", "Legal", "Submission"];
  return valid.includes(cat) ? (cat as ExtractedRequirement["category"]) : "Technical";
}

function validatePriority(pri: string): ExtractedRequirement["priority"] {
  const valid = ["High", "Medium", "Low"];
  return valid.includes(pri) ? (pri as ExtractedRequirement["priority"]) : "Medium";
}

// ─── Capability Matching (RAG) ───────────────────────────────────────

/**
 * Match a single requirement against the capability library using vector search.
 */
export async function matchRequirement(requirement: ExtractedRequirement): Promise<ComplianceItem> {
  try {
    const matches = await findTopKMatches(requirement.text, 3);

    const topMatch = matches[0];
    const similarity = topMatch ? topMatch.similarity : 0;
    const status = topMatch ? classifyMatch(similarity) : "gap";

    // Build evidence string from top matches
    const evidence = matches.length > 0
      ? matches
          .map((m) => `${m.capability.projectSummary} (${m.capability.domain}, ${m.capability.yearCompleted})`)
          .join("; ")
      : "No matching evidence found in capability library";

    return {
      requirementId: requirement.id,
      requirement,
      status: requirement.category === "Submission" ? "info" : status,
      matchedCapabilities: matches,
      evidence,
      similarity,
    };
  } catch (err) {
    console.error(`[ai-pipeline] Matching failed for ${requirement.id}:`, err);
    return {
      requirementId: requirement.id,
      requirement,
      status: "gap",
      matchedCapabilities: [],
      evidence: "Matching engine unavailable — manual review required",
      similarity: 0,
    };
  }
}

/**
 * Match ALL requirements against the capability library.
 * Processes in batches to respect API rate limits.
 */
export async function matchAllRequirements(
  requirements: ExtractedRequirement[],
): Promise<ComplianceItem[]> {
  console.log(`[ai-pipeline] Matching ${requirements.length} requirements against capability library...`);

  const results: ComplianceItem[] = [];
  const batchSize = 5;

  for (let i = 0; i < requirements.length; i += batchSize) {
    const batch = requirements.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(matchRequirement));
    results.push(...batchResults);

    if (i + batchSize < requirements.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  console.log(`[ai-pipeline] Matching complete. Results: ${results.filter((r) => r.status === "matched").length} matched, ${results.filter((r) => r.status === "partial").length} partial, ${results.filter((r) => r.status === "gap").length} gaps`);
  return results;
}

// ─── Proposal Drafting ───────────────────────────────────────────────

/**
 * Draft a proposal section that bridges an RFP requirement to matched capabilities.
 */
export async function draftProposalSection(
  sectionTitle: string,
  requirements: ExtractedRequirement[],
  complianceItems: ComplianceItem[],
  rfpMeta: RfpMetadata,
): Promise<ProposalSection> {
  const reqTexts = requirements.map((r) => `- [${r.id}] ${r.text}`).join("\n");
  const evidenceTexts = complianceItems
    .filter((c) => c.matchedCapabilities.length > 0)
    .map((c) => {
      const cap = c.matchedCapabilities[0]?.capability;
      return cap
        ? `- ${cap.projectSummary} (${cap.domain}, ${cap.contractValue}, ${cap.yearCompleted})`
        : "";
    })
    .filter(Boolean)
    .join("\n");

  const systemInstruction = `You are a professional bid writer. Write compelling proposal sections that are formal, specific, and evidence-based.`;

  const prompt = `Write a proposal section titled "${sectionTitle}" for an RFP response.

RFP Context:
- Client: ${rfpMeta.client}
- Sector: ${rfpMeta.sector}
- Title: ${rfpMeta.title}

Requirements to address:
${reqTexts}

Company evidence/past projects to reference:
${evidenceTexts || "No specific evidence available — write using general capabilities."}

RULES:
- Write 150-300 words
- Be specific — reference actual project names and values from the evidence
- Use a professional, confident tone
- Address each requirement directly
- Do NOT use placeholder text like [Company Name] — use "our organization" or "TEKROWE"
- Include specific metrics and outcomes where possible`;

  try {
    const content = await callGeminiWithRetry(prompt, systemInstruction);

    return {
      id: sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20),
      title: sectionTitle,
      content: content.trim(),
      words: content.trim().split(/\s+/).length,
      linkedRequirements: requirements.map((r) => r.id),
    };
  } catch (err) {
    console.error(`[ai-pipeline] Proposal drafting failed for "${sectionTitle}":`, err);
    return {
      id: sectionTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 20),
      title: sectionTitle,
      content: `[AI drafting unavailable — please write this section manually. It should address: ${requirements.map((r) => r.text).join("; ")}]`,
      words: 0,
      linkedRequirements: requirements.map((r) => r.id),
    };
  }
}

/**
 * Generate all proposal sections for the full response.
 */
export async function generateFullProposal(
  requirements: ExtractedRequirement[],
  compliance: ComplianceItem[],
  rfpMeta: RfpMetadata,
): Promise<ProposalSection[]> {
  const sectionPlan = [
    { title: "Executive Summary", filter: () => true },
    { title: "Understanding of Requirements", filter: (r: ExtractedRequirement) => r.category === "Mandatory" || r.category === "Technical" },
    { title: "Company Experience & Past Performance", filter: (r: ExtractedRequirement) => r.category === "Mandatory" },
    { title: "Technical Approach", filter: (r: ExtractedRequirement) => r.category === "Technical" },
    { title: "Project Team & Qualifications", filter: (r: ExtractedRequirement) => r.text.toLowerCase().includes("team") || r.text.toLowerCase().includes("personnel") || r.text.toLowerCase().includes("cv") || r.text.toLowerCase().includes("qualification") },
    { title: "Implementation Timeline", filter: (r: ExtractedRequirement) => r.text.toLowerCase().includes("timeline") || r.text.toLowerCase().includes("schedule") || r.text.toLowerCase().includes("milestone") || r.category === "Submission" },
    { title: "Compliance Statement", filter: (r: ExtractedRequirement) => r.category === "Legal" || r.category === "Mandatory" },
    { title: "Financial Proposal Overview", filter: (r: ExtractedRequirement) => r.category === "Financial" },
  ];

  const sections: ProposalSection[] = [];

  for (const plan of sectionPlan) {
    const filteredReqs = requirements.filter(plan.filter);
    const relevantCompliance = compliance.filter((c) =>
      filteredReqs.some((r) => r.id === c.requirementId),
    );

    // Use all requirements for Executive Summary
    const reqs = plan.title === "Executive Summary" ? requirements.slice(0, 5) : filteredReqs;
    const comp = plan.title === "Executive Summary" ? compliance.slice(0, 5) : relevantCompliance;

    if (reqs.length === 0 && plan.title !== "Executive Summary") continue;

    const section = await draftProposalSection(plan.title, reqs, comp, rfpMeta);
    sections.push(section);

    // Rate limit between sections
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return sections;
}

// ─── Full Pipeline ───────────────────────────────────────────────────

/**
 * Run the complete analysis pipeline on an uploaded PDF.
 * Returns all extracted data in a single result object.
 */
export async function runFullPipeline(
  fileBuffer: Buffer,
): Promise<AnalysisResult> {
  const log: string[] = [];

  // Step 1: Parse PDF
  log.push("Parsing PDF document...");
  const { text, pages, errors: parseErrors } = await parsePDF(fileBuffer);
  log.push(`Extracted ${text.length} characters from ${pages} pages`);
  if (parseErrors.length > 0) {
    log.push(`Parse warnings: ${parseErrors.join("; ")}`);
  }

  if (text.trim().length < 50) {
    log.push("ERROR: Insufficient text extracted from PDF");
    return {
      rfpMeta: {
        title: "Unreadable Document",
        client: "Unknown",
        sector: "Other",
        deadline: "N/A",
        budget: "N/A",
        pages,
        summary: "The document could not be parsed. It may be scanned or image-based.",
      },
      requirements: [],
      compliance: [],
      proposalSections: [],
      processingLog: log,
    };
  }

  // Step 2: Extract Requirements
  log.push("Extracting requirements with Gemini Flash...");
  const { requirements, metadata, errors: extractErrors } = await extractRequirements(text);
  metadata.pages = pages;
  log.push(`Found ${requirements.length} requirements across ${new Set(requirements.map((r) => r.category)).size} categories`);
  if (extractErrors.length > 0) {
    log.push(`Extraction warnings: ${extractErrors.join("; ")}`);
  }

  // Step 3: Match against Capability Library
  log.push("Matching requirements against capability library via RAG...");
  const compliance = await matchAllRequirements(requirements);
  const matched = compliance.filter((c) => c.status === "matched").length;
  const partial = compliance.filter((c) => c.status === "partial").length;
  const gaps = compliance.filter((c) => c.status === "gap").length;
  log.push(`Matching complete: ${matched} matched, ${partial} partial, ${gaps} gaps`);

  // Step 4: Generate Proposal Draft
  log.push("Generating AI proposal draft...");
  const proposalSections = await generateFullProposal(requirements, compliance, metadata);
  log.push(`Drafted ${proposalSections.length} proposal sections (${proposalSections.reduce((sum, s) => sum + s.words, 0)} total words)`);

  log.push("Pipeline complete.");

  return {
    rfpMeta: metadata,
    requirements,
    compliance,
    proposalSections,
    processingLog: log,
  };
}
