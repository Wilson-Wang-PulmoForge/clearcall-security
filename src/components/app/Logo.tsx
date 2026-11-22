import { cn } from "@/lib/utils";

const bars = [0.35, 0.7, 1, 0.55, 0.85, 0.4];

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-8 w-8 items-center justify-center gap-[2px] rounded-md bg-primary/12 ring-1 ring-primary/40",
        className,
      )}
      aria-hidden
    >
      {bars.map((h, i) => (
        <span
          key={i}
          className="w-[2.5px] rounded-full bg-primary"
          style={{ height: `${h * 60}%` }}
        />
      ))}
    </span>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark />
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        pulmoforge
      </span>
    </span>
  );
}
