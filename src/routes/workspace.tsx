import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, ScanSearch, Building2, Calendar, DollarSign, Files, Tag,
  Bot, Sparkles, ListChecks, FileEdit, AlertTriangle, Gauge, Download, Send,
  CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { MissionTimeline } from "@/components/MissionTimeline";
import { useAnalysis, type AnalysisStatus } from "@/lib/analysis-store";

export const Route = createFileRoute("/workspace")({
  head: () => ({ meta: [{ title: "RFP Mission Workspace — BidPilot AI" }] }),
  component: WorkspacePage,
});

type ReqStatus = "matched" | "partial" | "gap" | "info";
const statusColor: Record<ReqStatus, string> = {
  matched: "neon-green",
  partial: "neon-amber",
  gap: "neon-red",
  info: "neon-blue",
};
const statusLabel: Record<ReqStatus, string> = {
  matched: "Matched",
  partial: "Partial",
  gap: "Gap",
  info: "Info",
};

const statusMessages: Record<AnalysisStatus, string> = {
  idle: "",
  uploading: "Uploading document…",
  parsing: "Parsing PDF pages with AI…",
  extracting: "Extracting requirements via Gemini Flash…",
  matching: "Matching against capability library (RAG)…",
  scoring: "Calculating win probability…",
  drafting: "Drafting proposal sections…",
  complete: "Mission complete.",
  error: "Analysis encountered an error.",
};

