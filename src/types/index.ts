export type EventTemplate =
  | "housewarming"
  | "wedding"
  | "birthday"
  | "engagement"
  | "anniversary"
  | "naming_ceremony"
  | "corporate";

export type RSVPStatus = "attending" | "not_attending" | "maybe";
export type NotificationChannel = "whatsapp" | "sms" | "email" | "push";
export type NotificationType = "rsvp_confirmation" | "reminder" | "qr_pass" | "custom";
export type ReminderType = "7_days" | "1_day" | "event_day" | "custom";
export type GateProvider = "mygate" | "nobrokerhood" | "manual";

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string | null;
  template: EventTemplate;
  cover_image: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  timezone: string;
  venue_name: string | null;
  address: string | null;
  map_url: string | null;
  host_name: string | null;
  enable_rsvp: boolean;
  enable_guest_count: boolean;
  enable_wishes: boolean;
  enable_photo_uploads: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  gallery_images?: GalleryImage[];
  rsvps?: RSVP[];
}

export interface GalleryImage {
  id: string;
  event_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface RSVP {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: RSVPStatus;
  guest_count: number;
  notes: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
  updated_at: string;
  qr_codes?: QRCode[];
}

export interface Wish {
  id: string;
  event_id: string;
  name: string;
  message: string;
  approved: boolean;
  created_at: string;
}

export interface QRCode {
  id: string;
  event_id: string;
  rsvp_id: string;
  code: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export interface Reminder {
  id: string;
  event_id: string;
  rsvp_id: string | null;
  type: ReminderType;
  scheduled_at: string;
  sent_at: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  created_at: string;
}

export interface NotificationLog {
  id: string;
  event_id: string;
  rsvp_id: string | null;
  type: NotificationType;
  channel: NotificationChannel;
  provider: string | null;
  recipient_phone: string | null;
  recipient_email: string | null;
  status: "pending" | "sent" | "delivered" | "failed";
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface VisitorPass {
  id: string;
  event_id: string;
  rsvp_id: string;
  pass_code: string;
  visitor_name: string;
  vehicle_number: string | null;
  valid_from: string;
  valid_until: string;
  status: "active" | "used" | "expired" | "cancelled";
  provider: GateProvider;
  external_pass_id: string | null;
  pdf_url: string | null;
  created_at: string;
}

// Form types for event creation wizard
export interface EventWizardData {
  template: EventTemplate;
  title: string;
  host_name: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  venue_name: string;
  address: string;
  map_url: string;
  cover_image: File | null;
  gallery_files: File[];
  enable_rsvp: boolean;
  enable_guest_count: boolean;
  enable_wishes: boolean;
  enable_photo_uploads: boolean;
}

// Dashboard stats
export interface DashboardStats {
  total_events: number;
  total_guests: number;
  total_rsvps: number;
  upcoming_events: number;
}

// Action results
export interface ActionResult<T = void> {
  data?: T;
  error?: string;
}

export const TEMPLATE_CONFIG: Record<
  EventTemplate,
  { label: string; emoji: string; color: string; gradient: string; description: string }
> = {
  housewarming: {
    label: "Housewarming",
    emoji: "🏡",
    color: "amber",
    gradient: "from-amber-400 to-orange-500",
    description: "Celebrate your new home with loved ones",
  },
  wedding: {
    label: "Wedding",
    emoji: "💍",
    color: "rose",
    gradient: "from-rose-400 to-pink-600",
    description: "A beautiful celebration of love and togetherness",
  },
  birthday: {
    label: "Birthday",
    emoji: "🎂",
    color: "purple",
    gradient: "from-purple-400 to-violet-600",
    description: "Make your special day unforgettable",
  },
  engagement: {
    label: "Engagement",
    emoji: "💑",
    color: "pink",
    gradient: "from-pink-400 to-rose-500",
    description: "Announce your love to the world",
  },
  anniversary: {
    label: "Anniversary",
    emoji: "💝",
    color: "red",
    gradient: "from-red-400 to-rose-600",
    description: "Celebrate your journey together",
  },
  naming_ceremony: {
    label: "Naming Ceremony",
    emoji: "👶",
    color: "sky",
    gradient: "from-sky-400 to-blue-500",
    description: "Welcome the little one with blessings",
  },
  corporate: {
    label: "Corporate Event",
    emoji: "🏢",
    color: "slate",
    gradient: "from-slate-500 to-gray-700",
    description: "Professional events done right",
  },
};
