import Image from "next/image";
import { CalendarDays, Clock, MapPin, User } from "lucide-react";
import { TEMPLATE_CONFIG, type Event } from "@/types";
import { formatEventDate, formatEventTime } from "@/lib/utils";

export function EventHero({ event }: { event: Event }) {
  const config = TEMPLATE_CONFIG[event.template];

  return (
    <div className="relative">
      {/* Cover image or gradient */}
      <div className={`relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-gradient-to-br ${config.gradient}`}>
        {event.cover_image && (
          <Image
            src={event.cover_image}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Event info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-sm mb-3">
              <span>{config.emoji}</span>
              <span>{config.label}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2">{event.title}</h1>
            {event.host_name && (
              <p className="text-white/90 flex items-center gap-2 text-lg">
                <User className="w-4 h-4" />
                Hosted by {event.host_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Event details strip */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex flex-wrap gap-5 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium">{formatEventDate(event.date)}</p>
            </div>
          </div>

          {event.start_time && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time</p>
                <p className="font-medium">
                  {formatEventTime(event.start_time)}
                  {event.end_time && ` – ${formatEventTime(event.end_time)}`}
                </p>
              </div>
            </div>
          )}

          {event.venue_name && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Venue</p>
                <p className="font-medium">{event.venue_name}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
