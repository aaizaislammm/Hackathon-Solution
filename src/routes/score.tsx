import { createFileRoute, Link } from "@tanstack/react-router";
import { Brain, ArrowRight, XCircle } from "lucide-react";
import { useAnalysisStore } from "@/lib/analysis-store";

export const Route = createFileRoute("/score")({
  head: () => ({ meta: [{ title: "Win Probability Brain — BidPilot AI" }] }),
  component: ScorePage,
});

function ScorePage() {
  const { status, result } = useAnalysisStore();
  const isComplete = status === "complete" && result !== null;

  if (!isComplete) {
    return (
      <div className="space-y-6">
        <header className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-violet/15 neon-border-blue">
            <Brain className="h-5 w-5 text-neon-violet" />
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-06</span>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Win Probability Brain</h1>
          </div>
        </header>
        <div className="glass-strong flex min-h-[400px] flex-col items-center justify-center rounded-2xl p-10 text-center">
          <Brain className="h-12 w-12 text-neon-violet/40" />
          <p className="mt-4 text-sm text-muted-foreground">No analysis data available yet.</p>
          <Link to="/workspace" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-semibold text-background">
            Go to Workspace <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  const { score, decisionLabel, decisionColor, factors, riskLevel, recommendations } = result.winProbability;
  const circ = 2 * Math.PI * 110;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-neon-violet/15 neon-border-blue">
          <Brain className="h-5 w-5 text-neon-violet" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Module · MOD-06</span>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Win Probability Brain</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Big ring */}
        <div className="glass-strong relative overflow-hidden rounded-2xl p-8">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-neon-blue/15 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-neon-violet/15 blur-3xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-[280px_1fr]">
            {/* Ring */}
            <div className="relative mx-auto h-64 w-64">
              <svg viewBox="0 0 240 240" className="h-full w-full -rotate-90">
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="oklch(0.70 0.20 245)" />
                    <stop offset="50%" stopColor="oklch(0.82 0.16 200)" />
                    <stop offset="100%" stopColor="oklch(0.78 0.20 155)" />
                  </linearGradient>
                </defs>
                <circle cx="120" cy="120" r="110" stroke="currentColor" strokeWidth="10" fill="none" className="text-black/5" />
                <circle cx="120" cy="120" r="110" stroke="url(#ringGrad)" strokeWidth="12" fill="none"
                  strokeDasharray={circ} strokeDashoffset={circ - (circ * score) / 100} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon-cyan">Win Probability</div>
                  <div className="mt-1 font-display text-6xl font-bold shimmer-text">{score}%</div>
                  <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full bg-${decisionColor}/15 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-${decisionColor} neon-border-${decisionColor.replace('neon-', '')}`}>
                    Decision: {decisionLabel}
                  </div>
                </div>
              </div>
              {/* Orbits */}
              {factors.map((_, i) => (
                <span key={i} className="pointer-events-none absolute inset-0 rounded-full border border-black/5"
                  style={{ transform: `scale(${1.1 + i * 0.08})` }} />
              ))}
            </div>

            {/* Explanation */}
            <div>
              <h2 className="font-display text-lg font-semibold">AI Verdict</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-foreground/85">
                <span className={`font-semibold text-${decisionColor}`}>{decisionLabel}:</span>
                {" "}Based on a multi-factor analysis, this bid has a win probability of {score}%.
                {" "}Our sector analysis shows historical alignment, and vector matching found
                {" "}{result.complianceScore.matched} strong capability matches out of {result.complianceScore.total - result.complianceScore.info} scorable requirements.
              </p>

              {recommendations.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-cyan" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/decision" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-neon-blue to-neon-violet px-4 py-2 text-sm font-semibold text-background">
                  Go to Decision Room <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/compliance" className="rounded-lg glass px-4 py-2 text-sm font-medium">Review Gaps</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Factors */}
        <div className="glass-strong rounded-2xl p-5">
          <h2 className="font-display text-sm font-semibold">Scoring Factors</h2>
          <div className="mt-4 space-y-4">
            {factors.map(f => (
              <div key={f.label}>
                <div className="mb-1 flex items-center justify-between text-[12px]">
                  <span>{f.label} <span className="text-[10px] text-muted-foreground ml-1">({f.weight}%)</span></span>
                  <span className={`font-mono text-${f.color}`}>{f.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-black/5">
                  <div className={`h-full rounded-full bg-${f.color}`} style={{ width: `${f.value}%`, boxShadow: `0 0 12px currentColor` }} />
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground">{f.description}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-surface-1/60 p-3">
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Risk Level</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`font-display text-2xl font-bold ${
                riskLevel === "Critical" || riskLevel === "High" ? "text-neon-red" :
                riskLevel === "Medium" ? "text-neon-amber" : "text-neon-green"
              }`}>{riskLevel}</span>
              <span className="text-[11px] text-muted-foreground">
                — {result.complianceScore.gaps} high-risk gaps detected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
