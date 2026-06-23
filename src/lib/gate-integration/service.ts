"use server";

import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";
import type { VisitorPassRequest, GatePassResult, VisitorPassData } from "./types";

// ─── Provider Stubs ───────────────────────────────────────────────────────────

async function createMyGatePass(request: VisitorPassRequest): Promise<GatePassResult> {
  // TODO: Integrate MyGate API
  // POST https://api.mygate.in/v1/visitor-passes
  // Headers: Authorization: Bearer {MYGATE_API_KEY}
  console.log("[MyGate] Would create pass for:", request.visitorName);
  return { success: false, error: "MyGate integration not configured" };
}

async function createNoBrokerHoodPass(request: VisitorPassRequest): Promise<GatePassResult> {
  // TODO: Integrate NoBrokerHood API
  console.log("[NoBrokerHood] Would create pass for:", request.visitorName);
  return { success: false, error: "NoBrokerHood integration not configured" };
}

// ─── Manual PDF Pass Generation ───────────────────────────────────────────────

export async function generateVisitorPass(
  request: VisitorPassRequest & { eventTitle: string; venueName?: string; hostName?: string; guestCount?: number }
): Promise<{ passCode: string; error?: string }> {
  const supabase = await createClient();
  const passCode = `EVH-${uuidv4().split("-")[0].toUpperCase()}`;

  const { error } = await supabase.from("visitor_passes").insert({
    event_id: request.eventId,
    rsvp_id: request.rsvpId,
    pass_code: passCode,
    visitor_name: request.visitorName,
    vehicle_number: request.vehicleNumber,
    valid_from: request.validFrom.toISOString(),
    valid_until: request.validUntil.toISOString(),
    status: "active",
    provider: "manual",
  });

  if (error) {
    // Handle duplicate — return existing pass
    if (error.code === "23505") {
      const { data: existing } = await supabase
        .from("visitor_passes")
        .select("pass_code")
        .eq("event_id", request.eventId)
        .eq("rsvp_id", request.rsvpId)
        .single();
      return { passCode: existing?.pass_code ?? passCode };
    }
    return { passCode: "", error: error.message };
  }

  return { passCode };
}

export async function getVisitorPass(passCode: string): Promise<VisitorPassData | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("visitor_passes")
    .select(`
      *,
      events (title, date, venue_name, host_name),
      rsvps (guest_count)
    `)
    .eq("pass_code", passCode)
    .single();

  if (!data) return null;

  return {
    passCode: data.pass_code,
    visitorName: data.visitor_name,
    eventName: (data as any).events?.title ?? "Event",
    eventDate: (data as any).events?.date ?? "",
    venue: (data as any).events?.venue_name ?? "",
    guestCount: (data as any).rsvps?.guest_count ?? 1,
    hostName: (data as any).events?.host_name ?? undefined,
  };
}

export async function useGateProvider(
  provider: "mygate" | "nobrokerhood",
  request: VisitorPassRequest
): Promise<GatePassResult> {
  switch (provider) {
    case "mygate":
      return createMyGatePass(request);
    case "nobrokerhood":
      return createNoBrokerHoodPass(request);
    default:
      return { success: false, error: "Unknown provider" };
  }
}
