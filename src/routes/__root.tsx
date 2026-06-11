import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { TopNav } from "@/components/TopNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-10 text-center">
        <h1 className="font-display text-7xl font-bold text-glow-blue">404</h1>
        <h2 className="mt-3 text-lg font-semibold">Signal lost</h2>
        <p className="mt-2 text-sm text-muted-foreground">This mission coordinate doesn't exist.</p>
        <a href="/" className="mt-6 inline-flex rounded-md bg-neon-blue/20 px-4 py-2 text-sm font-medium text-neon-cyan neon-border-blue">Return to base</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-lg font-semibold">Mission anomaly detected</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try again.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-md bg-neon-blue/20 px-4 py-2 text-sm font-medium text-neon-cyan neon-border-blue">Retry</button>
          <a href="/" className="rounded-md border border-black/10 px-4 py-2 text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BidPilot AI — Tender Intelligence Command Center" },
      { name: "description", content: "AI reads RFPs, finds compliance gaps, matches capabilities, drafts responses, and recommends GO / NO-GO." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen">
        <div className="pointer-events-none fixed inset-0 grid-bg opacity-60" />
        <TopNav />
        <main className="relative mx-auto max-w-[1600px] px-4 pb-20 pt-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
