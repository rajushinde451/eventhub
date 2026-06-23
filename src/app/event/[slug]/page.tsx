import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/app/actions/events";
import { getEventWishes } from "@/app/actions/wishes";
import { EventHero } from "@/components/event-page/hero-section";
import { EventGallery } from "@/components/event-page/gallery-section";
import { EventLocation } from "@/components/event-page/location-section";
import { EventCountdown } from "@/components/event-page/countdown-timer";
import { RSVPSection } from "@/components/event-page/rsvp-section";
import { WishesSection } from "@/components/event-page/wishes-section";
import { CalendarButtons } from "@/components/event-page/calendar-buttons";
import { EventFooter } from "@/components/event-page/event-footer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Event Not Found" };

  const description = event.description || `${event.title} by ${event.host_name}`;

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.cover_image ? [{ url: event.cover_image }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: event.cover_image ? [event.cover_image] : [],
    },
  };
}

export default async function PublicEventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [event, wishes] = await Promise.all([
    getEventBySlug(slug),
    getEventBySlug(slug).then(async (e) =>
      e ? getEventWishes(e.id, false) : []
    ),
  ]);

  if (!event) notFound();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <EventHero event={event} />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-12">
        {/* About */}
        {event.description && (
          <section className="space-y-3">
            <h2 className="text-2xl font-bold">About the Event</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{event.description}</p>
          </section>
        )}

        {/* Countdown */}
        <EventCountdown eventDate={event.date} />

        {/* Gallery */}
        {event.gallery_images && event.gallery_images.length > 0 && (
          <EventGallery images={event.gallery_images} />
        )}

        {/* Location */}
        {(event.venue_name || event.address) && (
          <EventLocation event={event} />
        )}

        {/* Add to Calendar */}
        <CalendarButtons event={event} />

        {/* RSVP */}
        {event.enable_rsvp && (
          <RSVPSection event={event} />
        )}

        {/* Wishes */}
        {event.enable_wishes && (
          <WishesSection eventId={event.id} wishes={wishes} />
        )}
      </div>

      <EventFooter event={event} />
    </div>
  );
}
