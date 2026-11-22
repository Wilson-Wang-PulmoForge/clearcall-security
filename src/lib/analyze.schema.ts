import { z } from "zod";

// Kept flat and bound-free so the AI's strict structured output accepts it; limits live in the prompt.
export const callAnalysisSchema = z.object({
  riskScore: z.number(),
  verdict: z.enum(["legitimate", "suspicious", "likely_fraud"]),
  scamType: z.string(),
  impersonating: z.string().nullable(),
  summary: z.string(),
  redFlags: z.array(
    z.object({
      label: z.string(),
      evidence: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    }),
  ),
  trustSignals: z.array(z.string()),
  recommendedActions: z.array(z.string()),
});

export type CallAnalysis = z.infer<typeof callAnalysisSchema>;

export type AnalyzeResult = { ok: true; analysis: CallAnalysis } | { ok: false; error: string };
