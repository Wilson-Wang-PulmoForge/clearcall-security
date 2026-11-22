import { BadgeCheck, ShieldAlert, ShieldQuestion, TriangleAlert } from "lucide-react";

import type { CallerKind } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const styles: Record<CallerKind, string> = {
  fraud: "bg-risk-high/15 text-risk-high ring-risk-high/40",
  spam: "bg-risk-mid/15 text-risk-mid ring-risk-mid/40",
  verified: "bg-risk-low/15 text-risk-low ring-risk-low/40",
  contact: "bg-secondary text-secondary-foreground ring-border",
  unknown: "bg-muted text-muted-foreground ring-border",
};

export function CallerAvatar({
  kind,
  name,
  size = "md",
}: {
  kind: CallerKind;
  name: string;
  size?: "md" | "lg";
}) {
  const box = size === "lg" ? "h-20 w-20 text-2xl" : "h-11 w-11 text-sm";
  const icon = size === "lg" ? "h-9 w-9" : "h-5 w-5";
  const initials = name
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-semibold ring-1",
        box,
        styles[kind],
      )}
      aria-hidden
    >
      {kind === "fraud" ? (
        <ShieldAlert className={icon} />
      ) : kind === "spam" ? (
        <TriangleAlert className={icon} />
      ) : kind === "verified" ? (
        <BadgeCheck className={icon} />
      ) : kind === "contact" ? (
        initials
      ) : (
        <ShieldQuestion className={icon} />
      )}
    </span>
  );
}
