"use client";

import { MapPin, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WizardData } from "@/app/(dashboard)/events/create/page";

interface StepLocationProps {
  data: WizardData;
  onChange: (updates: Partial<WizardData>) => void;
}

export function StepLocation({ data, onChange }: StepLocationProps) {
  const previewUrl = data.map_url
    ? `https://maps.google.com/maps?q=${encodeURIComponent(data.map_url)}&output=embed`
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Event Location</h2>
        <p className="text-muted-foreground mt-1">Help guests find you easily</p>
      </div>

      <div className="grid gap-5">
        <div className="space-y-2">
          <Label htmlFor="venue_name">Venue Name</Label>
          <Input
            id="venue_name"
            placeholder="The Grand Ballroom, Hotel Taj"
            value={data.venue_name}
            onChange={(e) => onChange({ venue_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Full Address</Label>
          <Textarea
            id="address"
            placeholder="12, Rose Garden Layout, Koramangala, Bangalore – 560034"
            rows={3}
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="map_url" className="flex items-center gap-2">
            Google Maps Link
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Open Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </Label>
          <Input
            id="map_url"
            placeholder="https://maps.app.goo.gl/..."
            value={data.map_url}
            onChange={(e) => onChange({ map_url: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Share the Google Maps link of your venue for guests to get directions
          </p>
        </div>

        {data.venue_name && (
          <div className="rounded-xl overflow-hidden border bg-muted/30 h-48 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="font-medium">{data.venue_name}</p>
              {data.address && <p className="text-sm mt-1">{data.address}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
