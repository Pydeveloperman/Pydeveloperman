import React, { useState, useEffect } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { db } from "@/api/apiClient";

import { dayIndex, DAILY_LESSONS } from "@/lib/nurData";

export default function HadithOfDay() {
  const [hadith, setHadith] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const items = await db.entities.Content.filter({ type: "hadith", is_active: true }, "-created_date", 50);
        if (items.length > 0) {
          setHadith(items[dayIndex(items.length)]);
        } else {
          // fallback to lessons
          setHadith({ arabic: "", translation: DAILY_LESSONS[dayIndex(DAILY_LESSONS.length)], ref: "Ibrat" });
        }
      } catch {
        setHadith({ arabic: "", translation: DAILY_LESSONS[dayIndex(DAILY_LESSONS.length)], ref: "Ibrat" });
      }
    })();
  }, []);

  if (!hadith) {
    return <div className="glass rounded-3xl p-6 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-accent" /></div>;
  }

  return (
    <div className="glass rounded-3xl p-5 space-y-3">
      <div className="flex items-center gap-2 text-accent">
        <BookOpen className="w-4 h-4" />
        <h2 className="text-sm font-semibold text-left">Kun hadisi</h2>
      </div>
      <div className="space-y-2 text-left">
        {hadith.arabic && (
          <p className="font-arabic text-lg text-right leading-loose text-white">{hadith.arabic}</p>
        )}
        <p className="text-xs text-foreground/85 leading-relaxed">{hadith.translation}</p>
        {hadith.ref && (
          <p className="text-[10px] text-muted-foreground text-right">— {hadith.ref}</p>
        )}
      </div>
    </div>
  );
}
