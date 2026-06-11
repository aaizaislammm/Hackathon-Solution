import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FileText, ArrowRight, Clock } from "lucide-react";
import { MissionTimeline } from "@/components/MissionTimeline";

export const Route = createFileRoute("/workspaces")({
  head: () => ({ meta: [{ title: "Workspaces — BidPilot AI" }] }),
  component: Workspaces,
});

const missions = [
  { id: "RFP-2026-0471", title: "National Citizen Services Platform", client: "Ministry of Digital Affairs", status: "In Progress", color: "neon-blue", value: "$2.4M" },
  { id: "RFP-2026-0388", title: "Cloud Modernization Program", client: "Central Bank", status: "Drafting", color: "neon-violet", value: "$5.1M" },
  { id: "RFP-2026-0312", title: "Hospital ERP Rollout", client: "Ministry of Health", status: "GO Recommended", color: "neon-green", value: "$1.8M" },
  { id: "RFQ-2026-0241", title: "Smart Traffic IoT Network", client: "City of Aurora", status: "NO-GO", color: "neon-red", value: "$3.2M" },
];

function Workspaces() {
  return (
    <div className="space-y-5">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Mission Index</span>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Active Workspaces</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every bid mission in flight — synced to AI Co-Pilot.</p>
        </div>
        <Link to="/workspace" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2.5 text-sm font-semibold text-background">
          <Plus className="h-4 w-4" /> New RFP Mission
        </Link>
      </header>

      <MissionTimeline active="compliance" />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {missions.map(m => (
          <Link key={m.id} to="/workspace" className="glass-strong group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1">
            <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-${m.color}/15 blur-3xl`} />
            <div className="relative flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{m.id}</span>
              <span className={`rounded-full bg-${m.color}/15 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-${m.color}`}>{m.status}</span>
            </div>
            <h2 className="relative mt-3 font-display text-lg font-semibold">{m.title}</h2>
            <p className="relative mt-1 text-sm text-muted-foreground">{m.client}</p>
            <div className="relative mt-4 flex items-center justify-between border-t border-black/5 pt-3 text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground"><FileText className="h-3.5 w-3.5" /> {m.value}</span>
              <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Updated 12m ago</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
