import React, { useState, useEffect } from "react";
import { Loader2, MapPin, Check } from "lucide-react";
import { fetchPrayerTimes, getLocation } from "@/lib/islamicApi";
import { schedulePrayerNotifications, clearScheduled } from "@/lib/prayerNotifications";

function parseTime(str) {
  const [h, m] = str.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function findNext(times) {
  const now = new Date();
  for (const t of times) {
    const dt = parseTime(t.time);
    if (dt > now) return { ...t, dt };
  }
  const first = times[0];
  const dt = parseTime(first.time);
  dt.setDate(dt.getDate() + 1);
  return { ...first, dt };
}

export default function PrayerTimes({ progress, onTogglePrayer }) {
  const [times, setTimes] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [next, setNext] = useState(null);

  useEffect(() => {
    (async () => {
      const loc = await getLocation();
      const t = await fetchPrayerTimes(loc.lat, loc.lng);
      setTimes(t);
      schedulePrayerNotifications(t);
    })();
    return () => clearScheduled();
  }, []);

  useEffect(() => {
    if (!times) return;
    const tick = () => {
      const n = findNext(times);
      setNext(n);
      const diff = n.dt - new Date();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [times]);

  if (!times) {
    return (
      <div className="glass rounded-3xl p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  // progress bar: previous -> next
  let pct = 0;
  if (next) {
    const idx = times.findIndex((t) => t.name === next.name);
    const prevDt = idx > 0 ? parseTime(times[idx - 1].time) : parseTime(times[times.length - 1].time);
    const total = next.dt - prevDt;
    const done = new Date() - prevDt;
    pct = Math.max(0, Math.min(100, (done / total) * 100));
  }

  const donePrayers = progress?.prayers || [];

  return (
    <div className="glass rounded-3xl p-5 space-y-4">
      <div className="text-center">
        <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" /> Keyingi namoz
        </p>
        <p className="text-2xl font-bold mt-1">{next?.label}</p>
        <p className="text-4xl font-bold gold-text tabular-nums mt-1 tracking-tight">{countdown}</p>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {times.map((t) => {
          const active = next?.name === t.name;
          const done = donePrayers.includes(t.name);
          return (
            <button
              key={t.name}
              onClick={() => onTogglePrayer?.(t.name)}
              className={`flex flex-col items-center gap-1 py-2.5 px-0.5 rounded-2xl transition-all ${
                active 
                  ? "bg-accent text-accent-foreground ring-1 ring-accent shadow-lg shadow-accent/15 scale-105 z-10" 
                  : "bg-white/5 text-foreground hover:bg-white/10"
              }`}
            >
              <span className={`text-[9px] sm:text-[10px] font-medium uppercase tracking-wider ${active ? "text-accent-foreground/80" : "text-muted-foreground"}`}>{t.label}</span>
              <span className="text-[11px] sm:text-xs font-bold tracking-tighter whitespace-nowrap">{t.time}</span>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${done ? (active ? "bg-accent-foreground text-accent" : "bg-emerald-500 text-white") : (active ? "bg-accent-foreground/10" : "bg-white/10")}`}>
                {done && <Check className="w-2.5 h-2.5 stroke-[3px]" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}