import Link from "next/link";
import { PlusCircle, CalendarDays, Users, CheckSquare, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardStats, getMyEvents } from "@/app/actions/events";
import { formatEventDate, isEventPast, daysUntilEvent, pluralize } from "@/lib/utils";
import { TEMPLATE_CONFIG } from "@/types";
import type { Event } from "@/types";

function EventCard({ event }: { event: Event }) {
  const config = TEMPLATE_CONFIG[event.template];
  const past = isEventPast(event.date);
  const days = daysUntilEvent(event.date);

  return (
    <div className="card-hover rounded-2xl border bg-card overflow-hidden">
      {/* Gradient header */}
      <div className={`h-24 bg-gradient-to-br ${config.gradient} relative flex items-center px-5`}>
        <span className="text-4xl">{config.emoji}</span>
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge variant={event.published ? "success" : "secondary"} className="text-xs">
            {event.published ? "Live" : "Draft"}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="font-semibold truncate">{event.title}</h3>
          <p className="text-sm text-muted-foreground">{event.host_name}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="w-4 h-4 shrink-0" />
          <span>{formatEventDate(event.date)}</span>
        </div>
        {!past && event.published && days >= 0 && (
          <p className="text-xs font-medium text-primary">
            {days === 0 ? "Today!" : `${days} ${pluralize(days, "day")} to go`}
          </p>
        )}
        {past && <p className="text-xs text-muted-foreground">Event completed</p>}

        <div className="flex gap-2 pt-1">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">Manage</Button>
          </Link>
          {event.published && (
            <Link href={`/event/${event.slug}`} target="_blank" className="flex-1">
              <Button size="sm" className="w-full">View</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [stats, events] = await Promise.all([
    getDashboardStats(),
    getMyEvents(),
  ]);

  const recentEvents = events.slice(0, 6);

  const statCards = [
    { title: "Total Events", value: stats.total_events, icon: CalendarDays, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
    { title: "Total RSVPs", value: stats.total_rsvps, icon: CheckSquare, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
    { title: "Total Guests", value: stats.total_guests, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { title: "Upcoming Events", value: stats.upcoming_events, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
  ];

  return (
    <div className="space-y-8 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your events and guests</p>
        </div>
        <Link href="/events/create">
          <Button variant="gradient" className="gap-2 shadow-md shadow-violet-500/20">
            <PlusCircle className="w-4 h-4" />
            Create Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-3xl font-bold mt-1">{card.value.toLocaleString()}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Events section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Events</h2>
          {events.length > 6 && (
            <Link href="/events">
              <Button variant="ghost" size="sm" className="gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/20 p-16 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-6">Create your first event in minutes — it&apos;s free!</p>
            <Link href="/events/create">
              <Button variant="gradient" size="lg" className="gap-2">
                <PlusCircle className="w-4 h-4" />
                Create Your First Event
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
