import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Ban, PhoneIncoming, ShieldAlert, ShieldCheck } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/app/AppShell";
import { Waveform } from "@/components/app/Waveform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { hourlyTrend, kpis, recentCalls, threatMix } from "@/lib/demo-data";
import { riskLabel, riskLevel } from "@/lib/risk";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Risk overview — pulmoforge" },
      {
        name: "description",
        content: "Live view of screened calls, flagged voice fraud attempts and blocked losses.",
      },
      { property: "og:title", content: "Risk overview — pulmoforge" },
      {
        property: "og:description",
        content: "Screened calls, flagged voice fraud and blocked losses at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Overview,
});

const chartConfig = {
  screened: { label: "Screened", color: "var(--chart-4)" },
  flagged: { label: "Flagged", color: "var(--chart-1)" },
} satisfies ChartConfig;

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const statusTone = {
  Blocked: "high",
  Escalated: "high",
  "In review": "mid",
  Cleared: "low",
} as const;

function Overview() {
  const stats = [
    {
      label: "Calls screened · 24h",
      value: kpis.screened.toLocaleString("en-US"),
      delta: "+8.2% vs yesterday",
      icon: PhoneIncoming,
    },
    {
      label: "Flagged as fraud risk",
      value: kpis.flagged.toString(),
      delta: `${((kpis.flagged / kpis.screened) * 100).toFixed(1)}% of traffic`,
      icon: ShieldAlert,
    },
    {
      label: "Losses prevented",
      value: usd.format(kpis.blockedValue),
      delta: "42 transfers stopped",
      icon: Ban,
    },
    {
      label: "Average caller trust",
      value: kpis.avgTrust.toFixed(1),
      delta: "out of 100",
      icon: ShieldCheck,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Fraud operations · Sunday shift"
        title="Risk overview"
        description="Every inbound and agent call is scored for impersonation, social engineering and synthetic voice signals."
        actions={
          <Button asChild>
            <Link to="/analyze">
              Analyze a call <ArrowUpRight />
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 px-5 py-8 md:px-10">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow">{s.label}</span>
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-3 font-display text-3xl font-semibold tabular">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.delta}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Call traffic & flags</h2>
                <p className="text-xs text-muted-foreground">Last 24 hours, 2-hour buckets</p>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-chart-4" /> Screened
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-chart-1" /> Flagged ×20
                </span>
              </div>
            </div>
            <ChartContainer config={chartConfig} className="mt-4 h-[22rem] w-full">
              <AreaChart
                data={hourlyTrend.map((d) => ({ ...d, flaggedScaled: d.flagged * 20 }))}
                margin={{ left: -8, right: 8 }}
              >
                <defs>
                  <linearGradient id="fillScreened" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-screened)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-screened)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="fillFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-flagged)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-flagged)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
                <YAxis tickLine={false} axisLine={false} width={56} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="screened"
                  stroke="var(--color-screened)"
                  fill="url(#fillScreened)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="flaggedScaled"
                  name="flagged"
                  stroke="var(--color-flagged)"
                  fill="url(#fillFlagged)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Threat mix</h2>
            <p className="text-xs text-muted-foreground">Share of flagged calls today</p>
            <ul className="mt-5 space-y-4">
              {threatMix.map((t) => (
                <li key={t.type}>
                  <div className="flex justify-between text-sm">
                    <span>{t.type}</span>
                    <span className="font-mono tabular text-muted-foreground">{t.share}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${(t.share / threatMix[0]!.share) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-md border border-border bg-surface p-3">
              <div className="text-eyebrow">Synthetic voice detections</div>
              <Waveform bars={36} className="mt-2 h-8" />
              <p className="mt-2 text-xs text-muted-foreground">
                19 calls today matched known voice-clone profiles.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">Recent screened calls</h2>
              <p className="text-xs text-muted-foreground">Open any call to run a full AI review</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  {["Call", "Caller", "Threat", "Risk", "Status", ""].map((h) => (
                    <th key={h} className="text-eyebrow px-5 py-3 font-normal">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentCalls.map((c) => {
                  const level = riskLevel(c.score);
                  return (
                    <tr key={c.id} className="border-t border-border transition-colors hover:bg-accent/40">
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs">{c.id}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.time} · {c.channel} · {c.duration}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-mono text-xs tabular">{c.caller}</div>
                        <div className="text-xs text-muted-foreground">{c.callerName}</div>
                      </td>
                      <td className="px-5 py-3.5">{c.threat}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-lg font-semibold tabular">{c.score}</span>
                          <Badge variant={level}>{riskLabel[level]}</Badge>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusTone[c.status]}>{c.status}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/analyze" search={{ call: c.id }}>
                            Review <ArrowUpRight />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <p className="text-xs text-muted-foreground">
          Dashboard figures are sample data until your call feed is connected.
        </p>
      </div>
    </div>
  );
}
