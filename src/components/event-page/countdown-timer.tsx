"use client";

import { useState, useEffect } from "react";
import { differenceInSeconds } from "date-fns";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  const now = new Date();
  const target = new Date(targetDate + "T00:00:00");
  const diff = differenceInSeconds(target, now);

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  return { days, hours, minutes, seconds };
}

export function EventCountdown({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(eventDate));
  const isPast = differenceInSeconds(new Date(eventDate + "T00:00:00"), new Date()) <= 0;

  useEffect(() => {
    if (isPast) return;
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(eventDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [eventDate, isPast]);

  if (isPast) return null;
  if (timeLeft.days > 30) return null; // Only show within 30 days

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Mins", value: timeLeft.minutes },
    { label: "Secs", value: timeLeft.seconds },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Countdown</h2>
      <div className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-950/20 dark:to-pink-950/20 rounded-2xl p-6 border border-violet-100 dark:border-violet-900/30">
        <div className="grid grid-cols-4 gap-3 text-center">
          {units.map((unit) => (
            <div key={unit.label} className="space-y-1">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm">
                <p className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
                  {String(unit.value).padStart(2, "0")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground font-medium">{unit.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
