import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, FileText, Download, Send, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/decision")({
  head: () => ({ meta: [{ title: "Final Decision Room — BidPilot AI" }] }),
  component: DecisionPage,
});

function DecisionPage() {
  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Mission Briefing</span>
        <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Final Decision Room</h1>
        <p className="mt-1 text-sm text-muted-foreground">All intelligence consolidated. Make the call.</p>
      </header>

      {/* Verdict + scores */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px_320px]">
        <div className="glass-strong relative overflow-hidden rounded-2xl p-8 neon-border-green">
          <div className="absolute inset-x-0 top-0 scan-line" />
          <div className="flex flex-col items-center text-center">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan">AI Recommendation</div>
            <div className="mt-3 grid h-32 w-32 place-items-center rounded-full bg-neon-green/15 neon-border-green">
              <CheckCircle2 className="h-14 w-14 text-neon-green" />
            </div>
            <div className="mt-4 font-display text-6xl font-bold text-neon-green text-glow-green">GO</div>
            <p className="mt-3 max-w-md text-[13px] text-muted-foreground">
              Bid recommended with conditions. Resolve 2 financial documentation gaps before submission.
            </p>
          </div>
        </div>

        <Stat label="Win Probability" value="76%" color="neon-blue" />
        <Stat label="Compliance Score" value="78%" color="neon-green" />
      </div>

      {/* Strengths / Risks */}
      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Main Strengths" icon={ShieldCheck} color="neon-green" items={[
          "Federal Tax Authority ERP — 2024",
          "Citizen Identity Wallet pilot — 2025",
          "ISO 27001 certified delivery",
          "PMP-certified Project Manager available",
        ]} />
        <Panel title="Main Risks" icon={AlertTriangle} color="neon-amber" items={[
          "Only 2 of 3 similar projects",
          "Data residency cert pending",
          "Tight 6-week proposal timeline",
        ]} />
        <Panel title="Missing Documents" icon={FileText} color="neon-red" items={[
          "Audited financial statements (FY22, FY23)",
          "Signed CVs — Project Manager",
          "Signed CVs — Tech Lead",
        ]} />
      </div>

      {/* Next steps */}
      <div className="glass-strong rounded-2xl p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-neon-cyan" />
          <h2 className="font-display text-sm font-semibold">Recommended Next Steps</h2>
        </div>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Upload missing audited financial statements (FY22, FY23).",
            "Refresh signatures on team CVs and re-upload to vault.",
            "Confirm in-country data residency hosting region.",
            "Schedule internal review with bid steering committee.",
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl bg-surface-1/60 p-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-neon-blue/15 font-mono text-[11px] text-neon-cyan neon-border-blue">{i + 1}</span>
              <span className="text-[13px]">{s}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="glass-strong sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Pending approval · 3 signatories
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg glass px-4 py-2 text-sm font-medium hover:border-neon-cyan/40">
            <Download className="mr-1.5 inline h-3.5 w-3.5" /> Compliance Report
          </button>
          <button className="rounded-lg glass px-4 py-2 text-sm font-medium hover:border-neon-cyan/40">
            <Download className="mr-1.5 inline h-3.5 w-3.5" /> Proposal DOCX
          </button>
          <button className="rounded-lg bg-neon-amber/20 px-4 py-2 text-sm font-medium text-neon-amber neon-border-amber">
            <Send className="mr-1.5 inline h-3.5 w-3.5" /> Send for Review
          </button>
          <button className="rounded-lg bg-gradient-to-r from-neon-green to-neon-cyan px-5 py-2 text-sm font-semibold text-background shadow-[0_0_24px_oklch(0.78_0.20_155/0.4)]">
            <CheckCircle2 className="mr-1.5 inline h-3.5 w-3.5" /> Approve Bid
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className={`glass-strong rounded-2xl p-6 neon-border-${color === "neon-cyan" ? "blue" : color.replace("neon-", "")}`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
      <div className={`mt-3 font-display text-5xl font-bold text-${color}`}>{value}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
        <div className={`h-full bg-${color}`} style={{ width: value }} />
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, color, items }: { title: string; icon: any; color: string; items: string[] }) {
  return (
    <div className={`glass-strong rounded-2xl p-5 neon-border-${color === "neon-cyan" ? "blue" : color.replace("neon-", "")}`}>
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 text-${color}`} />
        <h3 className="font-display text-sm font-semibold">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map(i => (
          <li key={i} className="flex items-start gap-2 text-[12.5px]">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-${color}`} />
            <span>{i}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
