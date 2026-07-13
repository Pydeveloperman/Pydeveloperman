import React, { useState, useCallback } from "react";
import { UtensilsCrossed, Plane, HeartPulse, Sunrise, HandHeart, ChevronDown } from "lucide-react";
import { DUA_CATEGORIES } from "@/lib/nurData";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import PullRefreshIndicator from "@/components/common/PullRefreshIndicator";

const ICONS = { UtensilsCrossed, Plane, HeartPulse, Sunrise, HandHeart };

export default function DuaList() {
  const [openCat, setOpenCat] = useState(null);

  const refresh = useCallback(async () => {
    // Statik ma'lumot — qisqa kutish animatsiyasi uchun
    await new Promise((r) => setTimeout(r, 600));
  }, []);

  const { pullDistance, refreshing } = usePullToRefresh(refresh);

  return (
    <div className="space-y-3">
      <PullRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />
      {DUA_CATEGORIES.map((cat) => {
        const Icon = ICONS[cat.icon] || HandHeart;
        const isOpen = openCat === cat.id;
        return (
          <div key={cat.id} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setOpenCat(isOpen ? null : cat.id)}
              className="w-full p-4 flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <Icon className="w-4 h-4 text-accent" />
              </span>
              <span className="flex-1 text-left font-semibold text-sm">{cat.title}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-3">
                {cat.duas.map((d) => (
                  <div key={d.id} className="rounded-xl bg-white/5 p-3">
                    <p className="text-[11px] text-accent font-medium mb-1">{d.title}</p>
                    <p className="font-arabic text-xl text-right leading-loose mb-1">{d.arabic}</p>
                    <p className="text-xs text-foreground/75">{d.translation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}