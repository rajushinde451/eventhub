"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Globe, EyeOff, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publishEvent, unpublishEvent, deleteEvent } from "@/app/actions/events";
import type { Event } from "@/types";

export function EventActionsBar({ event, shareUrl }: { event: Event; shareUrl: string }) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handlePublish() {
    setLoading("publish");
    const result = await publishEvent(event.id);
    if (result.error) toast.error(result.error);
    else toast.success("Event published!");
    setLoading(null);
  }

  async function handleUnpublish() {
    setLoading("unpublish");
    const result = await unpublishEvent(event.id);
    if (result.error) toast.error(result.error);
    else toast.success("Event unpublished");
    setLoading(null);
  }

  async function handleDelete() {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setLoading("delete");
    await deleteEvent(event.id);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {!event.published ? (
        <Button
          size="sm"
          variant="gradient"
          onClick={handlePublish}
          loading={loading === "publish"}
          className="gap-2"
        >
          <Globe className="w-3.5 h-3.5" /> Publish
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={handleUnpublish}
          loading={loading === "unpublish"}
          className="gap-2"
        >
          <EyeOff className="w-3.5 h-3.5" /> Unpublish
        </Button>
      )}
      <Link href={`/events/${event.id}/edit`}>
        <Button size="sm" variant="outline" className="gap-2">
          <Edit className="w-3.5 h-3.5" /> Edit
        </Button>
      </Link>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        loading={loading === "delete"}
        className="gap-2 text-destructive hover:text-destructive"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
