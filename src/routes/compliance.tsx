import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ShieldCheck, ShieldAlert, Map } from "lucide-react";
import { requirements } from "@/lib/mock-data";

export const Route = createFileRoute("/compliance")({
  head: () => ({ meta: [{ title: "Compliance Risk Map — BidPilot AI" }] }),
  component: CompliancePage,
});

const gaps = [
  { title: "Missing audited financial statements", severity: "High", note: "Last 3 years required; only FY2024 on file." },
  { title: "Only 2 similar projects found, 3 required", severity: "Medium", note: "Add Smart City IoT case study to satisfy threshold." },
  { title: "CVs need verification", severity: "Medium", note: "Refresh signatures on Project Manager & Tech Lead CVs." },
  { title: "Budget format unclear", severity: "Low", note: "Confirm USD pricing with VAT itemization for §6.3." },
];

function CompliancePage() {
  const total = requirements.length;
  const passed = requirements.filter(r => r.status === "matched").length;
  const warn = requirements.filter(r => r.status === "partial" || r.status === "info").length;
  const failed = requirements.filter(r => r.status === "gap").length;
  const score = Math.round((passed / total) * 100);

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
          {requirements.map(r => {
            const c = r.status === "matched" ? "neon-green"
              : r.status === "partial" ? "neon-amber"
              : r.status === "gap" ? "neon-red" : "neon-blue";
            return (
              <div key={r.id} className={`group relative aspect-square cursor-pointer rounded-lg bg-${c}/20 border border-${c}/40 transition hover:scale-105`}>
                <div className="absolute inset-0 grid place-items-center font-mono text-[10px] font-semibold">{r.id}</div>
                <div className="pointer-events-none absolute -top-2 left-1/2 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-md glass-strong px-2 py-1 text-[10px] opacity-0 transition group-hover:opacity-100">
                  {r.text.slice(0, 48)}…
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap cards */}
      <div>
        <h2 className="mb-3 font-display text-sm font-semibold">Top Risk Gaps</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {gaps.map((g, i) => {
            const color = g.severity === "High" ? "neon-red" : g.severity === "Medium" ? "neon-amber" : "neon-blue";
            return (
              <div key={i} className={`glass-strong rounded-2xl p-4 neon-border-${color}`}>
                <div className="flex items-center justify-between">
                  <span className={`flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-${color}`}>
                    <AlertTriangle className="h-3 w-3" /> {g.severity} Risk
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">GAP-{(i + 1).toString().padStart(2, "0")}</span>
                </div>
                <h3 className="mt-2 font-display text-[15px] font-semibold">{g.title}</h3>
                <p className="mt-1 text-[12.5px] text-muted-foreground">{g.note}</p>
                <div className="mt-3 flex gap-2">
                  <button className={`rounded-md bg-${color}/15 px-3 py-1.5 text-[11px] font-medium text-${color}`}>Resolve</button>
                  <button className="rounded-md bg-surface-1 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">Snooze</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color, icon: Icon, big }: { label: string; value: number | string; color: string; icon?: any; big?: boolean }) {
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
