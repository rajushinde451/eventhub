"use server";

import { createClient } from "@/lib/supabase/server";
import { rsvpSchema } from "@/lib/validations";
import { v4 as uuidv4 } from "uuid";
import type { ActionResult, RSVP } from "@/types";
import { generateVisitorPass } from "@/lib/gate-integration/service";

export async function submitRSVP(
  eventId: string,
  formData: {
    name: string;
    email?: string;
    phone?: string;
    status: "attending" | "not_attending" | "maybe";
    guest_count?: number;
    notes?: string;
  }
): Promise<ActionResult<{ rsvpId: string; qrCode: string; passCode: string }>> {
  const parsed = rsvpSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();

  // Check for duplicate
  const { data: existing } = await supabase
    .from("rsvps")
    .select("id, qr_codes(code)")
    .eq("event_id", eventId)
    .or(
      [
        parsed.data.email ? `email.eq.${parsed.data.email}` : null,
        parsed.data.phone ? `phone.eq.${parsed.data.phone}` : null,
      ]
        .filter(Boolean)
        .join(",")
    )
    .single();

  if (existing) {
    const qrCode = (existing as any).qr_codes?.[0]?.code || "";
    return { data: { rsvpId: existing.id, qrCode, passCode: "" } };
  }

  const { data: rsvp, error: rsvpError } = await supabase
    .from("rsvps")
    .insert({
      event_id: eventId,
      name: parsed.data.name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      status: parsed.data.status,
      guest_count: parsed.data.guest_count || 1,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (rsvpError) return { error: rsvpError.message };

  // Generate QR code
  const qrCode = `EVH-QR-${uuidv4().replace(/-/g, "").substring(0, 12).toUpperCase()}`;
  await supabase.from("qr_codes").insert({
    event_id: eventId,
    rsvp_id: rsvp.id,
    code: qrCode,
  });

  // Generate visitor pass if attending
  let passCode = "";
  if (parsed.data.status === "attending") {
    const { data: event } = await supabase
      .from("events")
      .select("date, title, venue_name, host_name")
      .eq("id", eventId)
      .single();

    if (event) {
      const eventDate = new Date(event.date);
      const validUntil = new Date(eventDate);
      validUntil.setDate(validUntil.getDate() + 1);

      const result = await generateVisitorPass({
        eventId,
        rsvpId: rsvp.id,
        visitorName: parsed.data.name,
        visitorPhone: parsed.data.phone,
        validFrom: eventDate,
        validUntil,
        eventTitle: (event as any).title,
        venueName: (event as any).venue_name || undefined,
        hostName: (event as any).host_name || undefined,
        guestCount: parsed.data.guest_count,
      });
      passCode = result.passCode;
    }
  }

  return { data: { rsvpId: rsvp.id, qrCode, passCode } };
}

export async function getEventRSVPs(eventId: string): Promise<RSVP[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rsvps")
    .select("*, qr_codes(*)")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  return (data as RSVP[]) || [];
}

export async function updateRSVPStatus(
  rsvpId: string,
  status: "attending" | "not_attending" | "maybe"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("rsvps")
    .update({ status })
    .eq("id", rsvpId);

  if (error) return { error: error.message };
  return { data: undefined };
}

export async function checkInGuest(
  qrCode: string
): Promise<ActionResult<{ guestName: string; eventTitle: string; guestCount: number }>> {
  const supabase = await createClient();

  const { data: qr } = await supabase
    .from("qr_codes")
    .select("*, rsvps(name, guest_count, checked_in), events(title, user_id)")
    .eq("code", qrCode)
    .single();

  if (!qr) return { error: "Invalid QR code" };
  if (qr.checked_in) return { error: "Guest already checked in" };

  await supabase
    .from("qr_codes")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", qr.id);

  await supabase
    .from("rsvps")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", qr.rsvp_id);

  return {
    data: {
      guestName: (qr as any).rsvps?.name || "Guest",
      eventTitle: (qr as any).events?.title || "Event",
      guestCount: (qr as any).rsvps?.guest_count || 1,
    },
  };
}

export async function exportGuestListCSV(eventId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rsvps")
    .select("name, email, phone, status, guest_count, notes, checked_in, created_at")
    .eq("event_id", eventId)
    .order("created_at");

  if (!data) return "";

  const headers = ["Name", "Email", "Phone", "Status", "Guests", "Notes", "Checked In", "RSVP Date"];
  const rows = data.map((r) => [
    r.name,
    r.email || "",
    r.phone || "",
    r.status,
    r.guest_count,
    r.notes || "",
    r.checked_in ? "Yes" : "No",
    new Date(r.created_at).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return csv;
}
