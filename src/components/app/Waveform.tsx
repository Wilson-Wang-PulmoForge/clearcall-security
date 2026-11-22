import { cn } from "@/lib/utils";

/** Decorative animated voice waveform. */
export function Waveform({ bars = 40, className }: { bars?: number; className?: string }) {
  return (
    <div className={cn("flex h-10 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: bars }).map((_, i) => {
        const h = 30 + Math.round(Math.abs(Math.sin(i * 1.7) * 70));
        return (
          <span
            key={i}
            className="w-[3px] origin-center animate-wave rounded-full bg-primary/70"
            style={{ height: `${h}%`, animationDelay: `${(i % 9) * 0.11}s` }}
          />
        );
      })}
    </div>
  );
}
