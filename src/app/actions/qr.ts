"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, QRCode } from "@/types";

export async function getQRCodeData(code: string): Promise<{
  qr: QRCode | null;
  rsvp: { name: string; guest_count: number; status: string } | null;
  event: { title: string; date: string; venue_name: string | null } | null;
}> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("qr_codes")
    .select(`
      *,
      rsvps (name, guest_count, status),
      events (title, date, venue_name)
    `)
    .eq("code", code)
    .single();

  if (!data) return { qr: null, rsvp: null, event: null };

  return {
    qr: {
      id: data.id,
      event_id: data.event_id,
      rsvp_id: data.rsvp_id,
      code: data.code,
      checked_in: data.checked_in,
      checked_in_at: data.checked_in_at,
      created_at: data.created_at,
    },
    rsvp: (data as any).rsvps || null,
    event: (data as any).events || null,
  };
}

export async function getEventQRCodes(eventId: string): Promise<
  Array<QRCode & { rsvp_name: string; rsvp_status: string }>
> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("qr_codes")
    .select(`*, rsvps(name, status)`)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return (data || []).map((d) => ({
    ...d,
    rsvp_name: (d as any).rsvps?.name || "Unknown",
    rsvp_status: (d as any).rsvps?.status || "attending",
  }));
}
