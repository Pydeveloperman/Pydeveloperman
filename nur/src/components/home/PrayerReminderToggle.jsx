import React, { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  isNotificationEnabled,
  setNotificationEnabled,
  requestPermission,
  hasNotificationSupport
} from "@/lib/prayerNotifications";
import { toast } from "@/components/ui/use-toast";

export default function PrayerReminderToggle() {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setEnabled(isNotificationEnabled());
    setSupported(hasNotificationSupport());
  }, []);

  const handleToggle = async () => {
    if (!supported) {
      toast({
        title: "Xatolik",
        description: "Ushbu brauzer bildirishnomalarni qo'llab-quvvatlamaydi",
        variant: "destructive"
      });
      return;
    }

    if (!enabled) {
      const granted = await requestPermission();
      if (granted) {
        setNotificationEnabled(true);
        setEnabled(true);
        toast({
          title: "Bildirishnomalar yoqildi",
          description: "Namoz vaqtlari sizga eslatib turiladi"
        });
      } else {
        toast({
          title: "Ruxsat berilmadi",
          description: "Eslatmalar uchun bildirishnomalarga ruxsat berishingiz kerak",
          variant: "destructive"
        });
      }
    } else {
      setNotificationEnabled(false);
      setEnabled(false);
      toast({
        title: "Bildirishnomalar o'chirildi",
        description: "Namoz vaqti eslatmalari faolsizlantirildi"
      });
    }
  };

  return (
    <div className="glass rounded-2xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3 text-left">
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
          enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-muted-foreground"
        }`}>
          {enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Namoz vaqti eslatmalari</p>
          <p className="text-sm font-semibold mt-0.5">
            {enabled ? "Eslatmalar faol" : "Eslatmalar faolsiz"}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
          enabled ? "bg-red-500/10 text-red-400 hover:bg-red-500/15" : "bg-accent text-accent-foreground hover:bg-opacity-90"
        }`}
      >
        {enabled ? "O'chirish" : "Yoqish"}
      </button>
    </div>
  );
}
