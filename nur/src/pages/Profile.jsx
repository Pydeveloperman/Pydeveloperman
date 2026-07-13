import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useProgress } from "@/lib/useProgress";
import ImanTree from "@/components/profile/ImanTree";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Award, ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "@/api/apiClient";

export default function Profile() {
  const { user } = useAuth();
  const { progress, loading } = useProgress();
  const navigate = useNavigate();

  const [clickCount, setClickCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");

  const handleTreeClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next === 2) {
        setShowAdminModal(true);
        setAdminPassword("");
        setAdminError("");
        return 0;
      }

      // Reset count after 1 second of inactivity
      setTimeout(() => {
        setClickCount(0);
      }, 1000);

      return next;
    });
  };

  const handleAdminSubmit = () => {
    if (adminPassword === "admin123") {
      localStorage.setItem("bypass_admin", "true");
      setShowAdminModal(false);
      navigate("/admin");
    } else {
      setAdminError("Noto'g'ri parol kiritildi!");
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("bypass_admin");
      await db.auth.logout();
      window.location.href = "/";
    } catch (err) {
      console.error("Failed to logout", err);
    }
  };

  // Calculate user's ImanTree level (from 0 to 7) based on completed prayers, Quran reading, and zikrs
  const calculateLevel = () => {
    if (!progress) return 0;
    let score = 0;
    // Complete prayers: +1 point each (max 5)
    if (progress.prayers && Array.isArray(progress.prayers)) {
      score += progress.prayers.length;
    }
    // Quran read today: +1 point
    if (progress.quran_read) {
      score += 1;
    }
    // Zikr count: +1 point for every 33 zikrs (max 1)
    if (progress.zikr_count && progress.zikr_count >= 33) {
      score += 1;
    }
    return Math.min(7, score);
  };

  const currentLevel = calculateLevel();

  const getLevelLabel = (lvl) => {
    if (lvl <= 1) return "Kichik nihol";
    if (lvl <= 3) return "O'suvchi daraxt";
    if (lvl <= 5) return "Serhosil nihol";
    return "Mustahkam Iymon daraxti";
  };

  return (
    <div className="space-y-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold gold-text">Mening profilim</h1>
        <p className="text-xs text-muted-foreground mt-1">Shaxsiy ibodat ko'rsatkichlari va sozlamalar</p>
      </header>

      {/* User Info Card */}
      <div className="glass rounded-3xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.telegram_user?.photo_url ? (
            <img 
              src={user.telegram_user.photo_url} 
              alt="Avatar" 
              className="w-12 h-12 rounded-full border border-accent/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 flex items-center justify-center border border-emerald-500/10">
              <span className="text-emerald-400 font-bold text-lg">
                {(user?.full_name || "M").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="space-y-0.5 text-left">
            <p className="text-sm font-semibold text-white">{user?.full_name || "Foydalanuvchi"}</p>
            {user?.telegram_user?.username ? (
              <p className="text-xs text-muted-foreground">@{user.telegram_user.username}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{user?.email || "mehmon@nur.uz"}</p>
            )}
          </div>
        </div>
        {(user?.role === "admin" || localStorage.getItem("bypass_admin") === "true") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin")}
            className="text-xs border-accent/30 text-accent hover:bg-accent/10"
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Admin Panel
          </Button>
        )}
      </div>

      {/* Iman Tree Card */}
      <div className="space-y-3">
        <div className="text-left">
          <h2 className="text-sm font-semibold flex items-center gap-1.5 text-accent">
            <Award className="w-4 h-4" /> Iymon daraxti
          </h2>
          <p className="text-[11px] text-muted-foreground">Bugungi ibodatlaringiz daraxtni oziqlantiradi va o'stiradi</p>
        </div>
        
        {loading ? (
          <div className="h-56 glass rounded-3xl flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <div 
              onClick={handleTreeClick} 
              className="cursor-pointer active:scale-[0.99] transition-transform duration-200"
              title="Admin panelga kirish uchun 2 marta bosing"
            >
              <ImanTree level={currentLevel} />
            </div>
            <div className="text-center bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-xs text-muted-foreground">Bugungi daraja</p>
              <p className="text-lg font-bold text-accent mt-0.5">{getLevelLabel(currentLevel)}</p>
              <p className="text-[11px] text-muted-foreground/80 mt-1">
                Daraja: {currentLevel} / 7 (Namozlar, Qur'on qiroati va zikrlar orqali o'sadi)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Today's Achievements */}
      <div className="glass rounded-3xl p-5 space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-1.5 text-left text-white">
          <ListTodo className="w-4 h-4 text-emerald-400" /> Bugungi natijalar
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 rounded-2xl p-3 text-left">
            <p className="text-xs text-muted-foreground">O'qilgan namozlar</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {progress?.prayers?.length || 0} / 5
            </p>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 text-left">
            <p className="text-xs text-muted-foreground">Aytilgan zikrlar</p>
            <p className="text-xl font-bold text-emerald-400 mt-1">
              {progress?.zikr_count || 0} ta
            </p>
          </div>
        </div>
      </div>

      {/* App Info Box */}
      <div className="glass rounded-3xl p-5 border border-white/5 bg-gradient-to-br from-emerald-950/20 to-transparent text-center space-y-2">
        <p className="text-xs text-accent font-semibold tracking-wider uppercase">✦ Nur — Islomiy Hamroh ✦</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Ushbu dastur sizning kundalik ibodatlaringizni tartibga solish, Qur'on o'qish, zikr qilish va iymoningizni mustahkamlashda yordam berish maqsadida yaratildi.
        </p>
        <p className="text-[10px] text-muted-foreground/60">Versiya: 1.2.0 • Telegram Mini App</p>
      </div>

      {/* Admin Passcode Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm glass rounded-3xl p-6 border border-accent/20 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 text-left">
            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold gold-text">Admin panelga kirish</h3>
              <p className="text-xs text-muted-foreground">Kodni kiriting</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-muted-foreground block">Maxfiy parol</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setAdminError("");
                }}
                placeholder="Parolni kiriting..."
                className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3.5 text-sm outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all text-white placeholder:text-muted-foreground/50"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdminSubmit();
                }}
              />
              {adminError && (
                <p className="text-red-400 text-[11px] animate-pulse">{adminError}</p>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAdminModal(false)}
                className="flex-1 h-10 rounded-xl text-xs border-white/10 text-muted-foreground hover:bg-white/5 hover:text-white"
              >
                Bekor qilish
              </Button>
              <Button
                onClick={handleAdminSubmit}
                className="flex-1 h-10 rounded-xl text-xs bg-accent text-accent-foreground font-medium hover:bg-accent/90"
              >
                Tasdiqlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
