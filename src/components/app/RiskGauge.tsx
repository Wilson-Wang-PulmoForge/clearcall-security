import { riskLabel, riskLevel } from "@/lib/risk";
import { cn } from "@/lib/utils";

const strokeByLevel = {
  low: "stroke-risk-low",
  mid: "stroke-risk-mid",
  high: "stroke-risk-high",
} as const;

const textByLevel = {
  low: "text-risk-low",
  mid: "text-risk-mid",
  high: "text-risk-high",
} as const;

export function RiskGauge({
  score,
  label = "Fraud risk",
  size = 168,
}: {
  score: number;
  label?: string;
  size?: number;
}) {
  const level = riskLevel(score);
  const r = 70;
  const circumference = Math.PI * r; // half circle
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 160 92" className="w-full" role="img" aria-label={`${label} ${score}`}>
        <path
          d="M10 82 A70 70 0 0 1 150 82"
          fill="none"
          className="stroke-muted"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M10 82 A70 70 0 0 1 150 82"
          fill="none"
          className={cn(strokeByLevel[level], "transition-[stroke-dashoffset] duration-700")}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="-mt-12 text-center">
        <div className={cn("font-display text-4xl font-semibold tabular", textByLevel[level])}>
          {score}
        </div>
        <div className="text-eyebrow mt-1">{riskLabel[level]}</div>
      </div>
    </div>
  );
}
