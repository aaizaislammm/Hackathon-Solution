import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Network } from "lucide-react";
import { useAnalysisStore } from "@/lib/analysis-store";

export const Route = createFileRoute("/match")({
  head: () => ({ meta: [{ title: "Capability Match Engine — BidPilot AI" }] }),
  component: MatchPage,
});

function statusColor(status: string) {
  if (status === "matched") return "neon-green";
  if (status === "partial") return "neon-amber";
  if (status === "info") return "neon-blue";
  return "neon-red";
}

function MatchPage() {
  const { status, result } = useAnalysisStore();
  const isComplete = status === "complete" && result !== null;

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-blue/15 neon-border-blue">
            <Network className="h-5 w-5 text-neon-cyan" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-03</span>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Capability Match Engine</h1>
          </div>
        </header>
        <div className="glass-strong flex min-h-[400px] flex-col items-center justify-center rounded-2xl p-10 text-center">
          <Network className="h-12 w-12 text-neon-blue/40" />
          <p className="mt-4 text-sm text-muted-foreground">No analysis data available yet.</p>
          <Link to="/workspace" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-semibold text-background">
            Go to Workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const { requirements, compliance } = result;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-blue/15 neon-border-blue">
          <Network className="h-5 w-5 text-neon-cyan" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-03</span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Capability Match Engine</h1>
          <p className="text-sm text-muted-foreground">Each RFP requirement linked to the strongest evidence in your capability library via Vector Search.</p>
        </div>
      </header>

      <div className="glass-strong space-y-2 rounded-2xl p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-2 pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <div>RFP Requirement</div>
          <div className="text-center text-neon-cyan">Match</div>
          <div className="text-right">Company Evidence</div>
        </div>

        {compliance.map((c) => {
          const req = requirements.find(r => r.id === c.requirementId);
          if (!req) return null;

          const topCap = c.matchedCapabilities[0];
          const color = statusColor(c.status);
          const statusLabel = c.status === "matched" ? "Strong Match"
            : c.status === "partial" ? "Partial Match"
            : c.status === "gap" ? "No Match"
            : "Info Only";

          return (
            <div key={c.requirementId} className={`grid grid-cols-1 items-center gap-3 rounded-xl bg-surface-1/60 p-3 md:grid-cols-[1fr_auto_1fr] neon-border-${color.replace('neon-', '')}`}>
              {/* Left: requirement */}
              <div className="rounded-lg bg-background/40 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{req.id} · {req.category}</div>
                <div className="mt-1 text-[13px] leading-snug">{req.text}</div>
              </div>

              {/* Center: connector */}
              <div className="flex flex-col items-center gap-1">
                <div className={`flex items-center gap-2 rounded-full bg-${color}/15 px-3 py-1.5 text-${color}`}>
                  <span className="font-mono text-[11px] font-semibold">{Math.round(c.similarity * 100)}%</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <div className={`font-mono text-[9px] uppercase tracking-wider text-${color}`}>{statusLabel}</div>
              </div>

              {/* Right: evidence */}
              <div className="rounded-lg bg-background/40 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {topCap ? `${topCap.capId} · ${topCap.domain}` : "Manual evidence required"}
                </div>
                <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                  {topCap
                    ? `${topCap.projectSummary} (${topCap.clientType}, ${topCap.yearCompleted})`
                    : c.evidence}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
