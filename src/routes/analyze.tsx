import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, ListChecks, Loader2, ScanLine, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/app/AppShell";
import { RiskGauge } from "@/components/app/RiskGauge";
import { Waveform } from "@/components/app/Waveform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeCall } from "@/lib/analyze.functions";
import type { CallAnalysis } from "@/lib/analyze.schema";
import { recentCalls } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/analyze")({
  validateSearch: (search: Record<string, unknown>): { call?: string } =>
    typeof search["call"] === "string" ? { call: search["call"] } : {},
  head: () => ({
    meta: [
      { title: "Analyze a call — pulmoforge" },
      {
        name: "description",
        content: "Paste a call transcript and get an AI fraud risk score, red flags and next steps.",
      },
      { property: "og:title", content: "Analyze a call — pulmoforge" },
      {
        property: "og:description",
        content: "AI-powered fraud scoring for call transcripts, with evidence and next steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyzePage,
});

const verdictCopy: Record<CallAnalysis["verdict"], { label: string; tone: "low" | "mid" | "high" }> = {
  legitimate: { label: "Legitimate", tone: "low" },
  suspicious: { label: "Suspicious", tone: "mid" },
  likely_fraud: { label: "Likely fraud", tone: "high" },
};

const severityTone = { low: "low", medium: "mid", high: "high" } as const;

function AnalyzePage() {
  const { call } = Route.useSearch();
  const [transcript, setTranscript] = useState("");
  const [activeSample, setActiveSample] = useState<string | null>(null);
  const runAnalysis = useServerFn(analyzeCall);

  const mutation = useMutation({
    mutationFn: async (text: string) => {
      const res = await runAnalysis({ data: { transcript: text } });
      if (!res.ok) throw new Error(res.error);
      return res.analysis;
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (!call) return;
    const sample = recentCalls.find((c) => c.id === call);
    if (sample) {
      setTranscript(sample.transcript);
      setActiveSample(sample.id);
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [call]);

  const tooShort = transcript.trim().length < 40;

  return (
    <div>
      <PageHeader
        eyebrow="AI call analyst"
        title="Analyze a call"
        description="Paste a transcript from a recorded or live call. The analyst scores fraud risk, quotes the red flags and suggests what the agent should do next."
      />

      <div className="grid gap-6 px-5 py-8 md:px-10 xl:grid-cols-[1fr_1.1fr]">
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <label htmlFor="transcript" className="text-eyebrow">
              Call transcript
            </label>
            <span className="font-mono text-xs tabular text-muted-foreground">
              {transcript.length.toLocaleString("en-US")} chars
            </span>
          </div>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              setActiveSample(null);
            }}
            placeholder={"Caller: Hi, this is the fraud department of your bank...\nAgent: ..."}
            className="mt-3 min-h-80 resize-y bg-surface font-mono text-[0.8rem] leading-relaxed"
          />

          <div className="mt-4">
            <div className="text-eyebrow mb-2">Load a recent call</div>
            <div className="flex flex-wrap gap-2">
              {recentCalls.slice(0, 6).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setTranscript(c.transcript);
                    setActiveSample(c.id);
                    mutation.reset();
                  }}
                  className={cn(
                    "rounded-md border border-border bg-surface px-2.5 py-1.5 text-left text-xs transition-colors hover:border-primary/50",
                    activeSample === c.id && "border-primary/70 bg-primary/10",
                  )}
                >
                  <span className="font-mono">{c.id}</span>
                  <span className="ml-2 text-muted-foreground">{c.callerName}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button
              size="lg"
              disabled={tooShort || mutation.isPending}
              onClick={() => mutation.mutate(transcript)}
            >
              {mutation.isPending ? <Loader2 className="animate-spin" /> : <ScanLine />}
              {mutation.isPending ? "Analyzing…" : "Run fraud analysis"}
            </Button>
            {tooShort ? (
              <span className="text-xs text-muted-foreground">Paste at least a few lines.</span>
            ) : null}
          </div>
        </section>

        <section aria-live="polite">
          {mutation.isPending ? (
            <ScanningState />
          ) : mutation.data ? (
            <AnalysisResult analysis={mutation.data} />
          ) : mutation.isError ? (
            <EmptyState
              title="Analysis didn't finish"
              body={mutation.error.message}
            />
          ) : (
            <EmptyState
              title="Waiting for a transcript"
              body="Results appear here: a risk score, the verdict, quoted red flags and recommended actions."
            />
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full min-h-96 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-10 text-center">
      <Waveform bars={28} className="opacity-60" />
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function ScanningState() {
  return (
    <div className="relative flex h-full min-h-96 flex-col items-center justify-center overflow-hidden rounded-lg border border-primary/40 bg-card p-10 text-center shadow-glow">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-sweep bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      <Waveform bars={44} />
      <h2 className="mt-6 text-xl font-semibold">Listening for fraud patterns</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Checking for urgency pressure, impersonation, verification bypass and payment redirection.
      </p>
    </div>
  );
}

function AnalysisResult({ analysis }: { analysis: CallAnalysis }) {
  const verdict = verdictCopy[analysis.verdict];
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center">
        <RiskGauge score={analysis.riskScore} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={verdict.tone}>{verdict.label}</Badge>
            <span className="text-sm text-muted-foreground">{analysis.scamType}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">{analysis.summary}</p>
          {analysis.impersonating ? (
            <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
              <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Claims to be: <span className="text-foreground">{analysis.impersonating}</span>
              </span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-4 w-4 text-risk-high" /> Red flags
          <span className="font-mono text-xs font-normal text-muted-foreground">
            {analysis.redFlags.length}
          </span>
        </h3>
        {analysis.redFlags.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No red flags found in this call.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {analysis.redFlags.map((f, i) => (
              <li key={i} className="rounded-md border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{f.label}</span>
                  <Badge variant={severityTone[f.severity]}>{f.severity}</Badge>
                </div>
                <p className="mt-1.5 border-l-2 border-primary/50 pl-3 font-mono text-xs leading-relaxed text-muted-foreground">
                  {f.evidence}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <ListChecks className="h-4 w-4 text-primary" /> Recommended actions
          </h3>
          <ol className="mt-3 space-y-2.5">
            {analysis.recommendedActions.map((a, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <CheckCircle2 className="h-4 w-4 text-risk-low" /> Trust signals
          </h3>
          {analysis.trustSignals.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">None found.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {analysis.trustSignals.map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-risk-low" />
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
