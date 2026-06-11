import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, Radar as RadarIcon } from "lucide-react";
import { requirements, type ReqCategory } from "@/lib/mock-data";

export const Route = createFileRoute("/analysis")({
  head: () => ({ meta: [{ title: "Requirement Radar — BidPilot AI" }] }),
  component: AnalysisPage,
});

const categories: ReqCategory[] = ["Mandatory", "Technical", "Financial", "Legal", "Submission"];
const catColor: Record<ReqCategory, string> = {
  Mandatory: "neon-red",
  Technical: "neon-blue",
  Financial: "neon-green",
  Legal: "neon-violet",
  Submission: "neon-amber",
};

function AnalysisPage() {
  const [open, setOpen] = useState<string | null>("R-01");

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-02</span>
        <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Requirement Radar</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Live sweep of every clause extracted from the active RFP, grouped by intent and weighted by AI confidence.</p>
      </header>

      {/* Radar rings */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {categories.map(cat => {
          const items = requirements.filter(r => r.category === cat);
          const matched = items.filter(r => r.status === "matched").length;
          const pct = Math.round((matched / items.length) * 100);
          const circ = 2 * Math.PI * 36;
          return (
            <div key={cat} className={`glass-strong relative overflow-hidden rounded-2xl p-5 neon-border-${catColor[cat]}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{cat}</span>
                <RadarIcon className={`h-4 w-4 text-${catColor[cat]}`} />
              </div>
              <div className="mt-4 grid place-items-center">
                <div className="relative h-24 w-24">
                  <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none" className="text-white/5" />
                    <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="none"
                      strokeDasharray={circ} strokeDashoffset={circ - (circ * pct) / 100}
                      strokeLinecap="round" className={`text-${catColor[cat]}`} />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className={`font-display text-xl font-bold text-${catColor[cat]}`}>{pct}%</div>
                      <div className="font-mono text-[9px] text-muted-foreground">{matched}/{items.length}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center text-[11px] text-muted-foreground">Coverage score</div>
            </div>
          );
        })}
      </div>

      {/* Detailed list */}
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="border-b border-white/5 p-4">
          <h2 className="font-display text-sm font-semibold">Requirement Ledger</h2>
        </div>
        <div className="divide-y divide-white/5">
          {requirements.map(r => {
            const isOpen = open === r.id;
            return (
              <div key={r.id}>
                <button
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                >
                  <span className={`rounded-md bg-${catColor[r.category]}/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-${catColor[r.category]}`}>{r.id}</span>
                  <span className="truncate text-[13px]">{r.text}</span>
                  <span className="flex items-center gap-3">
                    <span className="hidden font-mono text-[10px] text-muted-foreground sm:inline">conf {Math.round(r.confidence * 100)}%</span>
                    <span className="rounded-full bg-surface-1 px-2 py-0.5 text-[10px]">{r.priority}</span>
                    <ChevronDown className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {isOpen && (
                  <div className="grid gap-3 bg-surface-1/50 px-4 py-4 sm:grid-cols-3">
                    <Cell label="Category" value={r.category} />
                    <Cell label="Status" value={r.status} />
                    <Cell label="AI Confidence" value={`${Math.round(r.confidence * 100)}%`} />
                    <div className="sm:col-span-3 text-[12.5px] text-muted-foreground">
                      <span className="text-foreground">AI Note:</span> Extracted from §4.{Number(r.id.slice(2)) % 9 + 1} with high confidence. Cross-referenced against capability vault and matched evidence indexed under <code className="font-mono text-neon-cyan">CAP-{r.id.slice(2)}</code>.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-background/40 p-2.5">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-[13px] capitalize">{value}</div>
    </div>
  );
}
