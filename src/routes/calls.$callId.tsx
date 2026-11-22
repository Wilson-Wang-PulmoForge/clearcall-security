import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Ban, Flag, MessageSquareQuote, Phone, Sparkles, Users } from "lucide-react";
import { toast } from "sonner";

import { BackButton } from "@/components/app/BackButton";
import { CallerAvatar } from "@/components/app/CallerAvatar";
import { RiskGauge } from "@/components/app/RiskGauge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findReport, recentCalls } from "@/lib/demo-data";
import { useBlocked, useReported } from "@/lib/local-store";
import { formatPhone, riskLevel } from "@/lib/risk";

export const Route = createFileRoute("/calls/$callId")({
  loader: ({ params }) => {
    const call = recentCalls.find((c) => c.id === params.callId);
    if (!call) throw notFound();
    return { call };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.call.name} · ${formatPhone(loaderData.call.number)} — pulmoforge` : "Call — pulmoforge";
    const description = loaderData
      ? `Caller ID, risk and community reports for ${formatPhone(loaderData.call.number)}.`
      : "Caller details on pulmoforge.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="px-5 py-20 text-center">
      <p className="text-muted-foreground">That call isn't in your recents.</p>
      <Link to="/calls" className="mt-4 inline-block text-primary">
        Back to recents
      </Link>
    </div>
  ),
  component: CallDetail,
});

const kindBadge = {
  fraud: { variant: "high", text: "Fraud risk" },
  spam: { variant: "mid", text: "Spam risk" },
  verified: { variant: "low", text: "Verified" },
  contact: { variant: "secondary", text: "Contact" },
  unknown: { variant: "secondary", text: "Unknown" },
} as const;

function CallDetail() {
  const { call } = Route.useLoaderData();
  const report = findReport(call.number);
  const blocked = useBlocked();
  const reported = useReported();
  const isBlocked = blocked.has(call.number);
  const isReported = reported.has(call.number);
  const risky = call.kind === "fraud" || call.kind === "spam";
  const badge = kindBadge[call.kind];

  return (
    <div>
      <div className="flex items-center px-3 pt-3">
        <BackButton />
      </div>

      <section className={(risky ? "bg-alert" : "bg-safe") + " mx-4 rounded-3xl border border-border px-5 pt-6 pb-6 text-center"}>
        <div className="flex justify-center">
          <CallerAvatar kind={call.kind} name={call.name} size="lg" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold">{call.name}</h1>
        <p className="mt-1 font-mono text-base">{formatPhone(call.number)}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Badge variant={badge.variant}>{badge.text}</Badge>
          <span className="text-sm text-muted-foreground">{call.label}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {call.location} · {call.day === "Earlier" ? call.when : `${call.day}, ${call.when}`}
          {call.duration ? ` · ${call.duration}` : ""}
        </p>
      </section>

      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        <ActionButton
          label={isBlocked || call.direction === "blocked" ? "Unblock" : "Block"}
          active={isBlocked || call.direction === "blocked"}
          onClick={() => {
            blocked.toggle(call.number);
            toast(isBlocked ? "Number unblocked" : "Number blocked");
          }}
        >
          <Ban />
        </ActionButton>
        <ActionButton
          label={isReported ? "Reported" : "Report"}
          active={isReported}
          onClick={() => {
            reported.toggle(call.number);
            toast(isReported ? "Report removed" : "Thanks — your report helps protect others");
          }}
        >
          <Flag />
        </ActionButton>
        <ActionButton label="Call back" onClick={() => toast("Calling isn't available in the web app.")}>
          <Phone />
        </ActionButton>
      </div>

      {risky ? (
        <section className="mx-4 mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
          <RiskGauge score={call.score} size={130} />
          <div className="text-sm text-muted-foreground">
            {riskLevel(call.score) === "high"
              ? "Very likely a scam. Don't share codes, passwords or payment details."
              : "Likely unwanted. Let it go to voicemail if you don't recognize it."}
          </div>
        </section>
      ) : null}

      {call.transcript ? (
        <section className="mx-4 mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <MessageSquareQuote className="h-4 w-4 text-primary" />
            {call.direction === "blocked" ? "What the screener heard" : "Voicemail"}
          </h2>
          <p className="mt-2 border-l-2 border-primary/50 pl-3 text-sm leading-relaxed text-foreground/85">
            {call.transcript}
          </p>
          <Button asChild className="mt-4 h-11 w-full rounded-full">
            <Link to="/check" search={{ call: call.id }}>
              <Sparkles /> Check this call with AI
            </Link>
          </Button>
        </section>
      ) : null}

      {report ? (
        <section className="mx-4 mt-4 rounded-2xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Users className="h-4 w-4 text-primary" /> Community reports
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <Fact k="Reports" v={report.reports.toLocaleString("en-US")} />
            <Fact k="Trust score" v={`${report.trust}/100`} />
            <Fact k="Line type" v={report.lineType} />
            <Fact k="First seen" v={report.firstSeen} />
          </div>
          <ul className="mt-3 space-y-1.5 text-sm">
            {report.notes.map((n) => (
              <li key={n} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {n}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl bg-surface p-3">
      <div className="text-eyebrow">{k}</div>
      <div className="mt-0.5">{v}</div>
    </div>
  );
}

function ActionButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-xs transition-colors [&_svg]:h-5 [&_svg]:w-5 " +
        (active
          ? "border-risk-high/40 bg-risk-high/15 text-risk-high"
          : "border-border bg-card text-foreground hover:bg-accent")
      }
    >
      {children}
      {label}
    </button>
  );
}
