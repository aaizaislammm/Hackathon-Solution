import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Upload, ScanSearch, Network, FileEdit, Gauge, CheckCircle2, ArrowRight, Sparkles, Brain, Map, Radar, Bot, Workflow } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BidPilot AI — Turn Tender Documents into Winning Proposals" },
      { name: "description", content: "Mission control for bid managers. AI extracts requirements, matches capabilities, drafts proposals, and recommends GO/NO-GO." },
    ],
  }),
  component: Landing,
});

const workflow = [
  { label: "Upload Document", icon: Upload },
  { label: "Extract Requirements", icon: ScanSearch },
  { label: "Match Capabilities", icon: Network },
  { label: "Build Proposal", icon: FileEdit },
  { label: "Score Opportunity", icon: Gauge },
  { label: "GO / NO-GO", icon: CheckCircle2 },
];

const hexFeatures = [
  { title: "AI Document Scanner", desc: "Parses RFPs, RFQs, tenders in seconds.", icon: ScanSearch, color: "neon-blue" },
  { title: "Requirement Radar", desc: "Sweeps every clause, categorizes intent.", icon: Radar, color: "neon-cyan" },
  { title: "Capability Match Engine", desc: "Links requirements to proven evidence.", icon: Network, color: "neon-green" },
  { title: "Compliance Risk Map", desc: "Heatmap of gaps before you submit.", icon: Map, color: "neon-amber" },
  { title: "Proposal Co-Pilot", desc: "Drafts winning narrative, section by section.", icon: Bot, color: "neon-violet" },
  { title: "Win Probability Brain", desc: "Quantifies your odds. Calls GO / NO-GO.", icon: Brain, color: "neon-red" },
];

function Landing() {
  return (
    <div className="space-y-24">
      {/* HERO */}
      <section className="relative pt-10">
        <div className="absolute inset-x-0 top-0 mx-auto h-[420px] max-w-4xl rounded-full bg-neon-blue/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan"
          >
            <Sparkles className="h-3 w-3" />
            Tender Intelligence · v4.2 · Mission Ready
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Turn Tender Documents into{" "}
            <span className="shimmer-text">Winning Proposals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base"
          >
            AI reads RFPs, finds compliance gaps, matches your company capabilities,
            drafts the response, and recommends <span className="text-neon-green">GO</span> or <span className="text-neon-red">NO-GO</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/workspace"
              className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-6 py-3 text-sm font-semibold text-background shadow-[0_0_40px_oklch(0.70_0.20_245/0.45)] transition hover:shadow-[0_0_56px_oklch(0.70_0.20_245/0.65)]"
            >
              Launch RFP Analysis
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
            <Link
              to="/decision"
              className="inline-flex items-center gap-2 rounded-lg glass px-6 py-3 text-sm font-medium text-foreground hover:border-neon-cyan/40"
            >
              View Demo Mission
            </Link>
          </motion.div>

          {/* Workflow strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-16"
          >
            <div className="glass-strong relative overflow-hidden rounded-2xl p-5">
              <div className="absolute inset-x-0 top-0 scan-line" />
              <div className="mb-3 flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Mission Flow</span>
                <span className="h-px flex-1 bg-gradient-to-r from-neon-cyan/40 to-transparent" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {workflow.map((w, i) => (
                  <div key={w.label} className="flex flex-col items-center gap-2 rounded-xl bg-surface-1/60 p-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-neon-blue/10 neon-border-blue">
                      <w.icon className="h-4 w-4 text-neon-cyan" />
                    </div>
                    <div className="text-center text-[11px] font-medium leading-tight">{w.label}</div>
                    <div className="font-mono text-[9px] text-muted-foreground">0{i + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* HEX FEATURES */}
      <section>
        <div className="mb-10 flex flex-col items-center text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Six AI Modules</span>
          <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Your bid command stack</h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">Each module talks to the others. One mission, one outcome — a defensible decision.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {hexFeatures.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative"
            >
              <div className="glass-strong relative overflow-hidden rounded-2xl p-6 transition hover:-translate-y-1">
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-${f.color}/20 blur-2xl transition group-hover:bg-${f.color}/30`} />
                <div className="relative flex items-center gap-3">
                  <div className={`hex-tile grid h-14 w-14 place-items-center bg-${f.color}/15`}>
                    <f.icon className={`h-5 w-5 text-${f.color}`} />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">MOD-{(i + 1).toString().padStart(2, "0")}</span>
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
                <div className="mt-5 flex items-center justify-between border-t border-black/5 pt-4">
                  <span className="font-mono text-[10px] uppercase text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1.5 text-[11px] text-neon-green">
                    <span className="h-1.5 w-1.5 rounded-full bg-neon-green shadow-[0_0_8px_currentColor]" />
                    Active
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* QUICK NAV TILES */}
      <section>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { to: "/workspace", label: "RFP Workspace", icon: Workflow, color: "neon-blue" },
            { to: "/compliance", label: "Compliance Map", icon: Map, color: "neon-amber" },
            { to: "/score", label: "Win Probability", icon: Brain, color: "neon-violet" },
          ].map((t) => (
            <Link key={t.to} to={t.to} className="glass group flex items-center justify-between rounded-2xl p-5 transition hover:-translate-y-0.5">
              <div className="flex items-center gap-3">
                <div className={`grid h-11 w-11 place-items-center rounded-lg bg-${t.color}/15`}>
                  <t.icon className={`h-5 w-5 text-${t.color}`} />
                </div>
                <span className="font-display text-base font-semibold">{t.label}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
