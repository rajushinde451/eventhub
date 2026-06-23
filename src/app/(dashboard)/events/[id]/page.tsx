import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays, MapPin, Users, MessageSquare, QrCode,
  Settings, ExternalLink, Share2, Globe, Edit, Trash2, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getEventById } from "@/app/actions/events";
import { formatEventDate, formatEventTime, generateShareUrl, pluralize } from "@/lib/utils";
import { TEMPLATE_CONFIG } from "@/types";
import { EventActionsBar } from "@/components/events/event-actions-bar";

export default async function EventOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventById(id);
  if (!event) notFound();

  const supabase = await createClient();

  const [rsvpRes, wishRes, qrRes] = await Promise.all([
    supabase.from("rsvps").select("id, status, guest_count").eq("event_id", id),
    supabase.from("wishes").select("id").eq("event_id", id),
    supabase.from("qr_codes").select("id, checked_in").eq("event_id", id),
  ]);

  const rsvps = rsvpRes.data || [];
  const attending = rsvps.filter((r) => r.status === "attending");
  const totalGuests = attending.reduce((sum, r) => sum + (r.guest_count || 1), 0);
  const checkedIn = (qrRes.data || []).filter((q) => q.checked_in).length;

  const config = TEMPLATE_CONFIG[event.template];
  const shareUrl = generateShareUrl(event.slug);

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl shrink-0`}>
          {config.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <Badge variant={event.published ? "success" : "secondary"}>
              {event.published ? "Live" : "Draft"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{event.host_name}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              {formatEventDate(event.date)}
              {event.start_time && ` · ${formatEventTime(event.start_time)}`}
            </span>
            {event.venue_name && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {event.venue_name}
              </span>
            )}
          </div>
        </div>
        <EventActionsBar event={event} shareUrl={shareUrl} />
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total RSVPs", value: rsvps.length, icon: Users, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-950/30" },
          { label: "Attending", value: attending.length, icon: Users, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950/30" },
          { label: "Total Guests", value: totalGuests, icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Checked In", value: checkedIn, icon: QrCode, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30" },
        ].map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: `/events/${id}/guests`, label: "Manage Guests", icon: Users, desc: `${rsvps.length} RSVPs` },
          { href: `/events/${id}/wishes`, label: "Wishes Wall", icon: MessageSquare, desc: `${wishRes.data?.length || 0} wishes` },
          { href: `/events/${id}/entry`, label: "Entry Management", icon: QrCode, desc: `${checkedIn} checked in` },
          { href: `/events/${id}/edit`, label: "Edit Event", icon: Edit, desc: "Update details" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <Card className="card-hover cursor-pointer h-full">
              <CardContent className="pt-5 pb-4">
                <action.icon className="w-6 h-6 text-primary mb-3" />
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Event info */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About the Event</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm whitespace-pre-line">{event.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Share section */}
      {event.published && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Share Your Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 h-9 rounded-lg border bg-muted px-3 text-sm text-muted-foreground"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => { navigator.clipboard.writeText(shareUrl); }}
              >
                Copy
              </Button>
            </div>
            <div className="flex gap-2">
              <Link href={`/event/${event.slug}`} target="_blank" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-2 text-green-600 border-green-200 hover:bg-green-50"
                onClick={() => {
                  const text = encodeURIComponent(`You're invited! View: ${shareUrl}`);
                  window.open(`https://wa.me/?text=${text}`, "_blank");
                }}
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
