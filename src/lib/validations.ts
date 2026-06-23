import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const eventStep2Schema = z.object({
  title: z.string().min(3, "Event title must be at least 3 characters"),
  host_name: z.string().min(2, "Host name is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Event date is required"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  timezone: z.string().default("Asia/Kolkata"),
});

export const eventStep3Schema = z.object({
  venue_name: z.string().optional(),
  address: z.string().optional(),
  map_url: z.string().url("Invalid map URL").optional().or(z.literal("")),
});

export const eventStep5Schema = z.object({
  enable_rsvp: z.boolean().default(true),
  enable_guest_count: z.boolean().default(true),
  enable_wishes: z.boolean().default(true),
  enable_photo_uploads: z.boolean().default(false),
});

export const rsvpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Enter a valid phone number").optional().or(z.literal("")),
  status: z.enum(["attending", "not_attending", "maybe"]),
  guest_count: z.number().min(1).max(20).default(1),
  notes: z.string().optional(),
}).refine(
  (data) => data.email || data.phone,
  { message: "Either email or phone is required", path: ["email"] }
);

export const wishSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().min(5, "Message must be at least 5 characters").max(500, "Message too long"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type EventStep2Input = z.infer<typeof eventStep2Schema>;
export type EventStep3Input = z.infer<typeof eventStep3Schema>;
export type EventStep5Input = z.infer<typeof eventStep5Schema>;
export type RSVPInput = z.infer<typeof rsvpSchema>;
export type WishInput = z.infer<typeof wishSchema>;
