import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CallRow } from "@/components/app/CallRow";
import { ScreenHeader } from "@/components/app/MobileShell";
import { recentCalls } from "@/lib/demo-data";
import { useBlocked } from "@/lib/local-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/calls/")({
  head: () => ({
    meta: [
      { title: "Recent calls — pulmoforge" },
      {
        name: "description",
        content: "Your recent calls with caller ID, spam and fraud labels from pulmoforge.",
      },
      { property: "og:title", content: "Recent calls — pulmoforge" },
      { property: "og:description", content: "Every call labeled: verified, spam risk or fraud risk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Recents,
});

const filters = [
  { id: "all", label: "All" },
  { id: "risky", label: "Scam & spam" },
  { id: "blocked", label: "Blocked" },
  { id: "missed", label: "Missed" },
] as const;

type FilterId = (typeof filters)[number]["id"];

function Recents() {
  const [filter, setFilter] = useState<FilterId>("all");
  const blocked = useBlocked();

  const isBlocked = (n: string, dir: string) => dir === "blocked" || blocked.has(n);
  const calls = recentCalls.filter((c) => {
    if (filter === "risky") return c.kind === "fraud" || c.kind === "spam";
    if (filter === "blocked") return isBlocked(c.number, c.direction);
    if (filter === "missed") return c.direction === "missed";
    return true;
  });
  const days = ["Today", "Yesterday", "Earlier"] as const;

  return (
    <div>
      <ScreenHeader title="Recents" subtitle="Every caller identified and checked" />
      <div className="flex gap-2 overflow-x-auto px-5 py-3">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full border border-border px-3.5 py-1.5 text-sm transition-colors",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {calls.length === 0 ? (
        <p className="px-5 py-16 text-center text-sm text-muted-foreground">No calls here yet.</p>
      ) : (
        days.map((day) => {
          const group = calls.filter((c) => c.day === day);
          if (group.length === 0) return null;
          return (
            <section key={day}>
              <h2 className="text-eyebrow px-5 pt-4 pb-1">{day}</h2>
              {group.map((c) => (
                <CallRow key={c.id} call={c} blocked={blocked.has(c.number)} />
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
