import React from "react";
import { Sparkles } from "lucide-react";
import { DAILY_LESSONS, dayIndex } from "@/lib/nurData";

export default function DailyLesson() {
  const lesson = DAILY_LESSONS[dayIndex(DAILY_LESSONS.length)];
  return (
    <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-900/50 to-emerald-950/30 border border-accent/10">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="text-sm font-bold gold-text">Kunlik ibrat</h3>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{lesson}</p>
    </div>
  );
}