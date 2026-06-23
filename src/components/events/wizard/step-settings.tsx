"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { WizardData } from "@/app/(dashboard)/events/create/page";

const settings = [
  {
    key: "enable_rsvp" as const,
    title: "Enable RSVP",
    desc: "Allow guests to confirm their attendance",
    emoji: "✅",
  },
  {
    key: "enable_guest_count" as const,
    title: "Guest Count",
    desc: "Let guests specify how many people are coming",
    emoji: "👥",
  },
  {
    key: "enable_wishes" as const,
    title: "Wishes Wall",
    desc: "Allow guests to leave heartfelt messages",
    emoji: "💌",
  },
  {
    key: "enable_photo_uploads" as const,
    title: "Photo Uploads",
    desc: "Let guests upload photos from the event",
    emoji: "📸",
  },
];

interface StepSettingsProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function StepSettings({ data, onChange }: StepSettingsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">RSVP Settings</h2>
        <p className="text-muted-foreground mt-1">Configure guest interaction features</p>
      </div>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div
            key={setting.key}
            className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-xl">
                {setting.emoji}
              </div>
              <div>
                <Label htmlFor={setting.key} className="text-base cursor-pointer">
                  {setting.title}
                </Label>
                <p className="text-sm text-muted-foreground">{setting.desc}</p>
              </div>
            </div>
            <Switch
              id={setting.key}
              checked={data[setting.key]}
              onCheckedChange={(checked) => onChange({ [setting.key]: checked })}
            />
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Tip:</strong> All settings can be changed later from your event dashboard.
          You can also enable/disable features after publishing.
        </p>
      </div>
    </div>
  );
}
