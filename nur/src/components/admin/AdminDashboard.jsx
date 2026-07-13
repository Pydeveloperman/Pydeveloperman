import React, { useEffect, useState } from "react";
import { Users, BookOpen, Sparkles, TrendingUp } from "lucide-react";
import { db } from "@/api/apiClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const [users, content, progress, fasting, duas] = await Promise.all([
        db.entities.User.list(),
        db.entities.Content.list(),
        db.entities.DailyProgress.list(),
        db.entities.FastingLog.list(),
        db.entities.FavoriteDua.list(),
      ]);
      const today = new Date().toISOString().split("T")[0];
      const todayProgress = progress.filter((p) => p.date === today);
      const prayersToday = todayProgress.reduce((acc, p) => acc + (p.prayers?.length || 0), 0);
      const quranToday = todayProgress.filter((p) => p.quran_read).length;
      const zikrToday = todayProgress.reduce((acc, p) => acc + (p.zikr_count || 0), 0);

      setStats({
        users: users.length,
        content: content.length,
        activeToday: todayProgress.length,
        prayersToday,
        quranToday,
        zikrToday,
      });
    })();
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-lg font-bold text-white">Platforma holati</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Foydalanuvchilar faolligi va umumiy statistika</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Jami a'zolar</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.users}</p>
        </div>

        <div className="glass rounded-3xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Bugun faollar</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">{stats.activeToday}</p>
        </div>

        <div className="glass rounded-3xl p-4 col-span-2 space-y-2">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <span className="text-xs text-muted-foreground font-semibold">Bugungi jami ibodatlar</span>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Namozlar</p>
              <p className="text-sm font-bold text-white mt-0.5">{stats.prayersToday}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Xatmlar</p>
              <p className="text-sm font-bold text-white mt-0.5">{stats.quranToday}</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Zikrlar</p>
              <p className="text-sm font-bold text-white mt-0.5">{stats.zikrToday}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-accent" /> Ma'muriy boshqaruv
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Admin sifatida tizimda faol hadislar, media kontentlar va foydalanuvchilar ro'yxatini boshqara olasiz. Yuqoridagi sahifalar orqali tegishli bo'limlarga o'tib, kontent qo'shishingiz yoki tahrirlashingiz mumkin.
        </p>
      </div>
    </div>
  );
}