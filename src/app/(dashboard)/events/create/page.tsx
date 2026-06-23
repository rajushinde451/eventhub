"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TEMPLATE_CONFIG, type EventTemplate } from "@/types";
import { createEvent, uploadEventImage } from "@/app/actions/events";

// Step components
import { StepTemplate } from "@/components/events/wizard/step-template";
import { StepInfo } from "@/components/events/wizard/step-info";
import { StepLocation } from "@/components/events/wizard/step-location";
import { StepGallery } from "@/components/events/wizard/step-gallery";
import { StepSettings } from "@/components/events/wizard/step-settings";
import { StepPublish } from "@/components/events/wizard/step-publish";

export interface WizardData {
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

const STEPS = [
  { id: 1, label: "Template" },
  { id: 2, label: "Details" },
  { id: 3, label: "Location" },
  { id: 4, label: "Gallery" },
  { id: 5, label: "Settings" },
  { id: 6, label: "Publish" },
];

const DEFAULT_DATA: WizardData = {
  template: "housewarming",
  title: "",
  host_name: "",
  description: "",
  date: "",
  start_time: "",
  end_time: "",
  timezone: "Asia/Kolkata",
  venue_name: "",
  address: "",
  map_url: "",
  cover_image: null,
  gallery_files: [],
  enable_rsvp: true,
  enable_guest_count: true,
  enable_wishes: true,
  enable_photo_uploads: false,
};

export default function CreateEventPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const router = useRouter();

  function updateData(updates: Partial<WizardData>) {
    setData((prev) => ({ ...prev, ...updates }));
  }

  function canGoNext(): boolean {
    switch (step) {
      case 1: return !!data.template;
      case 2: return !!data.title && !!data.host_name && !!data.date;
      case 3: return true;
      case 4: return true;
      case 5: return true;
      default: return true;
    }
  }

  async function handleNext() {
    if (step === 5) {
      await handleCreate();
    } else {
      setStep(step + 1);
    }
  }

  async function handleCreate() {
    setSaving(true);
    try {
      // Create event first
      const result = await createEvent({
        template: data.template,
        title: data.title,
        host_name: data.host_name,
        description: data.description,
        date: data.date,
        start_time: data.start_time || undefined,
        end_time: data.end_time || undefined,
        timezone: data.timezone,
        venue_name: data.venue_name || undefined,
        address: data.address || undefined,
        map_url: data.map_url || undefined,
        enable_rsvp: data.enable_rsvp,
        enable_guest_count: data.enable_guest_count,
        enable_wishes: data.enable_wishes,
        enable_photo_uploads: data.enable_photo_uploads,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const eventId = result.data!.id;
      const slug = result.data!.slug;

      // Upload images
      if (data.cover_image) {
        const coverResult = await uploadEventImage(eventId, data.cover_image, "cover");
        if (!coverResult.error && coverResult.data) {
          // Update cover image on event
          const { updateEvent } = await import("@/app/actions/events");
          await updateEvent(eventId, { cover_image_url: coverResult.data.url });
        }
      }

      for (const file of data.gallery_files) {
        await uploadEventImage(eventId, file, "gallery");
      }

      setCreatedEventId(eventId);
      setCreatedSlug(slug);
      setStep(6);
      toast.success("Event created successfully!");
    } finally {
      setSaving(false);
    }
  }

  const progress = (step / STEPS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in">
      <div>
        <h1 className="text-3xl font-bold">Create New Event</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to create your event page</p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Step {step} of {STEPS.length}</span>
          <span className="text-muted-foreground">{STEPS[step - 1]?.label}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="hidden sm:flex gap-1">
          {STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => s.id < step && setStep(s.id)}
              className={cn(
                "flex-1 py-1.5 text-xs rounded-md transition-all",
                s.id === step ? "bg-primary text-primary-foreground font-medium" :
                s.id < step ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30" :
                "bg-muted text-muted-foreground"
              )}
            >
              {s.id < step ? <Check className="w-3 h-3 mx-auto" /> : s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border bg-card p-6 md:p-8 min-h-[400px]">
        {step === 1 && <StepTemplate value={data.template} onChange={(t) => updateData({ template: t })} />}
        {step === 2 && <StepInfo data={data} onChange={updateData} />}
        {step === 3 && <StepLocation data={data} onChange={updateData} />}
        {step === 4 && <StepGallery data={data} onChange={updateData} />}
        {step === 5 && <StepSettings data={data} onChange={updateData} />}
        {step === 6 && createdEventId && createdSlug && (
          <StepPublish eventId={createdEventId} slug={createdSlug} />
        )}
      </div>

      {/* Navigation */}
      {step < 6 && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canGoNext() || saving}
            loading={saving}
            className="gap-2"
          >
            {step === 5 ? "Create Event" : "Next"}
            {step < 5 && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
