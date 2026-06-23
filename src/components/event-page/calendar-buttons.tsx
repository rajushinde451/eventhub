"use client";

import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateGoogleCalendarUrl } from "@/lib/utils";
import type { Event } from "@/types";

export function CalendarButtons({ event }: { event: Event }) {
  function downloadICS() {
    const startDate = event.date.replace(/-/g, "");
    const startTime = event.start_time ? event.start_time.replace(/:/g, "") + "00" : "000000";
    const endTime = event.end_time ? event.end_time.replace(/:/g, "") + "00" : startTime;
    const location = [event.venue_name, event.address].filter(Boolean).join(", ");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//EventHub//EventHub//EN",
      "BEGIN:VEVENT",
      `DTSTART:${startDate}T${startTime}`,
      `DTEND:${startDate}T${endTime}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ""}`,
      `LOCATION:${location}`,
      `ORGANIZER:CN=${event.host_name || "Host"}`,
      `UID:${event.id}@eventhub`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.slug}.ics`;
    a.click();
  }

  const gcalUrl = generateGoogleCalendarUrl({
    title: event.title,
    date: event.date,
    start_time: event.start_time,
    end_time: event.end_time,
    venue_name: event.venue_name,
    address: event.address,
    description: event.description,
  });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Add to Calendar</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <a href={gcalUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button variant="outline" className="w-full gap-2">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3H18V1.5h-1.5V3h-9V1.5H6V3H4.5C3.675 3 3 3.675 3 4.5v15C3 20.325 3.675 21 4.5 21h15c.825 0 1.5-.675 1.5-1.5v-15C21 3.675 20.325 3 19.5 3zM4.5 19.5v-12h15l.001 12H4.5z" />
              <path d="M7.5 10.5h2.25V12H7.5zm3.75 0h2.25V12H11.25zm3.75 0H17.25V12H15zm-7.5 3h2.25v1.5H7.5zm3.75 0h2.25v1.5H11.25zm3.75 0H17.25v1.5H15zm-7.5 3h2.25v1.5H7.5zm3.75 0h2.25v1.5H11.25z" />
            </svg>
            Google Calendar
          </Button>
        </a>
        <Button variant="outline" className="flex-1 gap-2" onClick={downloadICS}>
          <Calendar className="w-4 h-4" />
          Download .ICS
          <span className="text-xs text-muted-foreground">(Outlook, Apple)</span>
        </Button>
      </div>
    </section>
  );
}
