import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Event } from "@/types";
import { TEMPLATE_CONFIG } from "@/types";

export function EventFooter({ event }: { event: Event }) {
  const config = TEMPLATE_CONFIG[event.template];

  return (
    <footer className={`mt-12 bg-gradient-to-br ${config.gradient} text-white`}>
      <div className="max-w-3xl mx-auto px-4 py-10 text-center space-y-4">
        <div className="text-3xl">{config.emoji}</div>
        <h2 className="text-xl font-bold">{event.title}</h2>
        {event.host_name && (
          <p className="text-white/80">Hosted by {event.host_name}</p>
        )}
        <div className="pt-4 border-t border-white/20">
          <p className="text-white/60 text-sm">Created with</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white font-semibold mt-1 hover:text-white/80 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            EventHub
          </Link>
        </div>
      </div>
    </footer>
  );
}
