import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Vault, Search, Award, Building, DollarSign, Calendar } from "lucide-react";
import { fetchCapabilityLibrary } from "@/lib/api/rfp.functions";

export const Route = createFileRoute("/vault")({
  head: () => ({ meta: [{ title: "Capability Vault — BidPilot AI" }] }),
  component: VaultPage,
});

interface CapabilityRecord {
  capId: string;
  domain: string;
  projectSummary: string;
  certification: string;
  yearCompleted: number;
  contractValue: string;
  durationMonths: number;
  clientType: string;
}

function VaultPage() {
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");
  const [client, setClient] = useState("All");
  const [capabilities, setCapabilities] = useState<CapabilityRecord[]>([]);

  // Fetch capabilities on mount
  useEffect(() => {
    async function load() {
      try {
        const result = await fetchCapabilityLibrary();
        setCapabilities(result.capabilities);
      } catch (err) {
        console.error("Failed to load capabilities:", err);
      }
    }
    load();
  }, []);

  const domains = ["All", ...Array.from(new Set(capabilities.map(c => c.domain)))];
  const clients = ["All", ...Array.from(new Set(capabilities.map(c => c.clientType)))];

  const filtered = useMemo(() =>
    capabilities.filter(c =>
      (domain === "All" || c.domain === domain) &&
      (client === "All" || c.clientType === client) &&
      (q === "" || c.projectSummary.toLowerCase().includes(q.toLowerCase()))
    ), [q, domain, client, capabilities]
  );

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:flex-wrap sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-neon-violet/15 neon-border-blue">
            <Vault className="h-5 w-5 text-neon-violet" />
          </div>
          <div className="min-w-0">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-03</span>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Capability Vault</h1>
          </div>
        </div>
        <div className="rounded-full glass px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-neon-cyan">
          {filtered.length} of {capabilities.length} assets
        </div>
      </header>

      {/* Filters */}
      <div className="glass-strong rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-lg bg-surface-1/60 px-3 py-2 min-w-[240px]">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search projects, evidence, clients…" className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground" />
          </div>
          <Select label="Domain" value={domain} onChange={setDomain} options={domains as string[]} />
          <Select label="Client" value={client} onChange={setClient} options={clients as string[]} />
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map(c => (
          <div key={c.capId} className="glass-strong group relative overflow-hidden rounded-2xl p-5 transition hover:-translate-y-1">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-neon-violet/15 blur-2xl" />
            <div className="relative flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{c.capId}</span>
              <span className="rounded-full bg-neon-green/15 px-2.5 py-0.5 font-mono text-[10px] text-neon-green">Indexed</span>
            </div>
            <h2 className="relative mt-3 font-display text-base font-semibold leading-snug">{c.projectSummary}</h2>
            <div className="relative mt-2 text-[11.5px] text-muted-foreground">{c.domain}</div>

            <div className="relative mt-4 grid grid-cols-2 gap-2 text-[11px]">
              <Stat icon={Award} label="Certification" value={c.certification} />
              <Stat icon={Calendar} label="Year" value={String(c.yearCompleted)} />
              <Stat icon={DollarSign} label="Value" value={c.contractValue} />
              <Stat icon={Building} label="Client Type" value={c.clientType} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="col-span-full py-12 text-center text-muted-foreground">
              No matching capabilities found.
           </div>
        )}
      </div>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="flex items-center gap-2 rounded-lg bg-surface-1/60 px-3 py-2 text-[12px]">
      <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} className="bg-transparent text-[12px] outline-none">
        {options.map(o => <option key={o} value={o} className="bg-surface-1">{o}</option>)}
      </select>
    </label>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-surface-1/60 p-2">
      <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 text-[12px] font-medium">{value}</div>
    </div>
  );
}
