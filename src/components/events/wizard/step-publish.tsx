"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, Globe, Share2, Copy, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateShareUrl } from "@/lib/utils";
import { publishEvent } from "@/app/actions/events";

interface StepPublishProps {
  eventId: string;
  slug: string;
}

export function StepPublish({ eventId, slug }: StepPublishProps) {
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const router = useRouter();
  const shareUrl = generateShareUrl(slug);

  async function handlePublish() {
    setPublishing(true);
    try {
      const result = await publishEvent(eventId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setPublished(true);
      toast.success("Your event is now live!");
    } finally {
      setPublishing(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  }

  function shareOnWhatsApp() {
    const text = encodeURIComponent(`You're invited! View the event: ${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
          published ? "bg-green-100 dark:bg-green-900/30" : "bg-violet-100 dark:bg-violet-900/30"
        }`}>
          <CheckCircle className={`w-10 h-10 ${published ? "text-green-500" : "text-violet-500"}`} />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">
          {published ? "Your event is live! 🎉" : "Almost there!"}
        </h2>
        <p className="text-muted-foreground mt-2">
          {published
            ? "Share your event link with guests"
            : "Your event page has been created. Publish it to start collecting RSVPs."}
        </p>
      </div>

      {/* Share link */}
      <div className="flex gap-2 max-w-md mx-auto">
        <Input value={shareUrl} readOnly className="text-xs" />
        <Button variant="outline" size="icon" onClick={copyLink}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        {!published && (
          <Button
            size="lg"
            onClick={handlePublish}
            loading={publishing}
            variant="gradient"
            className="gap-2 w-full sm:w-auto"
          >
            <Globe className="w-4 h-4" />
            Publish Event
          </Button>
        )}

        {published && (
          <>
            <Button size="lg" onClick={shareOnWhatsApp} className="gap-2 bg-green-500 hover:bg-green-600 text-white w-full sm:w-auto">
              <Share2 className="w-4 h-4" />
              Share on WhatsApp
            </Button>
            <Link href={`/event/${slug}`} target="_blank" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="gap-2 w-full">
                <ExternalLink className="w-4 h-4" />
                Preview Event
              </Button>
            </Link>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link href={`/events/${eventId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Manage Event
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
