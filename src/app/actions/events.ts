"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateSlug } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import type { ActionResult, Event, EventTemplate } from "@/types";
import { buildReminderSchedules } from "@/lib/notifications/service";

export interface CreateEventInput {
  template: EventTemplate;
  title: string;
  host_name: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
  timezone?: string;
  venue_name?: string;
  address?: string;
  map_url?: string;
  enable_rsvp: boolean;
  enable_guest_count: boolean;
  enable_wishes: boolean;
  enable_photo_uploads: boolean;
  cover_image_url?: string;
}

export async function createEvent(input: CreateEventInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const baseSlug = generateSlug(`${input.host_name} ${input.template}`);
  let slug = baseSlug;
  let attempts = 0;

  // Ensure unique slug
  while (attempts < 5) {
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${uuidv4().split("-")[0]}`;
    attempts++;
  }

  const { data, error } = await supabase
    .from("events")
    .insert({
      user_id: user.id,
      title: input.title,
      slug,
      description: input.description,
      template: input.template,
      cover_image: input.cover_image_url,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      timezone: input.timezone || "Asia/Kolkata",
      venue_name: input.venue_name,
      address: input.address,
      map_url: input.map_url,
      host_name: input.host_name,
      enable_rsvp: input.enable_rsvp,
      enable_guest_count: input.enable_guest_count,
      enable_wishes: input.enable_wishes,
      enable_photo_uploads: input.enable_photo_uploads,
      published: false,
    })
    .select("id, slug")
    .single();

  if (error) return { error: error.message };
  return { data: { id: data.id, slug: data.slug } };
}

export async function updateEvent(
  eventId: string,
  input: Partial<CreateEventInput>
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("events")
    .update({
      title: input.title,
      host_name: input.host_name,
      description: input.description,
      date: input.date,
      start_time: input.start_time,
      end_time: input.end_time,
      timezone: input.timezone,
      venue_name: input.venue_name,
      address: input.address,
      map_url: input.map_url,
      enable_rsvp: input.enable_rsvp,
      enable_guest_count: input.enable_guest_count,
      enable_wishes: input.enable_wishes,
      enable_photo_uploads: input.enable_photo_uploads,
      cover_image: input.cover_image_url,
    })
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { data: undefined };
}

export async function publishEvent(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: event, error: fetchError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !event) return { error: "Event not found" };

  const { error } = await supabase
    .from("events")
    .update({ published: true })
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  // Schedule reminders
  await buildReminderSchedules(eventId, new Date(event.date));

  return { data: undefined };
}

export async function unpublishEvent(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("events")
    .update({ published: false })
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { data: undefined };
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  redirect("/events");
}

export async function uploadEventImage(
  eventId: string,
  file: File,
  type: "cover" | "gallery"
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${eventId}/${type}-${uuidv4()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("event-media")
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from("event-media")
    .getPublicUrl(fileName);

  if (type === "gallery") {
    await supabase.from("gallery_images").insert({
      event_id: eventId,
      image_url: publicUrl,
    });
  }

  return { data: { url: publicUrl } };
}

export async function addGalleryImage(
  eventId: string,
  imageUrl: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("gallery_images").insert({
    event_id: eventId,
    image_url: imageUrl,
  });

  if (error) return { error: error.message };
  return { data: undefined };
}

export async function deleteGalleryImage(imageId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("gallery_images")
    .delete()
    .eq("id", imageId);

  if (error) return { error: error.message };
  return { data: undefined };
}

export async function getMyEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("events")
    .select("*, gallery_images(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as Event[]) || [];
}

export async function getEventById(id: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*, gallery_images(*)")
    .eq("id", id)
    .single();

  return data as Event | null;
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*, gallery_images(*)")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  return data as Event | null;
}

export async function getDashboardStats(): Promise<{
  total_events: number;
  total_guests: number;
  total_rsvps: number;
  upcoming_events: number;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { total_events: 0, total_guests: 0, total_rsvps: 0, upcoming_events: 0 };

  const today = new Date().toISOString().split("T")[0];

  const [eventsRes, rsvpsRes, upcomingRes] = await Promise.all([
    supabase.from("events").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase
      .from("rsvps")
      .select("id, guest_count, event_id", { count: "exact" })
      .in(
        "event_id",
        (await supabase.from("events").select("id").eq("user_id", user.id)).data?.map((e) => e.id) || []
      ),
    supabase
      .from("events")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .gte("date", today),
  ]);

  const totalGuests = rsvpsRes.data?.reduce((sum, r) => sum + (r.guest_count || 1), 0) || 0;

  return {
    total_events: eventsRes.count || 0,
    total_rsvps: rsvpsRes.count || 0,
    total_guests: totalGuests,
    upcoming_events: upcomingRes.count || 0,
  };
}
