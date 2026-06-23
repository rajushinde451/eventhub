"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WizardData } from "@/app/(dashboard)/events/create/page";

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)" },
  { value: "America/New_York", label: "New York (EST, UTC-5)" },
  { value: "Europe/London", label: "London (GMT, UTC+0)" },
  { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
  { value: "Australia/Sydney", label: "Sydney (AEST, UTC+10)" },
];

interface StepInfoProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function StepInfo({ data, onChange }: StepInfoProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Event Details</h2>
        <p className="text-muted-foreground mt-1">Tell guests what they need to know</p>
      </div>

      <div className="grid gap-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              placeholder="Ramya's Housewarming"
              value={data.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="host_name">Host Name <span className="text-destructive">*</span></Label>
            <Input
              id="host_name"
              placeholder="Ramya & Suresh"
              value={data.host_name}
              onChange={(e) => onChange({ host_name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Write a warm message for your guests..."
            rows={4}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Event Date <span className="text-destructive">*</span></Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => onChange({ date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              type="time"
              value={data.start_time}
              onChange={(e) => onChange({ start_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              type="time"
              value={data.end_time}
              onChange={(e) => onChange({ end_time: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <Select value={data.timezone} onValueChange={(v) => onChange({ timezone: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
