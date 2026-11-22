import { createFileRoute } from "@tanstack/react-router";

import { BackButton } from "@/components/app/BackButton";
import { ScreenHeader } from "@/components/app/MobileShell";
import { Switch } from "@/components/ui/switch";
import { useBlocked, useSettings, type ProtectionSettings } from "@/lib/local-store";
import { formatPhone } from "@/lib/risk";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Protection settings — pulmoforge" },
      { name: "description", content: "Choose how pulmoforge blocks scam calls and warns you." },
      { property: "og:title", content: "Protection settings — pulmoforge" },
      { property: "og:description", content: "Control scam blocking, spam warnings and AI screening." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const options: { key: keyof ProtectionSettings; title: string; body: string }[] = [
  { key: "blockFraud", title: "Block fraud calls", body: "Automatically block numbers with a high fraud risk." },
  { key: "warnSpam", title: "Warn me about spam", body: "Show a spam label on the incoming call screen." },
  { key: "aiScreening", title: "AI call screening", body: "Let pulmoforge answer unknown callers and ask why they're calling." },
  { key: "deepfakeAlerts", title: "Deepfake voice alerts", body: "Warn when a voice sounds AI-generated or cloned." },
  { key: "silenceUnknown", title: "Silence unknown callers", body: "Send numbers not in your contacts straight to voicemail." },
];

function SettingsPage() {
  const [settings, setSettings] = useSettings();
  const blocked = useBlocked();

  return (
    <div>
      <ScreenHeader title="Protection" subtitle="How pulmoforge handles your calls" left={<BackButton />} />
      <ul className="mx-4 mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {options.map((o) => (
          <li key={o.key} className="flex items-start gap-4 p-4">
            <label htmlFor={o.key} className="flex-1">
              <div className="font-medium">{o.title}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{o.body}</div>
            </label>
            <Switch
              id={o.key}
              checked={settings[o.key]}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, [o.key]: v }))}
            />
          </li>
        ))}
      </ul>

      <section className="mx-4 mt-6">
        <h2 className="text-eyebrow px-1">Your block list</h2>
        {blocked.list.length === 0 ? (
          <p className="mt-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Numbers you block will show here.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-border rounded-2xl border border-border bg-card">
            {blocked.list.map((n) => (
              <li key={n} className="flex items-center justify-between p-4">
                <span className="font-mono text-sm">{formatPhone(n)}</span>
                <button type="button" className="text-sm text-primary" onClick={() => blocked.toggle(n)}>
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
