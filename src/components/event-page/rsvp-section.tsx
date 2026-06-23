"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle, UserCheck, UserX, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { rsvpSchema, type RSVPInput } from "@/lib/validations";
import { submitRSVP } from "@/app/actions/rsvp";
import { QRPassCard } from "./qr-pass";
import type { Event } from "@/types";

const STATUS_OPTIONS = [
  { value: "attending", label: "Attending", icon: UserCheck, color: "text-green-600", bg: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800" },
  { value: "not_attending", label: "Can't Make It", icon: UserX, color: "text-red-600", bg: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800" },
  { value: "maybe", label: "Maybe", icon: HelpCircle, color: "text-amber-600", bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800" },
] as const;

interface RSVPResult {
  rsvpId: string;
  qrCode: string;
  passCode: string;
  guestName: string;
  status: string;
}

export function RSVPSection({ event }: { event: Event }) {
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<RSVPResult | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<RSVPInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: { status: "attending", guest_count: 1 },
  });

  const status = watch("status");

  async function onSubmit(data: RSVPInput) {
    setLoading(true);
    try {
      const res = await submitRSVP(event.id, {
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        status: data.status,
        guest_count: data.guest_count,
        notes: data.notes || undefined,
      });

      if (res.error) {
        toast.error(res.error);
        return;
      }

      setResult({
        rsvpId: res.data!.rsvpId,
        qrCode: res.data!.qrCode,
        passCode: res.data!.passCode,
        guestName: data.name,
        status: data.status,
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted && result) {
    return (
      <section className="space-y-4" id="rsvp">
        <h2 className="text-2xl font-bold">RSVP</h2>
        <div className="rounded-2xl border bg-card p-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              result.status === "attending" ? "bg-green-100 dark:bg-green-900/30" :
              result.status === "not_attending" ? "bg-red-100 dark:bg-red-900/30" :
              "bg-amber-100 dark:bg-amber-900/30"
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                result.status === "attending" ? "text-green-500" :
                result.status === "not_attending" ? "text-red-500" : "text-amber-500"
              }`} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold">
              {result.status === "attending" ? "You're confirmed!" :
               result.status === "not_attending" ? "Response recorded" :
               "Response saved!"}
            </h3>
            <p className="text-muted-foreground mt-1">
              Thank you, {result.guestName}!
            </p>
          </div>

          {result.status === "attending" && result.qrCode && (
            <QRPassCard
              qrCode={result.qrCode}
              passCode={result.passCode}
              guestName={result.guestName}
              eventTitle={event.title}
              eventDate={event.date}
              venueName={event.venue_name || undefined}
            />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4" id="rsvp">
      <h2 className="text-2xl font-bold">RSVP</h2>
      <div className="rounded-2xl border bg-card p-6 space-y-5">
        <p className="text-muted-foreground">Will you be attending? Let the host know!</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Status selection */}
          <div className="space-y-2">
            <Label>Your Response <span className="text-destructive">*</span></Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => field.onChange(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium",
                        field.value === opt.value
                          ? `${opt.bg} ${opt.color} border-current`
                          : "border-transparent bg-muted hover:border-border"
                      )}
                    >
                      <opt.icon className="w-5 h-5" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name <span className="text-destructive">*</span></Label>
              <Input id="name" placeholder="Priya Sharma" error={errors.name?.message} {...register("name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp / Phone</Label>
              <Input id="phone" placeholder="+91 9876543210" error={errors.phone?.message} {...register("phone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="priya@example.com" error={errors.email?.message} {...register("email")} />
            {errors.email?.message === "Either email or phone is required" && (
              <p className="text-xs text-destructive">Please provide at least email or phone</p>
            )}
          </div>

          {event.enable_guest_count && status === "attending" && (
            <div className="space-y-2">
              <Label htmlFor="guest_count">Number of Guests (including you)</Label>
              <Controller
                name="guest_count"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => field.onChange(Math.max(1, (field.value || 1) - 1))}
                      className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted text-lg font-medium"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{field.value}</span>
                    <button
                      type="button"
                      onClick={() => field.onChange(Math.min(20, (field.value || 1) + 1))}
                      className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-muted text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" placeholder="Any dietary requirements or special notes..." rows={2} {...register("notes")} />
          </div>

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {status === "attending" ? "✅ Confirm Attendance" :
             status === "not_attending" ? "Send Response" :
             "Send Response"}
          </Button>
        </form>
      </div>
    </section>
  );
}
