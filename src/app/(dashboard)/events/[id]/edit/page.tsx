"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getEventById, updateEvent } from "@/app/actions/events";
import type { Event } from "@/types";

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Event>>({});

  useEffect(() => {
    getEventById(params.id).then((e) => {
      if (e) { setEvent(e); setForm(e); }
    });
  }, [params.id]);

  function update(key: keyof Event, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateEvent(params.id, {
      title: form.title,
      host_name: form.host_name ?? undefined,
      description: form.description ?? undefined,
      date: form.date,
      start_time: form.start_time ?? undefined,
      end_time: form.end_time ?? undefined,
      timezone: form.timezone ?? undefined,
      venue_name: form.venue_name ?? undefined,
      address: form.address ?? undefined,
      map_url: form.map_url ?? undefined,
      enable_rsvp: form.enable_rsvp,
      enable_guest_count: form.enable_guest_count,
      enable_wishes: form.enable_wishes,
      enable_photo_uploads: form.enable_photo_uploads,
    });
    setSaving(false);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Event updated!");
    router.push(`/events/${params.id}`);
  }

  if (!event) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Edit Event</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
        <Button onClick={handleSave} loading={saving} className="gap-2">
          <Save className="w-4 h-4" /> Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input value={form.title || ""} onChange={(e) => update("title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Host Name</Label>
              <Input value={form.host_name || ""} onChange={(e) => update("host_name", e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea rows={4} value={form.description || ""} onChange={(e) => update("description", e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={form.date || ""} onChange={(e) => update("date", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={form.start_time || ""} onChange={(e) => update("start_time", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={form.end_time || ""} onChange={(e) => update("end_time", e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Location</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Venue Name</Label>
            <Input value={form.venue_name || ""} onChange={(e) => update("venue_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea rows={3} value={form.address || ""} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Google Maps URL</Label>
            <Input value={form.map_url || ""} onChange={(e) => update("map_url", e.target.value)} placeholder="https://maps.app.goo.gl/..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {([
            { key: "enable_rsvp" as const, label: "Enable RSVP" },
            { key: "enable_guest_count" as const, label: "Guest Count" },
            { key: "enable_wishes" as const, label: "Wishes Wall" },
            { key: "enable_photo_uploads" as const, label: "Photo Uploads" },
          ] as const).map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1">
              <Label>{s.label}</Label>
              <Switch
                checked={!!form[s.key]}
                onCheckedChange={(v) => update(s.key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} loading={saving} size="lg" className="w-full gap-2">
        <Save className="w-4 h-4" /> Save All Changes
      </Button>
    </div>
  );
}
