import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Calendar, Flag, Radio, Search, ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { PageHeader } from "@/components/app/AppShell";
import { RiskGauge } from "@/components/app/RiskGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reputationList, type NumberReport } from "@/lib/demo-data";
import { normalizePhone, riskLevel } from "@/lib/risk";

export const Route = createFileRoute("/lookup")({
  validateSearch: (search: Record<string, unknown>): { n?: string } =>
    typeof search["n"] === "string" ? { n: search["n"] } : {},
  head: () => ({
    meta: [
      { title: "Number lookup — pulmoforge" },
      {
        name: "description",
        content: "Check a caller's phone number against pulmoforge's fraud reputation list.",
      },
      { property: "og:title", content: "Number lookup — pulmoforge" },
      {
        property: "og:description",
        content: "Trust score, fraud reports and line details for any caller number.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LookupPage,
});

function formatNumber(e164: string) {
  const d = e164.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  return e164;
}

function LookupPage() {
  const { n } = Route.useSearch();
  const navigate = useNavigate({ from: "/lookup" });
  const [query, setQuery] = useState(n ?? "");

  useEffect(() => {
    setQuery(n ?? "");
  }, [n]);

  const normalized = n ? normalizePhone(n) : "";
  const result = normalized ? reputationList.find((r) => r.number === normalized) : undefined;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = query.trim();
    void navigate({ search: value ? { n: value } : {} });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Caller reputation"
        title="Number lookup"
        description="Check a caller ID against reports from fraud teams across the network before you act on the call."
      />
      <div className="space-y-6 px-5 py-8 md:px-10">
        <form onSubmit={submit} className="flex max-w-2xl gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="+1 (312) 555-0187"
              aria-label="Phone number"
              inputMode="tel"
              className="h-11 bg-card pl-9 font-mono"
            />
          </div>
          <Button type="submit" size="lg" className="h-11" disabled={!query.trim()}>
            Check number
          </Button>
        </form>

        {n ? (
          result ? (
            <ReportCard report={result} />
          ) : (
            <div className="max-w-2xl rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">No reports</Badge>
                <span className="font-mono text-sm">{normalized || n}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                This number has no fraud reports on file. That isn't proof the caller is safe —
                caller ID can be spoofed, so still verify identity through your standard checks.
              </p>
            </div>
          )
        ) : null}

        <section className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-5 py-4">
            <h2 className="text-lg font-semibold">Recently reported numbers</h2>
          </div>
          <ul>
            {reputationList.map((r) => {
              const level = riskLevel(100 - r.trust);
              return (
                <li key={r.number} className="border-t border-border first:border-t-0">
                  <button
                    type="button"
                    onClick={() => void navigate({ search: { n: r.number } })}
                    className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-accent/40"
                  >
                    <span className="w-44 shrink-0 font-mono text-sm tabular">{formatNumber(r.number)}</span>
                    <span className="hidden flex-1 text-sm text-muted-foreground sm:block">{r.category}</span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground tabular">
                      {r.reports} reports
                    </span>
                    <Badge variant={level}>Trust {r.trust}</Badge>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
        <p className="text-xs text-muted-foreground">
          Reputation entries are sample data until a number intelligence source is connected.
        </p>
      </div>
    </div>
  );
}

function ReportCard({ report }: { report: NumberReport }) {
  const fraudRisk = 100 - report.trust;
  const level = riskLevel(fraudRisk);
  const safe = level === "low";
  const facts = [
    { icon: Radio, label: "Line type", value: `${report.lineType} · ${report.carrier}` },
    { icon: Flag, label: "Fraud reports", value: report.reports.toString() },
    { icon: Calendar, label: "First seen", value: report.firstSeen },
    { icon: Calendar, label: "Last seen", value: report.lastSeen },
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-6">
        <RiskGauge score={fraudRisk} label="Fraud risk" />
        <div className="mt-3 text-sm text-muted-foreground">
          Trust score <span className="font-mono text-foreground">{report.trust}/100</span>
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-center gap-3">
          {safe ? (
            <ShieldCheck className="h-5 w-5 text-risk-low" />
          ) : (
            <ShieldX className="h-5 w-5 text-risk-high" />
          )}
          <span className="font-mono text-lg tabular">{formatNumber(report.number)}</span>
          <Badge variant={level}>{report.category}</Badge>
        </div>
        <div className="mt-1 text-sm text-muted-foreground">{report.region}</div>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label} className="rounded-md border border-border bg-surface p-3">
              <dt className="text-eyebrow flex items-center gap-1.5">
                <f.icon className="h-3 w-3" /> {f.label}
              </dt>
              <dd className="mt-1 text-sm">{f.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-5">
          <div className="text-eyebrow">Analyst notes</div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {report.notes.map((note) => (
              <li key={note} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
