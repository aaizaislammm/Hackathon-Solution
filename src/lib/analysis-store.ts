/**
 * analysis-store.ts — Client-side state management for RFP analysis
 *
 * Holds the current analysis result and provides a React hook
 * for components to read/write the shared state.
 *
 * Uses a simple global + event pattern (no external state library needed).
 */

import { useSyncExternalStore, useCallback } from "react";
import type { AnalysisResponse } from "./api/rfp.functions";

// ─── Types ───────────────────────────────────────────────────────────

export type AnalysisStatus = "idle" | "uploading" | "parsing" | "extracting" | "matching" | "scoring" | "drafting" | "complete" | "error";

export interface AnalysisState {
  status: AnalysisStatus;
  statusMessage: string;
  result: AnalysisResponse | null;
  fileName: string;
  error: string | null;
}

// ─── Global Store ────────────────────────────────────────────────────

let _state: AnalysisState = {
  status: "idle",
  statusMessage: "",
  result: null,
  fileName: "",
  error: null,
};

const _listeners = new Set<() => void>();

function emitChange() {
  for (const listener of _listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function getSnapshot(): AnalysisState {
  return _state;
}

// ─── Mutations ───────────────────────────────────────────────────────

export function setAnalysisStatus(status: AnalysisStatus, message?: string): void {
  _state = { ..._state, status, statusMessage: message || _state.statusMessage };
  emitChange();
}

export function setAnalysisResult(result: AnalysisResponse, fileName: string): void {
  _state = {
    status: "complete",
    statusMessage: "Analysis complete",
    result,
    fileName,
    error: null,
  };
  emitChange();
}

export function setAnalysisError(error: string): void {
  _state = { ..._state, status: "error", error };
  emitChange();
}

export function resetAnalysis(): void {
  _state = {
    status: "idle",
    statusMessage: "",
    result: null,
    fileName: "",
    error: null,
  };
  emitChange();
}

// ─── React Hook ──────────────────────────────────────────────────────

/**
 * React hook to subscribe to analysis state changes.
 * Re-renders the component whenever the analysis state updates.
 */
export function useAnalysisStore(): AnalysisState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/**
 * Helper hook that provides both state and the analyze function.
 */
export function useAnalysis() {
  const state = useAnalysisStore();

  const analyze = useCallback(async (file: File) => {
    try {
      setAnalysisStatus("uploading", `Uploading ${file.name}...`);

      // Read file as base64
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);

      setAnalysisStatus("parsing", "Parsing PDF document...");

      // Import and call the server function
      const { analyzeRfp } = await import("./api/rfp.functions");

      setAnalysisStatus("extracting", "AI is extracting requirements...");

      const result = await analyzeRfp({
        data: {
          fileBase64: base64,
          fileName: file.name,
        },
      });

      if (result.success) {
        setAnalysisResult(result, file.name);
      } else {
        setAnalysisError(result.errors.join("; ") || "Analysis failed");
      }

      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setAnalysisError(msg);
      return null;
    }
  }, []);

  return { state, analyze };
}
