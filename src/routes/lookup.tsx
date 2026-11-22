import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Ban, Flag, Search, ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { ScreenHeader } from "@/components/app/MobileShell";
import { RiskGauge } from "@/components/app/RiskGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reputationList, type NumberReport } from "@/lib/demo-data";
import { useBlocked, useReported } from "@/lib/local-store";
import { formatPhone, normalizePhone, riskLevel } from "@/lib/risk";

export const Route = createFileRoute("/lookup")({
  validateSearch: (search: Record<string, unknown>): { n?: string } =>
    typeof search["n"] === "string" ? { n: search["n"] } : {},
  head: () => ({
    meta: [
      { title: "Who called me? Number lookup — pulmoforge" },
      {
        name: "description",
        content: "Look up any phone number to see if it's a scam, spam or a verified business.",
      },
      { property: "og:title", content: "Who called me? Number lookup — pulmoforge" },
      {
        property: "og:description",
        content: "Trust score and community scam reports for any phone number.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LookupPage,
});

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
      <ScreenHeader title="Lookup" subtitle="Who's calling? Check any number" />
      <form onSubmit={submit} className="flex gap-2 px-4 pt-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="(312) 555-0187"
            aria-label="Phone number"
            inputMode="tel"
            className="h-12 rounded-full bg-card pl-10 font-mono text-base"
          />
        </div>
        <Button type="submit" className="h-12 rounded-full px-5" disabled={!query.trim()}>
          Check
        </Button>
      </form>

      <div className="mt-4 px-4">
        {n ? result ? <ReportCard report={result} /> : <NoReports number={normalized || n} /> : null}
      </div>

      <section className="mt-6">
        <h2 className="text-eyebrow px-5 pb-1">Trending scam numbers</h2>
        <ul>
          {reputationList
            .filter((r) => r.trust < 50)
            .map((r) => (
              <li key={r.number}>
                <button
                  type="button"
                  onClick={() => void navigate({ search: { n: r.number } })}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-accent/50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm">{formatPhone(r.number)}</div>
                    <div className="truncate text-xs text-muted-foreground">{r.category}</div>
                  </div>
                  <span className="text-xs text-muted-foreground tabular">
                    {r.reports.toLocaleString("en-US")} reports
                  </span>
                  <Badge variant={riskLevel(100 - r.trust)}>{100 - r.trust}</Badge>
                </button>
              </li>
            ))}
        </ul>
      </section>
    </div>
  );
}

function NoReports({ number }: { number: string }) {
  const reported = useReported();
  const isReported = reported.has(number);
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Badge variant="secondary">No reports</Badge>
        <span className="font-mono text-sm">{formatPhone(number)}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Nobody has reported this number yet. That doesn't guarantee it's safe — scammers can fake
        caller ID, so never share codes or payment details with a caller.
      </p>
      <Button
        variant="secondary"
        className="mt-4 h-11 w-full rounded-full"
        onClick={() => {
          reported.toggle(number);
          toast(isReported ? "Report removed" : "Thanks — your report helps protect others");
        }}
      >
        <Flag /> {isReported ? "Reported" : "Report as scam"}
      </Button>
    </div>
  );
}

function ReportCard({ report }: { report: NumberReport }) {
  const fraudRisk = 100 - report.trust;
  const safe = riskLevel(fraudRisk) === "low";
  const blocked = useBlocked();
  const isBlocked = blocked.has(report.number);

  return (
    <div className={(safe ? "bg-safe" : "bg-alert") + " rounded-3xl border border-border p-5"}>
      <div className="flex items-center gap-2">
        {safe ? (
          <ShieldCheck className="h-5 w-5 text-risk-low" />
        ) : (
          <ShieldX className="h-5 w-5 text-risk-high" />
        )}
        <span className="font-mono text-lg">{formatPhone(report.number)}</span>
      </div>
      <div className="mt-1 text-sm text-foreground/80">{report.category}</div>
      <div className="mt-4 flex items-center gap-4">
        <RiskGauge score={fraudRisk} size={130} />
        <dl className="space-y-1.5 text-sm">
          <div>
            <dt className="text-eyebrow">Reports</dt>
            <dd>{report.reports.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt className="text-eyebrow">Line</dt>
            <dd>
              {report.lineType} · {report.region}
            </dd>
          </div>
        </dl>
      </div>
      <ul className="mt-4 space-y-1.5 text-sm">
        {report.notes.map((note) => (
          <li key={note} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            {note}
          </li>
        ))}
      </ul>
      {!safe ? (
        <Button
          variant={isBlocked ? "secondary" : "destructive"}
          className="mt-5 h-11 w-full rounded-full"
          onClick={() => {
            blocked.toggle(report.number);
            toast(isBlocked ? "Number unblocked" : "Number blocked");
          }}
        >
          <Ban /> {isBlocked ? "Unblock number" : "Block this number"}
        </Button>
      ) : null}
    </div>
  );
}
