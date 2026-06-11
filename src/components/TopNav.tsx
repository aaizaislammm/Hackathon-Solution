import { Link } from "@tanstack/react-router";
import { Radar, Rocket, Vault, Workflow, FileText, Gauge, Settings, Plus, ShieldCheck } from "lucide-react";

const links = [
  { to: "/workspaces", label: "Workspaces", icon: Workflow },
  { to: "/vault", label: "Capability Vault", icon: Vault },
  { to: "/analysis", label: "AI Analysis", icon: Radar },
  { to: "/proposal", label: "Proposal Builder", icon: FileText },
  { to: "/score", label: "Win Score", icon: Gauge },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-strong border-b border-white/5">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-6">
          <Link to="/" className="group flex items-center gap-2.5">
            <div className="relative grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-neon-blue/30 to-neon-violet/30 neon-border-blue">
              <ShieldCheck className="h-4.5 w-4.5 text-neon-cyan" />
              <span className="absolute inset-0 rounded-lg pulse-ring border border-neon-blue/40" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-[15px] font-bold tracking-tight text-glow-cyan">BidPilot<span className="text-neon-cyan">.AI</span></span>
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">Mission Control</span>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {links.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group relative rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {({ isActive }) => (
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                    {isActive && (
                      <span className="absolute -bottom-px left-2 right-2 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent" />
                    )}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-neon-green/10 px-3 py-1 lg:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-green opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-green" />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-neon-green">AI Online</span>
            </div>
            <Link
              to="/workspace"
              className="group inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-[13px] font-semibold text-background shadow-[0_0_24px_oklch(0.70_0.20_245/0.4)] transition hover:shadow-[0_0_32px_oklch(0.70_0.20_245/0.6)]"
            >
              <Plus className="h-4 w-4" />
              New RFP Mission
              <Rocket className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
