import { Link } from "@tanstack/react-router";
import { Ban, ChevronRight, PhoneIncoming, PhoneMissed, PhoneOutgoing } from "lucide-react";

import type { PhoneCall } from "@/lib/demo-data";
import { formatPhone } from "@/lib/risk";
import { cn } from "@/lib/utils";

import { CallerAvatar } from "./CallerAvatar";

const nameTone = {
  fraud: "text-risk-high",
  spam: "text-risk-mid",
  verified: "text-foreground",
  contact: "text-foreground",
  unknown: "text-foreground",
} as const;

const dirIcon = {
  incoming: PhoneIncoming,
  missed: PhoneMissed,
  outgoing: PhoneOutgoing,
  blocked: Ban,
} as const;

export function CallRow({ call, blocked }: { call: PhoneCall; blocked?: boolean }) {
  const Icon = dirIcon[blocked ? "blocked" : call.direction];
  return (
    <Link
      to="/calls/$callId"
      params={{ callId: call.id }}
      className="flex items-center gap-3 px-5 py-3 transition-colors active:bg-accent hover:bg-accent/50"
    >
      <CallerAvatar kind={call.kind} name={call.name} />
      <div className="min-w-0 flex-1">
        <div className={cn("truncate font-medium", nameTone[call.kind])}>{call.name}</div>
        <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Icon
            className={cn(
              "h-3.5 w-3.5 shrink-0",
              (blocked || call.direction === "blocked" || call.direction === "missed") &&
                "text-risk-high",
            )}
          />
          <span className="truncate">
            {call.kind === "fraud" || call.kind === "spam" ? call.label : formatPhone(call.number)}
          </span>
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-muted-foreground">{call.when}</div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
