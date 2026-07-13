import React, { useState } from "react";
import { Sparkles, ImageIcon, BookOpen, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { dayIndex, DAILY_AYAHS } from "@/lib/nurData";
import AyahShareModal from "./AyahShareModal";

export default function AyahBanner() {
  const ayah = DAILY_AYAHS[dayIndex(DAILY_AYAHS.length)];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [tafsirText, setTafsirText] = useState("");
  const [tafsirLoading, setTafsirLoading] = useState(false);

  const toggleTafsir = async () => {
    if (showTafsir) {
      setShowTafsir(false);
      return;
    }
    
    setShowTafsir(true);
    if (tafsirText) return;

    setTafsirLoading(true);
    try {
      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Quyidagi Qur'on oyati uchun o'ta go'zal, chuqur tushunarli, ishonchli va ruhiy tasalli beruvchi tafsir va ma'no sharhi tayyorlang:
          
Oyat (arabcha): "${ayah.arabic}"
Tarjimasi: "${ayah.translation}"
Manba: ${ayah.ref}

Iltimos, tafsirni juda go'zal va ohangdor tarzda, qisqa bir necha xatboshida tayyorlang. Oxirida bir jumlali ta'sirchan islomiy hikmat keltiring.`,
          systemInstruction: "Siz Qur'on oyatlari ma'nolarini oson, ta'sirli va tasalli beruvchi ohangda tushuntirib beruvchi ma'rifatli islom olimisiz."
        })
      });
      const data = await response.json();
      if (response.ok && data.text) {
        setTafsirText(data.text);
      } else {
        throw new Error(data.error || "Tafsirni yuklab bo'lmadi");
      }
    } catch (e) {
      console.error(e);
      setTafsirText("Uzr so'raymiz, hozirda tafsir yuklashda muammo yuz berdi. Internet aloqangizni tekshirib, qayta urinib ko'ring.");
    } finally {
      setTafsirLoading(false);
    }
  };

  return (
    <>
      <div className="glass rounded-3xl p-5 space-y-3 bg-gradient-to-br from-emerald-950/40 via-transparent to-transparent border border-emerald-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent">
            <Sparkles className="w-4 h-4 text-accent fill-accent/10" />
            <h2 className="text-sm font-semibold text-left">Kun oyati</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTafsir}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 text-accent hover:bg-amber-500/20 text-[11px] font-semibold transition-all border border-amber-500/15"
            >
              <BookOpen className="w-3 h-3" />
              AI Tafsir
              {showTafsir ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold transition-all border border-emerald-500/15"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Rasmga yozish
            </button>
          </div>
        </div>
        <div className="space-y-2 text-left">
          <p className="font-arabic text-xl text-right leading-loose text-white">{ayah.arabic}</p>
          <p className="text-xs text-foreground/85 leading-relaxed">{ayah.translation}</p>
          <p className="text-[10px] text-muted-foreground text-right">— {ayah.ref}</p>
        </div>

        {/* Tafsir display */}
        {showTafsir && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-left transition-all">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-accent flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> AI Oyat Tafsiri & Sharhi
            </h4>
            {tafsirLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-accent" />
                AI tafsir va mulohaza tayyorlamoqda...
              </div>
            ) : (
              <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line prose prose-invert bg-emerald-950/20 p-3 rounded-2xl border border-emerald-500/5">
                {tafsirText}
              </p>
            )}
          </div>
        )}
      </div>

      <AyahShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ayah={ayah}
      />
    </>
  );
}
