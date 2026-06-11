import { Check, Circle, Loader2 } from "lucide-react";
import { missionSteps } from "@/lib/mock-data";

export function MissionTimeline({ active }: { active?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Mission Timeline</span>
          <span className="h-px w-12 bg-gradient-to-r from-neon-cyan/60 to-transparent" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">RFP-2026-0471</span>
      </div>
      <ol className="relative flex items-center gap-1 overflow-x-auto pb-1">
        {missionSteps.map((s, i) => {
          const isActive = active ? s.key === active : s.status === "active";
          const isDone = s.status === "complete";
          const colorBorder = isDone ? "neon-border-green" : isActive ? "neon-border-blue" : "border border-white/10";
          return (
            <li key={s.key} className="flex flex-1 items-center gap-2 min-w-[140px]">
              <div className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-1 ${colorBorder}`}>
                {isDone ? (
                  <Check className="h-4 w-4 text-neon-green" />
                ) : isActive ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neon-blue" />
                ) : (
                  <Circle className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-surface-2 font-mono text-[9px] text-muted-foreground">{i + 1}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className={`truncate text-[12px] font-medium ${isActive ? "text-foreground" : isDone ? "text-foreground/80" : "text-muted-foreground"}`}>
                  {s.label}
                </div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                  {isDone ? "Complete" : isActive ? "In Progress" : "Pending"}
                </div>
              </div>
              {i < missionSteps.length - 1 && (
                <div className={`h-px w-6 shrink-0 ${isDone ? "bg-neon-green/60" : "bg-white/10"}`} />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
