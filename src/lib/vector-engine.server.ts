/**
 * vector-engine.server.ts — In-memory vector search for capability matching
 *
 * Uses Gemini's embedding model to generate embeddings for capability records.
 * Implements cosine similarity search across the 50-record capability library.
 *
 * At 50 records × 768 dimensions, brute-force cosine similarity completes in <1ms.
 * No FAISS or external vector DB needed.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import process from "node:process";
import { getCapabilityLibrary, type CapabilityRecord } from "./datasets.server";

// ─── Types ───────────────────────────────────────────────────────────

export interface VectorMatch {
  capId: string;
  capability: CapabilityRecord;
  similarity: number;
  rank: number;
}

// ─── Embedding Cache ─────────────────────────────────────────────────

let _embeddings: Map<string, number[]> | null = null;
let _initPromise: Promise<void> | null = null;

function getGenAI(): GoogleGenerativeAI {
  const apiKey = process.env.GOOGLE_API_KEY || "missing-key";
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Generate embedding for a text string using Gemini embedding model.
 */
async function getEmbedding(text: string): Promise<number[]> {
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });

  try {
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (err) {
    console.error("[vector-engine] Embedding generation failed:", err);
    throw err;
  }
}

/**
 * Build a rich text representation of a capability record for embedding.
 * Combines all fields into a searchable narrative.
 */
function capabilityToText(cap: CapabilityRecord): string {
  return [
    cap.projectSummary,
    `Domain: ${cap.domain}`,
    `Certification: ${cap.certification}`,
    `Year: ${cap.yearCompleted}`,
    `Value: ${cap.contractValue}`,
    `Duration: ${cap.durationMonths} months`,
    `Client: ${cap.clientType}`,
  ].join(". ");
}

/**
 * Initialize the vector index by embedding all capability records.
 * Called lazily on first search. Results are cached in memory.
 */
async function ensureInitialized(): Promise<void> {
  if (_embeddings) return;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    console.log("[vector-engine] Initializing embedding index...");
    const capabilities = getCapabilityLibrary();

    if (capabilities.length === 0) {
      console.warn("[vector-engine] No capability records to embed");
      _embeddings = new Map();
      return;
    }

    _embeddings = new Map();

    // Batch embed in groups of 10 to respect rate limits
    const batchSize = 10;
    for (let i = 0; i < capabilities.length; i += batchSize) {
      const batch = capabilities.slice(i, i + batchSize);
      const embedPromises = batch.map(async (cap) => {
        const text = capabilityToText(cap);
        try {
          const embedding = await getEmbedding(text);
          _embeddings!.set(cap.capId, embedding);
        } catch (err) {
          console.error(`[vector-engine] Failed to embed ${cap.capId}:`, err);
        }
      });
      await Promise.all(embedPromises);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < capabilities.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    console.log(`[vector-engine] Indexed ${_embeddings.size} capability embeddings`);
  })();

  return _initPromise;
}

// ─── Similarity Functions ────────────────────────────────────────────

/**
 * Compute cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * Search the capability library for the top-K matches to a query text.
 * Returns results sorted by similarity (highest first).
 */
export async function findTopKMatches(queryText: string, k: number = 3): Promise<VectorMatch[]> {
  await ensureInitialized();

  if (!_embeddings || _embeddings.size === 0) {
    console.warn("[vector-engine] No embeddings available for search");
    return [];
  }

  // Embed the query
  const queryEmbedding = await getEmbedding(queryText);
  const capabilities = getCapabilityLibrary();

  // Compute similarity against all capability embeddings
  const scores: { capId: string; similarity: number }[] = [];

  for (const [capId, embedding] of _embeddings.entries()) {
    const similarity = cosineSimilarity(queryEmbedding, embedding);
    scores.push({ capId, similarity });
  }

  // Sort by similarity (descending) and take top K
  scores.sort((a, b) => b.similarity - a.similarity);
  const topK = scores.slice(0, k);

  return topK.map((match, index) => ({
    capId: match.capId,
    capability: capabilities.find((c) => c.capId === match.capId)!,
    similarity: Math.round(match.similarity * 100) / 100,
    rank: index + 1,
  }));
}

/**
 * Classify a match based on similarity score.
 */
export function classifyMatch(similarity: number): "matched" | "partial" | "gap" {
  if (similarity >= 0.75) return "matched";
  if (similarity >= 0.50) return "partial";
  return "gap";
}

/**
 * Reset the embedding cache (useful for testing or reloading data).
 */
export function resetVectorEngine(): void {
  _embeddings = null;
  _initPromise = null;
}
