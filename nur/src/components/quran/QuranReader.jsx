import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Loader2, Play, Pause } from "lucide-react";
import { fetchSurah, ayahAudioUrl, RECITERS } from "@/lib/islamicApi";
import { useLastRead } from "@/lib/useLastRead";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

export default function QuranReader({ surahNumber, surahName, startAyah, onBack }) {
  const [data, setData] = useState(null);
  const [reciter, setReciter] = useState(RECITERS[0].id);
  const [playing, setPlaying] = useState(null); // ayah number
  const audioRef = useRef(null);
  const { save } = useLastRead();

  useEffect(() => {
    setData(null);
    fetchSurah(surahNumber).then(setData);
  }, [surahNumber]);

  useEffect(() => {
    if (data && startAyah) {
      const el = document.getElementById(`ayah-${startAyah}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [data, startAyah]);

  const playAyah = (ayahNum) => {
    if (playing === ayahNum) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      audioRef.current?.pause();
      const url = ayahAudioUrl(surahNumber, ayahNum, reciter);
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlaying(ayahNum);
      audio.play().catch(err => {
        if (err.name === "AbortError" || err.message?.includes("abort")) {
          // Ignore benign abort errors caused by stopping/switching audio
          return;
        }
        if (audioRef.current === audio) {
          console.error("Audio play failed", err);
          setPlaying(null);
        }
      });
      audio.onended = () => {
        if (audioRef.current === audio) {
          setPlaying(null);
          // Optional auto-play next ayah
          if (data && ayahNum < data.ayahs.length) {
            playAyah(ayahNum + 1);
          }
        }
      };
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-xs text-muted-foreground">Sura yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center flex-1 pr-6">
          <h2 className="text-lg font-bold text-accent">{surahName}</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{data.revelationType === "Meccan" ? "Makkiy" : "Madaniy"} • {data.ayahs.length} oyat</p>
        </div>
      </div>

      {/* Reciter Selector */}
      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Qori</span>
        <Select value={reciter} onValueChange={(val) => {
          audioRef.current?.pause();
          setPlaying(null);
          setReciter(val);
        }}>
          <SelectTrigger className="w-48 h-9 border-accent/20 bg-white/5 text-xs text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RECITERS.map((r) => (
              <SelectItem key={r.id} value={r.id} className="text-xs">
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bismillah */}
      {surahNumber !== 9 && (
        <div className="text-center py-6">
          <p className="font-arabic text-2xl text-accent">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          <p className="text-[10px] text-muted-foreground mt-2 font-sans">Mehribon va rahmli Alloh nomi bilan</p>
        </div>
      )}

      {/* Ayahs List */}
      <div className="space-y-4">
        {data.ayahs.map((ayah) => {
          const num = ayah.numberInSurah;
          const isPlaying = playing === num;

          return (
            <div 
              key={ayah.number} 
              id={`ayah-${num}`}
              className="glass rounded-3xl p-5 space-y-4 text-left transition-all hover:border-accent/20 border border-transparent"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="w-7 h-7 rounded-full bg-accent/15 text-accent text-xs font-bold flex items-center justify-center">
                  {num}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      save(surahNumber, surahName, num);
                      toast({
                        title: "Belgilandi",
                        description: `Sura ${surahName}, ${num}-oyat oxirgi o'qilgan deb saqlandi.`
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] text-muted-foreground font-semibold"
                  >
                    Keltirish
                  </button>
                  <button 
                    onClick={() => playAyah(num)}
                    className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:scale-105 transition"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-arabic text-2xl text-right leading-loose text-white font-medium select-all">
                  {ayah.text}
                </p>
                <p className="text-xs text-foreground/85 leading-relaxed font-sans">
                  {ayah.translation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
