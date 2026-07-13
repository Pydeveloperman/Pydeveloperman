import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { ZIKR_LIST } from "@/lib/nurData";

const GOAL = 100;

export default function Tasbih({ zikrCount = 0, onAdd }) {
  const [count, setCount] = useState(0);
  const [zikrIdx, setZikrIdx] = useState(0);
  const zikr = ZIKR_LIST[zikrIdx];

  const tap = () => {
    setCount((c) => c + 1);
    onAdd?.(1);
    
    // Telegram WebApp Haptic Feedback support (impact light)
    if (window.Telegram?.WebApp?.HapticFeedback) {
      try {
        window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
      } catch (e) {
        console.warn("Haptic feedback failed", e);
      }
    } else if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const dailyPct = Math.min(100, (zikrCount / GOAL) * 100);

  return (
    <div className="space-y-4">
      {/* Kunlik maqsad */}
      <div className="glass rounded-3xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">Kunlik zikr maqsadi</span>
          <span className="text-xs font-semibold text-accent">{zikrCount}/{GOAL}</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all" style={{ width: `${dailyPct}%` }} />
        </div>
      </div>

      {/* Zikr tanlash */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {ZIKR_LIST.map((z, i) => (
          <button
            key={i}
            onClick={() => setZikrIdx(i)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
              i === zikrIdx ? "bg-accent text-accent-foreground font-semibold" : "bg-white/5 text-muted-foreground"
            }`}
          >
            {z.translation}
          </button>
        ))}
      </div>

      {/* Tasbih tugma */}
      <button onClick={tap} className="w-full select-none active:scale-[0.98] transition-transform">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-800/60 to-emerald-950/40 border border-accent/20 py-10 flex flex-col items-center">
          <p className="font-arabic text-4xl text-white mb-2">{zikr.arabic}</p>
          <p className="text-xs text-muted-foreground mb-6">{zikr.translation}</p>
          <p className="text-6xl font-bold gold-text tabular-nums">{count}</p>
          <p className="text-xs text-muted-foreground mt-4">Hisoblash uchun bosing</p>
        </div>
      </button>

      <button
        onClick={() => setCount(0)}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground py-2"
      >
        <RotateCcw className="w-4 h-4" /> Nolga qaytarish
      </button>
    </div>
  );
}