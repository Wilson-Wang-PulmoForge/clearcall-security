export type RiskLevel = "low" | "mid" | "high";

/** Map a 0–100 fraud risk score to a display band. */
export function riskLevel(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

export const riskLabel: Record<RiskLevel, string> = {
  low: "Low risk",
  mid: "Spam risk",
  high: "Fraud risk",
};

/** Keep digits only (and a leading +) so lookups match regardless of formatting. */
export function normalizePhone(input: string): string {
  const digits = input.trim().replace(/\D/g, "");
  if (!digits) return "";
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return `+${withCountry}`;
}

/** Pretty-print an E.164 number for display. */
export function formatPhone(e164: string): string {
  const d = e164.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) {
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  if (d.startsWith("44") && d.length === 12) {
    return `+44 ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}`;
  }
  return e164;
}
