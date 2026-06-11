import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ShieldCheck, ShieldAlert, Map, ArrowRight } from "lucide-react";
import { useAnalysisStore } from "@/lib/analysis-store";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance Risk Map — BidPilot AI" }] }),
  component: CompliancePage,
});

function CompliancePage() {
  const { status, result } = useAnalysisStore();
  const isComplete = status === "complete" && result !== null;

  // Derive compliance data from analysis result
  const requirements = isComplete ? result.requirements : [];
  const compliance = isComplete ? result.compliance : [];
  const complianceScore = isComplete ? result.complianceScore : { total: 0, matched: 0, partial: 0, gaps: 0, info: 0, score: 0 };

  const total = complianceScore.total;
  const passed = complianceScore.matched;
  const warn = complianceScore.partial + complianceScore.info;
  const failed = complianceScore.gaps;
  const score = complianceScore.score;

  // Build gap cards from real data
  const gapItems = compliance
    .filter((c) => c.status === "gap" || c.status === "partial")
    .map((c) => {
      const req = requirements.find((r) => r.id === c.requirementId);
      return {
        title: req?.text || "Unknown requirement",
        severity: c.status === "gap" ? "High" : "Medium",
        note: c.evidence,
        reqId: c.requirementId,
        similarity: c.similarity,
      };
    })
    .slice(0, 6);

  // Build heatmap data
  const heatmapItems = compliance.map((c) => {
    const req = requirements.find((r) => r.id === c.requirementId);
    return {
      id: c.requirementId,
      status: c.status as "matched" | "partial" | "gap" | "info",
      text: req?.text || "",
      similarity: c.similarity,
    };
  });

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-amber/15 neon-border-amber">
            <Map className="h-5 w-5 text-neon-amber" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-04</span>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Compliance Risk Map</h1>
          </div>
        </header>
        <div className="glass-strong flex min-h-[400px] flex-col items-center justify-center rounded-2xl p-10 text-center">
          <Map className="h-12 w-12 text-neon-amber/40" />
          <p className="mt-4 text-sm text-muted-foreground">No analysis data available yet.</p>
          <Link to="/workspace" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-semibold text-background">
            Go to Workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-amber/15 neon-border-amber">
          <Map className="h-5 w-5 text-neon-amber" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-04</span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Compliance Risk Map</h1>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Requirements" value={total} color="neon-cyan" />
        <Stat label="Passed" value={passed} color="neon-green" icon={ShieldCheck} />
        <Stat label="Warning" value={warn} color="neon-amber" icon={AlertTriangle} />
        <Stat label="Failed" value={failed} color="neon-red" icon={ShieldAlert} />
        <Stat label="Compliance Score" value={`${score}%`} color="neon-blue" big />
      </div>

      {/* Heatmap */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold">Risk Heatmap</h2>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <Legend color="neon-green" label="Pass" />
            <Legend color="neon-amber" label="Warning" />
            <Legend color="neon-red" label="Fail" />
            <Legend color="neon-blue" label="Info" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {heatmapItems.map(r => {
            const c = r.status === "matched" ? "neon-green"
              : r.status === "partial" ? "neon-amber"
              : r.status === "gap" ? "neon-red" : "neon-blue";
            return (
              <div key={r.id} className={`group relative aspect-square cursor-pointer rounded-lg bg-${c}/20 border border-${c}/40 transition hover:scale-105`}>
                <div className="absolute inset-0 grid place-items-center font-mono text-[10px] font-semibold">{r.id}</div>
                <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md glass-strong px-2 py-1 text-[10px] opacity-0 transition group-hover:opacity-100">
                  {r.text.slice(0, 48)}{r.text.length > 48 ? "…" : ""} ({Math.round(r.similarity * 100)}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance table — interactive side-by-side */}
      <div className="glass-strong overflow-hidden rounded-2xl">
        <div className="border-b border-black/5 p-4">
          <h2 className="font-display text-sm font-semibold">Compliance Checklist</h2>
          <p className="text-[11px] text-muted-foreground">Every requirement side-by-side with its Pass/Fail mapping and matched evidence</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-black/5 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 min-w-[250px]">Requirement</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Similarity</th>
                <th className="px-4 py-3 min-w-[300px]">Matched Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {compliance.map((c) => {
                const req = requirements.find((r) => r.id === c.requirementId);
                const color = c.status === "matched" ? "neon-green"
                  : c.status === "partial" ? "neon-amber"
                  : c.status === "gap" ? "neon-red" : "neon-blue";
                const statusText = c.status === "matched" ? "Pass"
                  : c.status === "partial" ? "Partial"
                  : c.status === "gap" ? "Fail" : "Info";
                return (
                  <tr key={c.requirementId} className="hover:bg-black/5 transition">
                    <td className="px-4 py-3 font-mono text-[10px]">{c.requirementId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-surface-1 px-2 py-0.5 text-[10px]">{req?.category}</span>
                    </td>
                    <td className="px-4 py-3 leading-snug">{req?.text}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full bg-${color}/15 px-2 py-0.5 font-mono text-[10px] uppercase text-${color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full bg-${color}`} />
                        {statusText}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px]">{Math.round(c.similarity * 100)}%</td>
                    <td className="px-4 py-3 text-muted-foreground leading-snug">{c.evidence}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gap cards */}
      {gapItems.length > 0 && (
        <div>
          <h2 className="mb-3 font-display text-sm font-semibold">Top Risk Gaps</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {gapItems.map((g, i) => {
              const color = g.severity === "High" ? "neon-red" : "neon-amber";
              return (
                <div key={i} className={`glass-strong rounded-2xl p-4 neon-border-${color}`}>
                  <div className="flex items-center justify-between">
                    <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-${color}`}>
                      <AlertTriangle className="h-3 w-3" /> {g.severity} Risk
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{g.reqId}</span>
                  </div>
                  <h3 className="mt-2 font-display text-[15px] font-semibold">{g.title}</h3>
                  <p className="mt-1 text-[12.5px] text-muted-foreground">{g.note}</p>
                  <div className="mt-2 font-mono text-[10px] text-muted-foreground">
                    Vector similarity: {Math.round(g.similarity * 100)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color, icon: Icon, big }: { label: string; value: number | string; color: string; icon?: React.ComponentType<{ className?: string }>; big?: boolean }) {
  return (
    <div className={`glass-strong rounded-2xl p-4 neon-border-${color === "neon-cyan" ? "blue" : color.replace("neon-", "")}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        {Icon && <Icon className={`h-4 w-4 text-${color}`} />}
      </div>
      <div className={`mt-2 font-display font-bold text-${color} ${big ? "text-3xl" : "text-2xl"}`}>{value}</div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2.5 w-2.5 rounded-sm bg-${color}/60 border border-${color}`} />
      {label}
    </span>
  );
}
