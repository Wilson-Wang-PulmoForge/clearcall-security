import { Ban, Flag, Phone, PhoneOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { PhoneCall } from "@/lib/demo-data";
import { findReport } from "@/lib/demo-data";
import { useBlocked, useReported } from "@/lib/local-store";
import { formatPhone } from "@/lib/risk";

/** Full-screen caller ID warning, as shown when a risky call rings. */
export function IncomingCall({ call, onClose }: { call: PhoneCall; onClose: () => void }) {
  const report = findReport(call.number);
  const blocked = useBlocked();
  const reported = useReported();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Incoming call"
      className="bg-alert fixed inset-0 z-50 mx-auto flex max-w-md flex-col items-center px-6 pt-14 pb-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-300 md:absolute"
    >
      <div className="text-eyebrow">Incoming call · {call.location}</div>

      <div className="relative mt-10">
        <span className="absolute inset-0 animate-ring-out rounded-full bg-risk-high/40" />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-risk-high text-risk-high-foreground">
          <ShieldAlert className="h-11 w-11" />
        </span>
      </div>

      <div className="mt-6 rounded-full bg-risk-high px-3 py-1 font-mono text-xs font-medium tracking-wider text-risk-high-foreground uppercase">
        Fraud risk
      </div>
      <h2 className="mt-4 text-3xl font-semibold">{call.label}</h2>
      <p className="mt-2 font-mono text-lg">{formatPhone(call.number)}</p>
      {report ? (
        <p className="mt-3 max-w-xs text-sm text-foreground/80">
          {report.reports.toLocaleString("en-US")} people reported this number. {report.notes[0]}.
        </p>
      ) : null}

      <div className="mt-6 w-full rounded-xl border border-risk-high/30 bg-background/40 p-4 text-left text-sm">
        <div className="font-medium">pulmoforge tip</div>
        <p className="mt-1 text-foreground/75">
          Real agencies never demand gift cards or threaten arrest by phone. If in doubt, hang up
          and call back on an official number.
        </p>
      </div>

      <div className="mt-auto w-full space-y-6 pt-8">
        <div className="flex items-start justify-around">
          <RoundAction
            label="Decline"
            onClick={() => {
              toast("Call declined");
              onClose();
            }}
            tone="decline"
          >
            <PhoneOff />
          </RoundAction>
          <RoundAction
            label="Answer"
            onClick={() => {
              toast.warning("Stay alert — never share codes or payment details.");
              onClose();
            }}
            tone="answer"
          >
            <Phone />
          </RoundAction>
        </div>
        <Button
          variant="secondary"
          size="lg"
          className="h-12 w-full rounded-full"
          onClick={() => {
            if (!blocked.has(call.number)) blocked.toggle(call.number);
            if (!reported.has(call.number)) reported.toggle(call.number);
            toast.success("Blocked and reported. Thanks for protecting others.");
            onClose();
          }}
        >
          <Ban /> Block & report
          <Flag className="opacity-60" />
        </Button>
      </div>
    </div>
  );
}

function RoundAction({
  label,
  tone,
  onClick,
  children,
}: {
  label: string;
  tone: "decline" | "answer";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2 text-sm">
      <span
        className={
          tone === "decline"
            ? "flex h-16 w-16 items-center justify-center rounded-full bg-risk-high text-risk-high-foreground [&_svg]:h-7 [&_svg]:w-7"
            : "flex h-16 w-16 items-center justify-center rounded-full bg-risk-low text-risk-low-foreground [&_svg]:h-7 [&_svg]:w-7"
        }
      >
        {children}
      </span>
      {label}
    </button>
  );
}
