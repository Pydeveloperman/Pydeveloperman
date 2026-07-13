import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Search, BookOpen } from "lucide-react";
import { fetchSurahs } from "@/lib/islamicApi";
import { useLastRead } from "@/lib/useLastRead";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import PullRefreshIndicator from "@/components/common/PullRefreshIndicator";
import { Input } from "@/components/ui/input";

export default function SurahList({ onOpen }) {
  const [surahs, setSurahs] = useState(null);
  const [q, setQ] = useState("");
  const { lastRead } = useLastRead();

  const loadSurahs = useCallback(async () => {
    const data = await fetchSurahs();
    setSurahs(data);
  }, []);

  useEffect(() => { loadSurahs(); }, [loadSurahs]);

  const { pullDistance, refreshing } = usePullToRefresh(loadSurahs);

  const filtered = surahs?.filter(
    (s) => s.englishName.toLowerCase().includes(q.toLowerCase()) || String(s.number).includes(q)
  ) || [];

  if (!surahs) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-xs text-muted-foreground">Suralar ro'yxati yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PullRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />

      {/* Last Read Bookmark Shortcut */}
      {lastRead && (
        <button
          onClick={() => onOpen(lastRead.surahNumber, lastRead.surahName, lastRead.ayahNumber)}
          className="w-full glass rounded-3xl p-4 flex items-center justify-between border-emerald-500/10 hover:border-accent/20 transition text-left"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Oxirgi o'qilgan</p>
              <p className="text-sm font-bold text-white mt-0.5">{lastRead.surahName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{lastRead.ayahNumber}-oyat</p>
            </div>
          </div>
          <span className="text-xs text-accent font-semibold">Davom etish →</span>
        </button>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Sura nomi yoki tartib raqami bo'yicha qidirish..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-10 h-10 border-white/5 bg-white/5 rounded-2xl text-xs text-white"
        />
      </div>

      {/* Surahs Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xs text-muted-foreground">Hech qanday sura topilmadi</p>
          </div>
        ) : (
          filtered.map((s) => (
            <button
              key={s.number}
              onClick={() => onOpen(s.number, s.englishName)}
              className="w-full glass rounded-2xl p-4 flex items-center justify-between hover:border-accent/20 transition text-left border border-transparent"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-full bg-white/5 text-xs font-bold text-muted-foreground flex items-center justify-center">
                  {s.number}
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{s.englishName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.englishNameTranslation} • {s.numberOfAyahs} oyat</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-arabic text-lg text-accent font-medium">{s.name}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-widest">{s.revelationType === "Meccan" ? "Makkiy" : "Madaniy"}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
