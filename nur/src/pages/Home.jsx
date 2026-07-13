import React from "react";
import { Moon } from "lucide-react";
import PrayerTimes from "@/components/home/PrayerTimes";
import AyahBanner from "@/components/home/AyahBanner";
import DailyLesson from "@/components/home/DailyLesson";
import HadithOfDay from "@/components/home/HadithOfDay";
import PrayerReminderToggle from "@/components/home/PrayerReminderToggle";
import { Link } from "react-router-dom";
import { Sparkles, PlayCircle } from "lucide-react";
import { useProgress } from "@/lib/useProgress";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { progress, togglePrayer } = useProgress();
  const { user } = useAuth();

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Xayrli tong";
    if (h < 18) return "Xayrli kun";
    return "Xayrli oqshom";
  })();

  const userName = user?.full_name || "Mehmon";

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{greeting}, {userName}</p>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="gold-text">✦ Nur</span>
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
          <Moon className="w-5 h-5 text-accent" />
        </div>
      </header>

      <PrayerReminderToggle />
      <PrayerTimes progress={progress} onTogglePrayer={togglePrayer} />
      <DailyLesson />
      <AyahBanner />
      <HadithOfDay />

      <Link to="/media" className="block glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
        <span className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-emerald-400" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Islomiy media</p>
          <p className="text-xs text-muted-foreground">Videolar va audiolar</p>
        </div>
      </Link>

      <Link to="/asma-ul-husna" className="block glass rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform">
        <span className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-accent" />
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Asma-ul-Husna</p>
          <p className="text-xs text-muted-foreground">Allohning 99 go'zal ismlari</p>
        </div>
      </Link>
    </div>
  );
}
