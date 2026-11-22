import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./ai/run-id.server";
import { callAnalysisSchema, type AnalyzeResult, type CallAnalysis } from "./analyze.schema";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are a voice-fraud analyst for a bank's fraud operations team.
You receive a call transcript (speaker-labelled where possible) and judge whether the call is a fraud or social-engineering attempt: vishing, bank/government impersonation, voice-clone family emergencies, business email compromise follow-ups, refund/tech-support scams, account takeover attempts, OTP harvesting, etc.

Rules:
- riskScore is an integer 0-100 (0 = clearly legitimate, 100 = certain fraud).
- verdict: "legitimate" for scores under 40, "suspicious" for 40-69, "likely_fraud" for 70+.
- scamType: a short category name, or "None detected".
- impersonating: who the caller claims to be if relevant, else null.
- summary: 1-2 plain sentences for an analyst.
- redFlags: up to 6 items. evidence must be a short direct quote or close paraphrase from the transcript.
- trustSignals: up to 4 short items that point toward legitimacy (may be empty).
- recommendedActions: 2-4 concrete next steps for the agent or fraud team.
Only use what is in the transcript; do not invent facts.`;

function clampAnalysis(a: CallAnalysis): CallAnalysis {
  return {
    ...a,
    riskScore: Math.max(0, Math.min(100, Math.round(a.riskScore))),
    redFlags: a.redFlags.slice(0, 6),
    trustSignals: a.trustSignals.slice(0, 4),
    recommendedActions: a.recommendedActions.slice(0, 4),
  };
}

function friendlyError(error: unknown): string {
  if (APICallError.isInstance(error)) {
    const status = error.statusCode;
    if (status === 429) return "The AI analyst is busy right now. Please try again in a moment.";
    if (status === 402)
      return "AI credits have run out for this workspace. Add credits to keep analyzing calls.";
    if (status === 403) return "AI analysis is currently blocked for this workspace.";
    if (status === 400) return "This transcript couldn't be analyzed. Try shortening it.";
  }
  return "The analysis failed. Please try again.";
}

export async function analyzeTranscript(
  transcript: string,
  signal: AbortSignal | undefined,
): Promise<AnalyzeResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "AI analysis isn't configured yet." };

  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  try {
    const result = streamText({
      model: provider.responses(MODEL),
      instructions: INSTRUCTIONS,
      messages: [{ role: "user", content: `Call transcript:\n\n${transcript}` }],
      output: Output.object({ schema: callAnalysisSchema }),
      ...(signal ? { abortSignal: signal } : {}),
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    try {
      const analysis = await result.output;
      return { ok: true, analysis: clampAnalysis(analysis) };
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error) && error.text) {
        const parsed = callAnalysisSchema.safeParse(safeJson(error.text));
        if (parsed.success) return { ok: true, analysis: clampAnalysis(parsed.data) };
      }
      throw error;
    }
  } catch (error) {
    console.error("analyzeTranscript failed", error);
    return { ok: false, error: friendlyError(error) };
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
