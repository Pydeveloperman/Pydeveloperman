import React, { useEffect, useState } from "react";
import { CheckCircle2, BookOpen, Sparkles, TrendingUp, Calendar } from "lucide-react";
import { db } from "@/api/apiClient";

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABELS = { Fajr: "Bom", Dhuhr: "Pesh", Asr: "Asr", Maghrib: "Shom", Isha: "Xufton" };

export default function UserProgress() {
  const [data, setData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    (async () => {
      const [users, progress, fasting] = await Promise.all([
        db.entities.User.list(),
        db.entities.DailyProgress.list("-date", 500),
        db.entities.FastingLog.list("-date", 500),
      ]);

      const userMap = {};
      users.forEach((u) => {
        userMap[u.id] = {
          user: u,
          totalPrayers: 0,
          totalQuran: 0,
          totalZikr: 0,
          activeDays: new Set(),
          prayerBreakdown: {},
          fastingDays: 0,
          records: [],
        };
        PRAYER_NAMES.forEach((p) => (userMap[u.id].prayerBreakdown[p] = 0));
      });

      progress.forEach((p) => {
        const uid = p.created_by_id;
        if (!userMap[uid]) return;
        const u = userMap[uid];
        u.totalPrayers += (p.prayers || []).length;
        u.totalQuran += p.quran_read ? 1 : 0;
        u.totalZikr += p.zikr_count || 0;
        u.activeDays.add(p.date);
        (p.prayers || []).forEach((pr) => {
          if (u.prayerBreakdown[pr] !== undefined) u.prayerBreakdown[pr]++;
        });
        u.records.push(p);
      });

      fasting.forEach((f) => {
        const uid = f.created_by_id;
        if (!userMap[uid]) return;
        if (f.status === "fasted") userMap[uid].fastingDays++;
      });

      const list = Object.values(userMap)
        .filter((u) => u.activeDays.size > 0)
        .sort((a, b) => b.totalPrayers - a.totalPrayers);

      setData(list);
    })();
  }, []);

  if (!data) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const totals = data.reduce(
    (acc, u) => ({
      prayers: acc.prayers + u.totalPrayers,
      quran: acc.quran + u.totalQuran,
      zikr: acc.zikr + u.totalZikr,
      fasting: acc.fasting + u.fastingDays,
    }),
    { prayers: 0, quran: 0, zikr: 0, fasting: 0 }
  );

  return (
    <div className="space-y-4">
      {/* Umumiy yig'indi */}
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> Umumiy yig'indi ({data.length} foydalanuvchi)
        </p>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
            <p className="text-lg font-bold">{totals.prayers}</p>
            <p className="text-[10px] text-muted-foreground">Namozlar</p>
          </div>
          <div className="text-center">
            <BookOpen className="w-4 h-4 mx-auto text-purple-400 mb-1" />
            <p className="text-lg font-bold">{totals.quran}</p>
            <p className="text-[10px] text-muted-foreground">Qur'on</p>
          </div>
          <div className="text-center">
            <Sparkles className="w-4 h-4 mx-auto text-amber-400 mb-1" />
            <p className="text-lg font-bold">{totals.zikr}</p>
            <p className="text-[10px] text-muted-foreground">Zikr</p>
          </div>
          <div className="text-center">
            <Calendar className="w-4 h-4 mx-auto text-orange-400 mb-1" />
            <p className="text-lg font-bold">{totals.fasting}</p>
            <p className="text-[10px] text-muted-foreground">Roza</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Hozircha faol foydalanuvchilar yo'q</p>
      ) : (
        <div className="space-y-2">
          {data.map((u) => (
            <button
              key={u.user.id}
              onClick={() => setSelectedUser(selectedUser?.user.id === u.user.id ? null : u)}
              className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-sm font-bold shrink-0">
                {(u.user.full_name || u.user.email || "?")[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.user.full_name || "Ism yo'q"}</p>
                <p className="text-xs text-muted-foreground truncate">{u.user.email}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-accent">{u.totalPrayers}</p>
                <p className="text-[10px] text-muted-foreground">{u.activeDays.size} kun faol</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Foydalanuvchi tafsiloti */}
      {selectedUser && (
        <div className="glass rounded-2xl p-4 space-y-4 border border-accent/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-base font-bold">
              {(selectedUser.user.full_name || selectedUser.user.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-sm">{selectedUser.user.full_name || "Ism yo'q"}</p>
              <p className="text-xs text-muted-foreground">{selectedUser.user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <CheckCircle2 className="w-4 h-4 mx-auto text-emerald-400 mb-1" />
              <p className="text-lg font-bold">{selectedUser.totalPrayers}</p>
              <p className="text-[10px] text-muted-foreground">Jami namoz</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <BookOpen className="w-4 h-4 mx-auto text-purple-400 mb-1" />
              <p className="text-lg font-bold">{selectedUser.totalQuran}</p>
              <p className="text-[10px] text-muted-foreground">Qur'on kun</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <Sparkles className="w-4 h-4 mx-auto text-amber-400 mb-1" />
              <p className="text-lg font-bold">{selectedUser.totalZikr}</p>
              <p className="text-[10px] text-muted-foreground">Jami zikr</p>
            </div>
          </div>

          {/* Namozlar taqsimoti */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Namozlar taqsimoti</p>
            <div className="space-y-1.5">
              {PRAYER_NAMES.map((p) => {
                const count = selectedUser.prayerBreakdown[p] || 0;
                const max = Math.max(...Object.values(selectedUser.prayerBreakdown), 1);
                const pct = (count / max) * 100;
                return (
                  <div key={p} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-12">{PRAYER_LABELS[p]}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-semibold w-8 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Oxirgi amallar */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2">Oxirgi amallar</p>
            <div className="space-y-1 max-h-40 overflow-y-auto no-scrollbar">
              {selectedUser.records.slice(0, 7).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg bg-white/5">
                  <span className="text-muted-foreground">{new Date(r.date).toLocaleDateString("uz")}</span>
                  <span className="font-medium">
                    {(r.prayers?.length || 0)} namoz {r.quran_read ? "✓ Qur'on" : ""} {r.zikr_count > 0 ? `· ${r.zikr_count} zikr` : ""}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}