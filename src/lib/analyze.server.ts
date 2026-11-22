import { createOpenAI } from "@ai-sdk/openai";
import { APICallError, NoObjectGeneratedError, Output, streamText } from "ai";

import { createLovableAiGatewayRunIdFetch } from "./ai/run-id.server";
import { callAnalysisSchema, type AnalyzeResult, type CallAnalysis } from "./analyze.schema";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

const INSTRUCTIONS = `You are pulmoforge, a scam-call protection assistant for everyday people.
The user gives you what a caller said (a voicemail, a screened call, or their own description of a call). Judge whether it is a scam or fraud attempt: bank or government impersonation, AI voice-clone "family emergency" calls, one-time-code harvesting, tech-support/refund scams, prize/lottery scams, robocalls, etc.

Rules:
- riskScore is an integer 0-100 (0 = clearly safe, 100 = certain scam).
- verdict: "legitimate" for scores under 40, "suspicious" for 40-69, "likely_fraud" for 70+.
- scamType: a short, plain-language name for the scam type, or "No scam detected".
- impersonating: who the caller pretends to be if relevant, else null.
- summary: 1-2 friendly, plain sentences written directly to the user ("you").
- redFlags: up to 5 warning signs. evidence must be a short quote or close paraphrase of what was said.
- trustSignals: up to 3 short reassuring signs (may be empty).
- recommendedActions: 2-4 short, concrete steps the user should take now, written to "you" (e.g. hang up, call back on the number on your card, don't share codes, report the number).
Use simple words, no jargon. Only use what is in the text; do not invent facts.`;

function clampAnalysis(a: CallAnalysis): CallAnalysis {
  return {
    ...a,
    riskScore: Math.max(0, Math.min(100, Math.round(a.riskScore))),
    redFlags: a.redFlags.slice(0, 5),
    trustSignals: a.trustSignals.slice(0, 3),
    recommendedActions: a.recommendedActions.slice(0, 4),
  };
}

function friendlyError(error: unknown): string {
  if (APICallError.isInstance(error)) {
    const status = error.statusCode;
    if (status === 429) return "The AI checker is busy right now. Please try again in a moment.";
    if (status === 402)
      return "AI checks are paused right now. Please try again later.";
    if (status === 403) return "AI checks are unavailable right now.";
    if (status === 400) return "That text couldn't be checked. Try shortening it.";
  }
  return "The check didn't finish. Please try again.";
}

export async function analyzeTranscript(
  transcript: string,
  signal: AbortSignal | undefined,
): Promise<AnalyzeResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) return { ok: false, error: "AI checks aren't set up yet." };

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
      messages: [{ role: "user", content: `What the caller said:\n\n${transcript}` }],
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