function WorkspacePage() {
  const { state, analyze } = useAnalysis();
  const [activeCat, setActiveCat] = useState<string>("All");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isProcessing = ["uploading", "parsing", "extracting", "matching", "scoring", "drafting"].includes(state.status);
  const isComplete = state.status === "complete" && state.result !== null;

  // Use real data if available, otherwise show empty state
  const rfpMeta = isComplete ? state.result!.rfpMeta : null;
  const requirements = isComplete ? state.result!.requirements : [];
  const aiMessages = isComplete
    ? [
        `Mission initialized. Document ingested — ${rfpMeta!.pages} pages.`,
        `Extracted ${requirements.length} requirements across ${new Set(requirements.map(r => r.category)).size} categories.`,
        `${state.result!.complianceScore.matched} fully compliant, ${state.result!.complianceScore.partial} need review, ${state.result!.complianceScore.gaps} gaps.`,
        `Recommended decision: ${state.result!.winProbability.decisionLabel}. ${state.result!.winProbability.recommendations[0] || ""}`,
      ]
    : (state.result?.processingLog || []);

  // Processing log as chat messages
  const chatMessages = isComplete
    ? aiMessages.map((text: string) => ({ role: "ai" as const, text }))
    : isProcessing
      ? [{ role: "ai" as const, text: statusMessages[state.status] || "Processing…" }]
      : state.status === "error"
        ? [{ role: "ai" as const, text: `Error: ${state.error}` }]
        : [{ role: "ai" as const, text: "Upload an RFP document to begin analysis." }];

  const cats = isComplete
    ? ["All", ...Array.from(new Set(requirements.map(r => r.category)))]
    : ["All"];
  const visible = activeCat === "All"
    ? requirements
    : requirements.filter(r => r.category === activeCat);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;
    await analyze(selectedFile);
  };

  const missionStep = isComplete ? "compliance" : isProcessing ? "extract" : "intake";

  return (
    <div className="space-y-5">
      {/* Mission header */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-neon-blue/15 neon-border-blue">
              <FileText className="h-5 w-5 text-neon-cyan" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">
                Active Mission <span className="h-px w-6 bg-neon-cyan/40" />
              </div>
              <h1 className="truncate font-display text-xl font-bold sm:text-2xl">
                {rfpMeta?.title || selectedFile?.name || "Upload an RFP to begin"}
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/compliance" className="rounded-lg glass px-3 py-2 text-xs font-medium hover:border-neon-cyan/40">Compliance Map</Link>
            <Link to="/score" className="rounded-lg glass px-3 py-2 text-xs font-medium hover:border-neon-cyan/40">Win Score</Link>
            <Link to="/decision" className="rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-3 py-2 text-xs font-semibold text-background">Decision Room</Link>
          </div>
        </div>
      </div>

      <MissionTimeline active={missionStep} />

      {/* 3-column workspace */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_minmax(0,1fr)_360px]">
        {/* LEFT — Document Scanner */}
        <aside className="space-y-5">
          <div className="glass-strong rounded-2xl p-5">
            <div className="mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-neon-cyan" />
              <h2 className="font-display text-sm font-semibold tracking-wide">Document Scanner</h2>
            </div>
            <label
              className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-neon-blue/30 bg-neon-blue/5 p-6 text-center transition hover:border-neon-blue/60 hover:bg-neon-blue/10"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                className="sr-only"
                onChange={handleFileSelect}
              />
              <div className="grid h-12 w-12 place-items-center rounded-full bg-neon-blue/15 neon-border-blue">
                <Upload className="h-5 w-5 text-neon-cyan" />
              </div>
              <div className="mt-3 text-sm font-medium">Drop RFP / RFQ / Tender</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">PDF · max 80 MB</div>
            </label>

            {/* File preview */}
            {selectedFile && (
              <div className="mt-4 rounded-xl bg-surface-1/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-neon-cyan/15">
                    <FileText className="h-4 w-4 text-neon-cyan" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium">{selectedFile.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${isComplete ? "bg-neon-green/15 text-neon-green" : "bg-neon-amber/15 text-neon-amber"}`}>
                    {isComplete ? "Analyzed" : "Ready"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          {(rfpMeta || selectedFile) && (
            <div className="glass rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-neon-cyan" />
                <h2 className="font-display text-sm font-semibold">RFP Metadata</h2>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-[12px]">
                <Meta icon={Building2} label="Client" value={rfpMeta?.client || "—"} />
                <Meta icon={Tag} label="Sector" value={rfpMeta?.sector || "—"} />
                <Meta icon={Calendar} label="Deadline" value={rfpMeta?.deadline || "—"} accent="neon-amber" />
                <Meta icon={DollarSign} label="Budget" value={rfpMeta?.budget || "—"} accent="neon-green" />
                <Meta icon={Files} label="Pages" value={rfpMeta ? String(rfpMeta.pages) : "—"} />
                <Meta icon={ScanSearch} label="Status" value={isComplete ? "Analyzed" : isProcessing ? "Processing" : "Pending"} accent={isComplete ? "neon-green" : "neon-amber"} />
              </dl>
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={isProcessing || !selectedFile}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-violet p-px disabled:opacity-70"
          >
            <span className="relative flex w-full items-center justify-center gap-2 rounded-[11px] bg-surface-1 px-5 py-3.5 text-sm font-semibold">
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin text-neon-cyan" />
              ) : (
                <Sparkles className="h-4 w-4 text-neon-cyan" />
              )}
              {isProcessing ? statusMessages[state.status] : "Scan with AI"}
            </span>
            {isProcessing && <div className="absolute inset-x-0 top-0 scan-line" />}
          </button>

          {/* Error display */}
          {state.status === "error" && state.error && (
            <div className="rounded-xl bg-neon-red/10 p-3 neon-border-red">
              <div className="flex items-center gap-2 text-[12px] text-neon-red">
                <XCircle className="h-4 w-4" />
                <span className="font-semibold">Error</span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{state.error}</p>
            </div>
          )}
        </aside>

        {/* CENTER — Intelligence Canvas */}
        <section className="glass-strong relative overflow-hidden rounded-2xl p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-neon-cyan/15">
                <ScanSearch className="h-4 w-4 text-neon-cyan" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold">Intelligence Canvas</h2>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {isComplete ? `${requirements.length} extracted requirements · live graph` : "Upload a document to extract requirements"}
                </div>
              </div>
            </div>
            {isComplete && (
              <div className="flex flex-wrap gap-1">
                {cats.map(c => (
                  <button
                    key={c}
                    onClick={() => setActiveCat(c)}
                    className={`rounded-md px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition ${activeCat === c ? "bg-neon-blue/20 text-neon-cyan neon-border-blue" : "bg-surface-1/60 text-muted-foreground hover:text-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          {isComplete && (
            <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px]">
              {(["matched", "partial", "gap", "info"] as const).map(s => (
                <div key={s} className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full bg-${statusColor[s]} shadow-[0_0_6px_currentColor]`} />
                  <span className="text-muted-foreground">{statusLabel[s]}</span>
                </div>
              ))}
            </div>
          )}

          {/* Loading overlay */}
          <AnimatePresence>
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 grid place-items-center bg-background/70 backdrop-blur-sm"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="relative grid h-20 w-20 place-items-center">
                    <span className="absolute inset-0 rounded-full border-2 border-neon-blue/40 pulse-ring" />
                    <span className="absolute inset-2 rounded-full border-2 border-neon-cyan/40 pulse-ring" style={{ animationDelay: "0.5s" }} />
                    <Sparkles className="h-7 w-7 animate-spin text-neon-cyan" />
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-neon-cyan">
                    {statusMessages[state.status]}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {!isComplete && !isProcessing && (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-neon-blue/10 neon-border-blue">
                <Upload className="h-7 w-7 text-neon-cyan/60" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Upload an RFP document and click "Scan with AI" to begin extraction</p>
            </div>
          )}

          {/* Node grid — real extracted requirements */}
          {isComplete && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((r, i) => {
                const compItem = state.result!.compliance.find(c => c.requirementId === r.id);
                const reqStatus = (compItem?.status || "info") as ReqStatus;
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`group relative rounded-xl p-3.5 bg-surface-1/70 neon-border-${statusColor[reqStatus]}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{r.id} · {r.category}</span>
                      <span className={`rounded-full bg-${statusColor[reqStatus]}/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-${statusColor[reqStatus]}`}>
                        {statusLabel[reqStatus]}
                      </span>
                    </div>
                    <p className="mt-2 text-[12.5px] leading-snug">{r.text}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-2 text-[10px]">
                      <span className="text-muted-foreground">Priority: <span className="text-foreground">{r.priority}</span></span>
                      <span className="font-mono text-muted-foreground">conf {Math.round(r.confidence * 100)}%</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* RIGHT — AI Co-Pilot */}
        <aside className="glass-strong flex flex-col rounded-2xl">
          <div className="flex items-center gap-2 border-b border-black/5 p-5">
            <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-neon-violet/15 neon-border-blue">
              <Bot className="h-4 w-4 text-neon-violet" />
              <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor] ${isProcessing ? "bg-neon-amber" : "bg-neon-green"}`} />
            </div>
            <div>
              <h2 className="font-display text-sm font-semibold">AI Co-Pilot</h2>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                BidPilot Agent · Gemini Flash
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {chatMessages.map((m: { role: "ai"; text: string }, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex gap-2"
              >
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neon-violet/15">
                  <Sparkles className="h-3.5 w-3.5 text-neon-violet" />
                </div>
                <div className="glass rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] leading-relaxed">
                  {m.text}
                </div>
              </motion.div>
            ))}

            {/* Processing log */}
            {isComplete && state.result!.processingLog.length > 0 && (
              <div className="mt-3 rounded-xl bg-surface-1/60 p-3">
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Processing Log</div>
                {state.result!.processingLog.map((log, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                    <CheckCircle2 className="h-3 w-3 mt-0.5 text-neon-green shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}

            {isComplete && (
              <div className="mt-2 grid grid-cols-2 gap-2 pt-2">
                {[
                  { label: "Compliance Map", icon: ListChecks, to: "/compliance" },
                  { label: "Draft Proposal", icon: FileEdit, to: "/proposal" },
                  { label: "Find Gaps", icon: AlertTriangle, to: "/compliance" },
                  { label: "Win Score", icon: Gauge, to: "/score" },
                ].map(a => (
                  <Link key={a.label} to={a.to} className="flex items-center gap-2 rounded-lg bg-surface-1/60 px-3 py-2 text-[11.5px] font-medium hover:bg-neon-blue/10 hover:text-neon-cyan">
                    <a.icon className="h-3.5 w-3.5" />
                    {a.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-black/5 p-4">
            <div className="flex items-center gap-2 rounded-xl bg-surface-1/60 px-3 py-2">
              <input
                placeholder="Ask the AI about this RFP…"
                className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
              />
              <button className="grid h-7 w-7 place-items-center rounded-md bg-neon-blue/20 text-neon-cyan neon-border-blue">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <button className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-black/5 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
              <Download className="h-3 w-3" /> Export Report
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Meta({ icon: Icon, label, value, accent = "neon-cyan" }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-lg bg-surface-1/60 p-2.5">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className={`mt-1 text-[12px] font-medium text-${accent}`}>{value}</div>
    </div>
  );
}
