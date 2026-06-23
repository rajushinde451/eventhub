import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EventNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="text-6xl">🎪</div>
        <div>
          <h1 className="text-3xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground mt-2">
            This event doesn&apos;t exist or may have been unpublished by the host.
          </p>
        </div>
        <Link href="/">
          <Button variant="gradient" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Create Your Own Event
          </Button>
        </Link>
      </div>
    </div>
  );
}
