import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Network } from "lucide-react";
import { matches, requirements, capabilities } from "@/lib/mock-data";

export const Route = createFileRoute("/match")({
  head: () => ({ meta: [{ title: "Capability Match Engine — BidPilot AI" }] }),
  component: MatchPage,
});

function statusColor(status: string) {
  if (status === "Strong Match") return "neon-green";
  if (status === "Partial Match") return "neon-amber";
  return "neon-red";
}

function MatchPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-blue/15 neon-border-blue">
          <Network className="h-5 w-5 text-neon-cyan" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-03</span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Capability Match Engine</h1>
          <p className="text-sm text-muted-foreground">Each RFP requirement linked to the strongest evidence in your vault.</p>
        </div>
      </header>

      <div className="glass-strong space-y-2 rounded-2xl p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-2 pb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          <div>RFP Requirement</div>
          <div className="text-center text-neon-cyan">Match</div>
          <div className="text-right">Company Evidence</div>
        </div>

        {matches.map((m, i) => {
          const req = requirements.find(r => r.id === m.reqId)!;
          const cap = capabilities.find(c => c.id === m.capId);
          const color = statusColor(m.status);
          return (
            <div key={i} className={`grid grid-cols-1 items-center gap-3 rounded-xl bg-surface-1/60 p-3 md:grid-cols-[1fr_auto_1fr] neon-border-${color}`}>
              {/* Left: requirement */}
              <div className="rounded-lg bg-background/40 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{req.id} · {req.category}</div>
                <div className="mt-1 text-[13px] leading-snug">{req.text}</div>
              </div>

              {/* Center: connector */}
              <div className="flex flex-col items-center gap-1">
                <div className={`flex items-center gap-2 rounded-full bg-${color}/15 px-3 py-1.5 text-${color}`}>
                  <span className="font-mono text-[11px] font-semibold">{m.pct}%</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <div className={`font-mono text-[9px] uppercase tracking-wider text-${color}`}>{m.status}</div>
              </div>

              {/* Right: evidence */}
              <div className="rounded-lg bg-background/40 p-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {cap ? `${cap.id} · ${cap.domain}` : "No matching evidence"}
                </div>
                <div className="mt-1 text-[13px] leading-snug">{m.evidence}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
