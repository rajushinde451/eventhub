import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 60);
}

export function formatEventDate(date: string): string {
  return format(new Date(date), "EEEE, MMMM d, yyyy");
}

export function formatEventTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return format(date, "h:mm a");
}

export function formatTimeAgo(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isEventPast(date: string): boolean {
  return isPast(new Date(date));
}

export function daysUntilEvent(date: string): number {
  return differenceInDays(new Date(date), new Date());
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function generateShareUrl(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/event/${slug}`;
}

export function generateGoogleCalendarUrl(event: {
  title: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  venue_name?: string | null;
  address?: string | null;
  description?: string | null;
}): string {
  const startDate = event.start_time
    ? `${event.date.replace(/-/g, "")}T${event.start_time.replace(/:/g, "")}00`
    : event.date.replace(/-/g, "");

  const endDate = event.end_time
    ? `${event.date.replace(/-/g, "")}T${event.end_time.replace(/:/g, "")}00`
    : event.date.replace(/-/g, "");

  const location = [event.venue_name, event.address].filter(Boolean).join(", ");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startDate}/${endDate}`,
    details: event.description || "",
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "attending":
      return "text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400";
    case "not_attending":
      return "text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400";
    case "maybe":
      return "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-900 dark:text-gray-400";
  }
}
