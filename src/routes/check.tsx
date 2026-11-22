import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, ListChecks, Loader2, Sparkles, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ScreenHeader } from "@/components/app/MobileShell";
import { RiskGauge } from "@/components/app/RiskGauge";
import { Waveform } from "@/components/app/Waveform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCall } from "@/lib/analyze.functions";
import type { CallAnalysis } from "@/lib/analyze.schema";
import { recentCalls } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/check")({
  validateSearch: (search: Record<string, unknown>): { call?: string } =>
    typeof search["call"] === "string" ? { call: search["call"] } : {},
  head: () => ({
    meta: [
      { title: "AI scam check — pulmoforge" },
      {
        name: "description",
        content: "Tell pulmoforge what a caller said and AI tells you if it's a scam, and what to do.",
      },
      { property: "og:title", content: "AI scam check — pulmoforge" },
      {
        property: "og:description",
        content: "Not sure about a call or voicemail? Get an instant AI scam verdict.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckPage,
});

const verdictCopy: Record<CallAnalysis["verdict"], { label: string; tone: "low" | "mid" | "high" }> = {
  legitimate: { label: "Looks safe", tone: "low" },
  suspicious: { label: "Be careful", tone: "mid" },
  likely_fraud: { label: "Likely a scam", tone: "high" },
};

const severityTone = { low: "low", medium: "mid", high: "high" } as const;
const samples = recentCalls.filter((c) => c.transcript);

function CheckPage() {
  const { call } = Route.useSearch();
  const [text, setText] = useState("");
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const runAnalysis = useServerFn(analyzeCall);

  const mutation = useMutation({
    mutationFn: async (transcript: string) => {
      const res = await runAnalysis({ data: { transcript } });
      if (!res.ok) throw new Error(res.error);
      return res.analysis;
    },
    onError: (err) => toast.error(err.message),
  });

  const load = (id: string) => {
    const s = samples.find((c) => c.id === id);
    if (!s?.transcript) return;
    setText(s.transcript);
    setActiveSample(s.id);
    mutation.reset();
  };

  useEffect(() => {
    if (call) load(call);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  const tooShort = text.trim().length < 40;

  return (
    <div>
      <ScreenHeader title="AI Check" subtitle="Was that call a scam? Ask pulmoforge" />

      <div className="px-4 pt-4">
        <label htmlFor="said" className="text-eyebrow px-1">
          What did the caller say?
        </label>
        <Textarea
          id="said"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setActiveSample(null);
          }}
          placeholder="e.g. They said they were from my bank and needed the code sent to my phone…"
          className="mt-2 min-h-40 rounded-2xl bg-card text-base leading-relaxed"
        />

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {samples.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => load(c.id)}
              className={cn(
                "shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors",
                activeSample === c.id && "border-primary bg-primary/15 text-foreground",
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <Button
          size="lg"
          className="mt-4 h-12 w-full rounded-full"
          disabled={tooShort || mutation.isPending}
          onClick={() => mutation.mutate(text)}
        >
          {mutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {mutation.isPending ? "Checking…" : "Check for scams"}
        </Button>
        {tooShort && text.length > 0 ? (
          <p className="mt-2 text-center text-xs text-muted-foreground">Add a little more detail.</p>
        ) : null}
      </div>

      <section aria-live="polite" className="mt-6 px-4">
        {mutation.isPending ? (
          <div className="flex flex-col items-center rounded-3xl border border-primary/40 bg-card p-8 text-center shadow-glow">
            <Waveform bars={30} />
            <p className="mt-4 font-medium">Listening for scam tricks…</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Pressure, impersonation, requests for codes or money
            </p>
          </div>
        ) : mutation.data ? (
          <Result analysis={mutation.data} />
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Type or paste what you heard, or tap one of your recent calls above.
          </div>
        )}
      </section>
    </div>
  );
}

function Result({ analysis }: { analysis: CallAnalysis }) {
  const verdict = verdictCopy[analysis.verdict];
  const bg = verdict.tone === "low" ? "bg-safe" : verdict.tone === "mid" ? "bg-signal" : "bg-alert";
  return (
    <div className="space-y-3">
      <div className={cn(bg, "rounded-3xl border border-border p-5 text-center")}>
        <div className="flex justify-center">
          <RiskGauge score={analysis.riskScore} label="Scam risk" />
        </div>
        <h2 className="mt-2 text-2xl font-semibold">{verdict.label}</h2>
        <p className="text-sm text-muted-foreground">{analysis.scamType}</p>
        <p className="mt-3 text-left text-sm leading-relaxed">{analysis.summary}</p>
        {analysis.impersonating ? (
          <div className="mt-3 flex items-start gap-2 text-left text-xs text-muted-foreground">
            <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              Pretending to be: <span className="text-foreground">{analysis.impersonating}</span>
            </span>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 font-semibold">
          <ListChecks className="h-4 w-4 text-primary" /> What to do now
        </h3>
        <ol className="mt-3 space-y-2.5">
          {analysis.recommendedActions.map((a, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-primary">{i + 1}</span>
              <span>{a}</span>
            </li>
          ))}
        </ol>
      </div>

      {analysis.redFlags.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <AlertTriangle className="h-4 w-4 text-risk-high" /> Warning signs
          </h3>
          <ul className="mt-3 space-y-3">
            {analysis.redFlags.map((f, i) => (
              <li key={i}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{f.label}</span>
                  <Badge variant={severityTone[f.severity]}>{f.severity}</Badge>
                </div>
                <p className="mt-1 border-l-2 border-primary/50 pl-3 text-xs leading-relaxed text-muted-foreground">
                  {f.evidence}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {analysis.trustSignals.length > 0 ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-risk-low" /> Reassuring signs
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {analysis.trustSignals.map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-low" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
