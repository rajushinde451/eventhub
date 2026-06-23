import type { NotificationChannel, NotificationType, ReminderType } from "@/types";

export interface NotificationPayload {
  recipientName: string;
  recipientPhone?: string;
  recipientEmail?: string;
  channel: NotificationChannel;
  type: NotificationType;
  eventTitle: string;
  eventDate: string;
  eventTime?: string;
  venueName?: string;
  address?: string;
  qrCodeUrl?: string;
  eventUrl?: string;
  hostName?: string;
}

export interface NotificationProvider {
  name: string;
  send(payload: NotificationPayload): Promise<NotificationResult>;
  isConfigured(): boolean;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ReminderSchedule {
  eventId: string;
  type: ReminderType;
  scheduledAt: Date;
  recipients: Array<{
    rsvpId: string;
    name: string;
    phone?: string;
    email?: string;
  }>;
}

// Provider registry — add real providers here when API keys are available
export type ProviderName = "whatsapp_business" | "twilio" | "gupshup" | "interakt" | "mock";

export interface NotificationConfig {
  defaultChannel: NotificationChannel;
  providers: Partial<Record<ProviderName, { apiKey: string; [key: string]: string }>>;
  enableReminders: boolean;
  reminderSchedule: ReminderType[];
}
