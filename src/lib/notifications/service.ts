"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationPayload, NotificationResult, ReminderSchedule } from "./types";
import type { NotificationChannel, NotificationType } from "@/types";

/**
 * NotificationService — provider-agnostic abstraction layer.
 *
 * Actual provider integrations (WhatsApp Business, Twilio, Gupshup, Interakt)
 * are intentionally left as stubs. Wire them in when API credentials are ready.
 */

// ─── Provider Stubs ──────────────────────────────────────────────────────────

async function sendViaWhatsAppBusiness(payload: NotificationPayload): Promise<NotificationResult> {
  // TODO: Integrate WhatsApp Business API (Meta Cloud API)
  // POST https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages
  console.log("[WhatsApp Business] Would send to:", payload.recipientPhone);
  return { success: false, error: "Provider not configured" };
}

async function sendViaTwilio(payload: NotificationPayload): Promise<NotificationResult> {
  // TODO: Integrate Twilio SDK
  // const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  console.log("[Twilio] Would send to:", payload.recipientPhone);
  return { success: false, error: "Provider not configured" };
}

async function sendViaGupshup(payload: NotificationPayload): Promise<NotificationResult> {
  // TODO: Integrate Gupshup API
  console.log("[Gupshup] Would send to:", payload.recipientPhone);
  return { success: false, error: "Provider not configured" };
}

async function sendViaInterakt(payload: NotificationPayload): Promise<NotificationResult> {
  // TODO: Integrate Interakt API
  console.log("[Interakt] Would send to:", payload.recipientPhone);
  return { success: false, error: "Provider not configured" };
}

// ─── Core Service ─────────────────────────────────────────────────────────────

export async function sendNotification(
  payload: NotificationPayload,
  channel: NotificationChannel = "whatsapp"
): Promise<NotificationResult> {
  let result: NotificationResult;

  switch (channel) {
    case "whatsapp":
      result = await sendViaWhatsAppBusiness(payload);
      break;
    case "sms":
      result = await sendViaTwilio(payload);
      break;
    default:
      result = { success: false, error: `Channel ${channel} not implemented` };
  }

  return result;
}

export async function logNotification(params: {
  eventId: string;
  rsvpId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  provider?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  result: NotificationResult;
}): Promise<void> {
  const supabase = await createClient();

  await supabase.from("notification_logs").insert({
    event_id: params.eventId,
    rsvp_id: params.rsvpId,
    type: params.type,
    channel: params.channel,
    provider: params.provider,
    recipient_phone: params.recipientPhone,
    recipient_email: params.recipientEmail,
    status: params.result.success ? "sent" : "failed",
    error_message: params.result.error,
    sent_at: params.result.success ? new Date().toISOString() : null,
  });
}

export async function scheduleEventReminders(schedule: ReminderSchedule): Promise<void> {
  const supabase = await createClient();

  const reminders = schedule.recipients.map((recipient) => ({
    event_id: schedule.eventId,
    rsvp_id: recipient.rsvpId,
    type: schedule.type,
    scheduled_at: schedule.scheduledAt.toISOString(),
    status: "pending" as const,
  }));

  await supabase.from("reminders").insert(reminders);
}

export async function buildReminderSchedules(eventId: string, eventDate: Date): Promise<void> {
  const supabase = await createClient();

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("id, name, phone, email")
    .eq("event_id", eventId)
    .eq("status", "attending");

  if (!rsvps?.length) return;

  const recipients = rsvps.map((r) => ({
    rsvpId: r.id,
    name: r.name,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
  }));

  const schedules: ReminderSchedule[] = [];

  const sevenDaysBefore = new Date(eventDate);
  sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
  if (sevenDaysBefore > new Date()) {
    schedules.push({ eventId, type: "7_days", scheduledAt: sevenDaysBefore, recipients });
  }

  const oneDayBefore = new Date(eventDate);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);
  if (oneDayBefore > new Date()) {
    schedules.push({ eventId, type: "1_day", scheduledAt: oneDayBefore, recipients });
  }

  const eventDay = new Date(eventDate);
  eventDay.setHours(8, 0, 0, 0);
  if (eventDay > new Date()) {
    schedules.push({ eventId, type: "event_day", scheduledAt: eventDay, recipients });
  }

  for (const schedule of schedules) {
    await scheduleEventReminders(schedule);
  }
}
