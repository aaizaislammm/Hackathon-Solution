import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon, Cpu, Bell, Shield, Users } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — BidPilot AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-cyan/15 neon-border-blue">
          <SettingsIcon className="h-5 w-5 text-neon-cyan" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Console</span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Mission Settings</h1>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          { icon: Cpu, title: "AI Engine", desc: "Model selection, temperature, citation policy." },
          { icon: Bell, title: "Notifications", desc: "Deadline alerts, compliance breach warnings." },
          { icon: Shield, title: "Security & Access", desc: "Role-based access, audit logs, SSO." },
          { icon: Users, title: "Team", desc: "Bid managers, reviewers, signatories." },
        ].map(s => (
          <div key={s.title} className="glass-strong rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-neon-blue/15 neon-border-blue">
                <s.icon className="h-4 w-4 text-neon-cyan" />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold">{s.title}</h2>
                <p className="text-[12.5px] text-muted-foreground">{s.desc}</p>
              </div>
            </div>
            {/* TODO: wire settings forms to backend */}
            <button className="mt-4 rounded-lg bg-surface-1 px-3 py-1.5 text-[12px] font-medium">Configure</button>
          </div>
        ))}
      </div>
    </div>
  );
}
