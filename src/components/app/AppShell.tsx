import { Link } from "@tanstack/react-router";
import { Activity, AudioWaveform, PhoneCall, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "./Logo";

const nav = [
  { to: "/", label: "Overview", icon: Activity },
  { to: "/analyze", label: "Analyze call", icon: AudioWaveform },
  { to: "/lookup", label: "Number lookup", icon: PhoneCall },
] as const;

const linkBase =
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
const linkActive = "bg-sidebar-accent text-sidebar-accent-foreground ring-1 ring-primary/40";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-[232px_1fr]">
      <aside className="hidden border-r border-sidebar-border bg-sidebar md:flex md:min-h-screen md:flex-col md:sticky md:top-0 md:h-screen">
        <div className="px-5 pt-6 pb-8">
          <Link to="/" aria-label="pulmoforge home">
            <Logo />
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-3" aria-label="Main">
          <span className="text-eyebrow px-3 pb-2">Workspace</span>
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkBase}
              activeProps={{ className: linkActive }}
              activeOptions={{ exact: item.to === "/" }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto m-3 rounded-lg border border-sidebar-border bg-surface p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="h-2 w-2 animate-pulse-dot rounded-full bg-risk-low" />
            Screening live
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Voice & transcript models active across 3 contact centers.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-risk-low" /> Fraud Ops · Tier 2
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-border bg-sidebar px-4 py-3 md:hidden">
          <Link to="/">
            <Logo />
          </Link>
        </header>
        <nav
          className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar px-2 py-2 md:hidden"
          aria-label="Main mobile"
        >
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkBase + " whitespace-nowrap"}
              activeProps={{ className: linkActive }}
              activeOptions={{ exact: item.to === "/" }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="bg-grid flex-1">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border px-5 py-7 md:flex-row md:items-end md:justify-between md:px-10">
      <div>
        <div className="text-eyebrow">{eyebrow}</div>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions}
    </div>
  );
}
