import { useState, useEffect } from "react";

// "Oxirgi o'qilgan joy" - localStorage
const KEY = "nur_last_read";

export function useLastRead() {
  const [lastRead, setLastRead] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLastRead(JSON.parse(raw));
    } catch (e) { /* ignore */ }
  }, []);

  const save = (surah, name, ayah) => {
    const val = { surah, name, ayah, at: Date.now() };
    setLastRead(val);
    localStorage.setItem(KEY, JSON.stringify(val));
  };

  return { lastRead, save };
}