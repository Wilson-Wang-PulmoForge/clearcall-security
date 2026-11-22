export type RiskLevel = "low" | "mid" | "high";

/** Map a 0–100 fraud risk score to a display band. */
export function riskLevel(score: number): RiskLevel {
  if (score >= 70) return "high";
  if (score >= 40) return "mid";
  return "low";
}

export const riskLabel: Record<RiskLevel, string> = {
  low: "Low risk",
  mid: "Elevated",
  high: "High risk",
};

/** Keep digits only (and a leading +) so lookups match regardless of formatting. */
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  const withCountry = digits.length === 10 ? `1${digits}` : digits;
  return `+${withCountry}`;
}
