import { MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types";

export function EventLocation({ event }: { event: Event }) {
  const directionsUrl = event.map_url
    || `https://maps.google.com/maps?q=${encodeURIComponent([event.venue_name, event.address].filter(Boolean).join(", "))}`;

  const embedUrl = event.map_url
    ? `https://maps.google.com/maps?q=${encodeURIComponent(event.address || event.venue_name || "")}&output=embed`
    : null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Location</h2>
      <div className="rounded-2xl border overflow-hidden">
        {/* Map embed */}
        <div className="h-48 bg-muted flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Event Location"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 text-primary" />
              <p className="font-medium">{event.venue_name}</p>
            </div>
          )}
        </div>

        <div className="p-4 flex items-center justify-between gap-4">
          <div>
            {event.venue_name && <p className="font-semibold">{event.venue_name}</p>}
            {event.address && <p className="text-sm text-muted-foreground mt-1">{event.address}</p>}
          </div>
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <Navigation className="w-4 h-4" />
              Directions
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
