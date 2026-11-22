import { Link, createFileRoute } from "@tanstack/react-router";
import { BellRing, ChevronRight, Settings, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { CallRow } from "@/components/app/CallRow";
import { IncomingCall } from "@/components/app/IncomingCall";
import { Logo } from "@/components/app/Logo";
import { Waveform } from "@/components/app/Waveform";
import { Button } from "@/components/ui/button";
import { recentCalls, weeklyStats } from "@/lib/demo-data";
import { useBlocked, useSettings } from "@/lib/local-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "pulmoforge — Scam call & voice fraud protection" },
      {
        name: "description",
        content:
          "pulmoforge identifies callers, warns you about scam and deepfake voice calls, and blocks fraud before you answer.",
      },
      { property: "og:title", content: "pulmoforge — Scam call & voice fraud protection" },
      {
        property: "og:description",
        content: "Caller ID, scam warnings and AI voice-fraud checks for your phone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [ringing, setRinging] = useState(false);
  const blocked = useBlocked();
  const [settings] = useSettings();
  const alerts = recentCalls.filter((c) => c.kind === "fraud" || c.kind === "spam").slice(0, 3);
  const protectedOn = settings.blockFraud || settings.warnSpam;
  const fraudCall = recentCalls[0]!;

  return (
    <div>
      <header className="flex items-center justify-between px-5 pt-5">
        <Logo />
        <Link
          to="/settings"
          aria-label="Settings"
          className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </header>

      <section className={(protectedOn ? "bg-safe" : "bg-signal") + " mx-4 mt-5 rounded-3xl border border-border p-6"}>
        <div className="flex items-center gap-3">
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-risk-low/20 text-risk-low">
            {protectedOn ? <span className="absolute inset-0 animate-ring-out rounded-full bg-risk-low/30" /> : null}
            <ShieldCheck className="relative h-6 w-6" />
          </span>
          <div>
            <div className="text-eyebrow">{protectedOn ? "Protection on" : "Protection paused"}</div>
            <h1 className="text-2xl font-semibold">
              {protectedOn ? "You're protected" : "Turn protection on"}
            </h1>
          </div>
        </div>
        <Waveform bars={34} className="mt-5 h-8 opacity-80" />
        <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
          {[
            { k: "Screened", v: weeklyStats.screened },
            { k: "Blocked", v: weeklyStats.blocked + blocked.list.length },
            { k: "Scams stopped", v: weeklyStats.fraudStopped },
          ].map((s) => (
            <div key={s.k} className="rounded-xl bg-background/40 px-2 py-3">
              <dd className="font-display text-2xl font-semibold tabular">{s.v}</dd>
              <dt className="text-[0.68rem] text-muted-foreground">{s.k}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-center text-[0.7rem] text-muted-foreground">This week</p>
      </section>

      <div className="mx-4 mt-4">
        <Button
          size="lg"
          className="h-12 w-full rounded-full"
          onClick={() => setRinging(true)}
        >
          <BellRing /> See a scam call warning
        </Button>
      </div>

      <section className="mt-7">
        <div className="flex items-center justify-between px-5">
          <h2 className="text-lg font-semibold">Recent alerts</h2>
          <Link to="/calls" className="flex items-center text-sm text-primary">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-2">
          {alerts.map((c) => (
            <CallRow key={c.id} call={c} blocked={blocked.has(c.number)} />
          ))}
        </div>
      </section>

      <section className="mx-4 mt-6 rounded-2xl border border-border bg-card p-5">
        <div className="text-eyebrow">Scam of the week</div>
        <h3 className="mt-2 text-lg font-semibold">AI voice clones of family members</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Scammers copy a loved one's voice from social videos and call asking for urgent money.
          Agree on a family safe word, and call them back on their real number.
        </p>
        <Link to="/check" className="mt-3 inline-flex items-center text-sm font-medium text-primary">
          Check a suspicious call <ChevronRight className="h-4 w-4" />
        </Link>
      </section>

      {ringing ? <IncomingCall call={fraudCall} onClose={() => setRinging(false)} /> : null}
    </div>
  );
}
