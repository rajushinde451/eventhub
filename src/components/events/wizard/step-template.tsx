"use client";

import { TEMPLATE_CONFIG, type EventTemplate } from "@/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepTemplateProps {
  value: EventTemplate;
  onChange: (template: EventTemplate) => void;
}

export function StepTemplate({ value, onChange }: StepTemplateProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Choose a Template</h2>
        <p className="text-muted-foreground mt-1">Pick the type of event you&apos;re creating</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {(Object.entries(TEMPLATE_CONFIG) as [EventTemplate, typeof TEMPLATE_CONFIG[EventTemplate]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "relative rounded-2xl p-5 text-left transition-all border-2 group",
              value === key
                ? "border-primary shadow-lg shadow-primary/20"
                : "border-transparent hover:border-primary/30"
            )}
          >
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${config.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />

            {value === key && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}

            <div className="relative space-y-2">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-2xl`}>
                {config.emoji}
              </div>
              <div>
                <p className="font-semibold">{config.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
