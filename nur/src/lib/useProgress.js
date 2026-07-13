import { useState, useEffect, useCallback } from "react";
import { db } from "@/api/apiClient";

import { todayStr } from "@/lib/nurData";

// Bugungi amallar progressi (DailyProgress entity) — Optimistic UI bilan
export function useProgress() {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const date = todayStr();
      const existing = await db.entities.DailyProgress.filter({ date });
      let rec = existing[0];
      if (!rec) {
        rec = await db.entities.DailyProgress.create({ date, prayers: [], quran_read: false, zikr_count: 0 });
      }
      setProgress(rec);
    } catch (err) {
      console.error("Failed to load daily progress:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic: lokal holatni darhol yangilaymiz, keyin serverga yuboramiz
  const update = async (changes) => {
    if (!progress) return;
    const prev = progress;
    // Darhol UI yangilash
    setProgress({ ...progress, ...changes });
    try {
      const updated = await db.entities.DailyProgress.update(progress.id, changes);
      setProgress(updated);
      return updated;
    } catch (err) {
      // Xatolik bo'lsa, eski holatga qaytamiz
      setProgress(prev);
      throw err;
    }
  };

  const togglePrayer = async (name) => {
    if (!progress) return;
    const has = (progress.prayers || []).includes(name);
    const prayers = has
      ? progress.prayers.filter((p) => p !== name)
      : [...(progress.prayers || []), name];
    return update({ prayers });
  };

  const addZikr = async (n = 1) => {
    if (!progress) return;
    return update({ zikr_count: (progress.zikr_count || 0) + n });
  };

  return { progress, loading, update, togglePrayer, addZikr, reload: load };
}