import { Link } from "@tanstack/react-router";
import { History, Home, ScanSearch, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/calls", label: "Recents", icon: History },
  { to: "/lookup", label: "Lookup", icon: ScanSearch },
  { to: "/check", label: "AI Check", icon: Sparkles },
] as const;

/** Phone-sized app frame with a bottom tab bar. Centered as a phone column on large screens. */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-sidebar md:bg-grid md:py-6">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-background md:min-h-[calc(100vh-3rem)] md:overflow-hidden md:rounded-[2rem] md:border md:border-border md:shadow-glow">
        <main className="flex-1 pb-24">{children}</main>
        <nav
          aria-label="Main"
          className="pb-safe fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-border bg-sidebar/95 backdrop-blur md:absolute"
        >
          <ul className="grid grid-cols-4">
            {tabs.map((t) => (
              <li key={t.to}>
                <Link
                  to={t.to}
                  activeOptions={{ exact: t.to === "/" }}
                  className="group flex flex-col items-center gap-1 pt-2.5 pb-1 text-[0.68rem] font-medium text-muted-foreground transition-colors"
                  activeProps={{ className: "text-primary" }}
                >
                  <span className="flex h-7 w-12 items-center justify-center rounded-full transition-colors group-data-[status=active]:bg-primary/15">
                    <t.icon className="h-5 w-5" />
                  </span>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

export function ScreenHeader({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 px-5 pt-5 pb-4 backdrop-blur">
      <div className="flex items-center gap-3">
        {left}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold">{title}</h1>
          {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
        </div>
        {right}
      </div>
    </header>
  );
}
