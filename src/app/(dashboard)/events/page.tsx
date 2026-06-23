import Link from "next/link";
import { PlusCircle, CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyEvents } from "@/app/actions/events";
import { formatEventDate, isEventPast, daysUntilEvent, pluralize } from "@/lib/utils";
import { TEMPLATE_CONFIG } from "@/types";
import type { Event } from "@/types";

function EventRow({ event }: { event: Event }) {
  const config = TEMPLATE_CONFIG[event.template];
  const past = isEventPast(event.date);
  const days = daysUntilEvent(event.date);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl border bg-card hover:bg-accent/30 transition-colors">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-xl shrink-0`}>
        {config.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <h3 className="font-semibold truncate">{event.title}</h3>
          <Badge variant={event.published ? "success" : "secondary"}>
            {event.published ? "Live" : "Draft"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatEventDate(event.date)}
          </span>
          {!past && days >= 0 && (
            <span className="text-primary font-medium">
              {days === 0 ? "Today!" : `${days} ${pluralize(days, "day")} to go`}
            </span>
          )}
          {past && <span className="text-muted-foreground">Completed</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Link href={`/events/${event.id}`}>
          <Button variant="outline" size="sm">Manage</Button>
        </Link>
        {event.published && (
          <Link href={`/event/${event.slug}`} target="_blank">
            <Button size="sm">View</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default async function EventsPage() {
  const events = await getMyEvents();
  const published = events.filter(e => e.published);
  const drafts = events.filter(e => !e.published);

  return (
    <div className="space-y-8 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground mt-1">{events.length} total events</p>
        </div>
        <Link href="/events/create">
          <Button variant="gradient" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-16 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-6">Create your first event and start collecting RSVPs</p>
          <Link href="/events/create">
            <Button variant="gradient" size="lg" className="gap-2">
              <PlusCircle className="w-4 h-4" />
              Create Your First Event
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {published.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Live Events ({published.length})
              </h2>
              <div className="space-y-2">
                {published.map(e => <EventRow key={e.id} event={e} />)}
              </div>
            </div>
          )}

          {drafts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                Drafts ({drafts.length})
              </h2>
              <div className="space-y-2">
                {drafts.map(e => <EventRow key={e.id} event={e} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
