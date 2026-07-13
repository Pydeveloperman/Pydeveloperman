import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2, Sparkles, Check, Image as ImageIcon, Smile, Type } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEMES = [
  {
    id: "emerald",
    name: "Zumrad",
    bgGradient: ["#022c22", "#064e3b", "#022c22"],
    textColor: "#ffffff",
    accentColor: "#34d399",
    subColor: "#a7f3d0",
    glowColor: "rgba(52, 211, 153, 0.15)",
    arabicColor: "#6ee7b7"
  },
  {
    id: "cosmic",
    name: "Koinot",
    bgGradient: ["#030712", "#0f172a", "#1e1b4b"],
    textColor: "#ffffff",
    accentColor: "#f59e0b",
    subColor: "#fde68a",
    glowColor: "rgba(245, 158, 11, 0.15)",
    arabicColor: "#fcd34d"
  },
  {
    id: "sunset",
    name: "Sokinlik",
    bgGradient: ["#1c0a00", "#311100", "#1c0a00"],
    textColor: "#ffffff",
    accentColor: "#f97316",
    subColor: "#fed7aa",
    glowColor: "rgba(249, 115, 22, 0.15)",
    arabicColor: "#fdba74"
  },
  {
    id: "darkgold",
    name: "Oltin",
    bgGradient: ["#141414", "#262626", "#0c0c0c"],
    textColor: "#ffffff",
    accentColor: "#eab308",
    subColor: "#fef08a",
    glowColor: "rgba(234, 179, 8, 0.12)",
    arabicColor: "#fde047"
  }
];

export default function AyahShareModal({ isOpen, onClose, ayah }) {
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [showWatermark, setShowWatermark] = useState(true);
  const [personalizedName, setPersonalizedName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // Re-draw when settings change
  useEffect(() => {
    if (!isOpen || !ayah) return;
    drawCanvas();
  }, [isOpen, selectedTheme, showWatermark, personalizedName, ayah]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // We draw at 1080x1080 for crisp sharing quality
    const size = 1080;
    canvas.width = size;
    canvas.height = size;

    // 1. Draw Background Gradient
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 100, 
      size / 2, size / 2, size * 0.7
    );
    gradient.addColorStop(0, selectedTheme.bgGradient[1]);
    gradient.addColorStop(0.5, selectedTheme.bgGradient[0]);
    gradient.addColorStop(1, selectedTheme.bgGradient[2] || selectedTheme.bgGradient[0]);
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // 2. Decorative elements (Islamic Star Pattern or Glow)
    // Core glow circle
    ctx.shadowColor = selectedTheme.accentColor;
    ctx.shadowBlur = 120;
    ctx.fillStyle = selectedTheme.glowColor;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // 3. Draw elegant borders
    ctx.strokeStyle = selectedTheme.accentColor + "25"; // 15% opacity
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, size - 80, size - 80);

    ctx.strokeStyle = selectedTheme.accentColor + "55"; // 35% opacity
    ctx.lineWidth = 2;
    ctx.strokeRect(55, 55, size - 110, size - 110);

    // Corner Islamic star pattern decorations
    const drawCornerStars = () => {
      const corners = [
        [55, 55],
        [size - 55, 55],
        [55, size - 55],
        [size - 55, size - 55]
      ];
      ctx.fillStyle = selectedTheme.accentColor;
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          const r = i % 2 === 0 ? 12 : 5;
          ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
      });
    };
    drawCornerStars();

    // 4. Header Badge
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 22px 'Inter', sans-serif";
    ctx.fillText("✦  K U N   O Y A T I  ✦", size / 2, 140);

    // Sparkles or Crescent in center top
    ctx.fillStyle = selectedTheme.accentColor + "40";
    ctx.beginPath();
    ctx.arc(size / 2, 220, 30, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.font = "bold 32px 'Inter', sans-serif";
    ctx.fillText("✨", size / 2, 220);

    // 5. Drawing Arabic text
    ctx.font = "700 52px 'Amiri', 'Traditional Arabic', 'Scheherazade', 'Noto Naskh Arabic', sans-serif";
    ctx.fillStyle = selectedTheme.arabicColor;
    ctx.textAlign = "center";
    ctx.direction = "rtl";

    const arabicLines = wrapText(ctx, ayah.arabic, 760);
    let currentY = 320;
    
    arabicLines.forEach((line) => {
      ctx.fillText(line, size / 2, currentY);
      currentY += 85;
    });

    // Elegant divider line
    ctx.direction = "ltr";
    ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(size / 2 - 120, currentY + 30);
    ctx.lineTo(size / 2 + 120, currentY + 30);
    ctx.stroke();

    // Draw little center gold diamond in divider
    ctx.fillStyle = selectedTheme.accentColor;
    ctx.beginPath();
    ctx.arc(size / 2, currentY + 30, 5, 0, Math.PI * 2);
    ctx.fill();

    currentY += 100;

    // 6. Translation text
    ctx.font = "500 34px 'Inter', system-ui, sans-serif";
    ctx.fillStyle = selectedTheme.textColor;
    
    const translationLines = wrapText(ctx, `"${ayah.translation}"`, 780);
    translationLines.forEach((line) => {
      ctx.fillText(line, size / 2, currentY);
      currentY += 52;
    });

    currentY += 30;

    // 7. Reference Info
    ctx.font = "italic 26px 'Inter', sans-serif";
    ctx.fillStyle = selectedTheme.subColor;
    ctx.fillText(`— ${ayah.ref}`, size / 2, currentY);

    // 8. Custom personalization
    if (personalizedName.trim()) {
      ctx.font = "500 24px 'Inter', sans-serif";
      ctx.fillStyle = selectedTheme.accentColor;
      ctx.fillText(`Maxsus ${personalizedName.trim()} uchun tayyorlandi`, size / 2, size - 170);
    }

    // 9. Brand watermark / app branding
    if (showWatermark) {
      ctx.font = "600 24px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillText("✦  N U R  ✦", size / 2, size - 110);
      ctx.font = "400 18px 'Inter', sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillText("Islomiy hamroh telegram ilovasi", size / 2, size - 82);
    }

    // Generate preview URL
    try {
      setPreviewUrl(canvas.toDataURL("image/jpeg", 0.9));
    } catch (e) {
      console.error("Preview data url failed", e);
    }
  };

  // Safe wrap text implementation supporting both RTL and LTR smoothly
  function wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  const handleDownload = () => {
    if (!previewUrl) return;
    setIsGenerating(true);
    
    // Create direct download link
    const link = document.createElement("a");
    link.download = `nur-oyat-${ayah.ref.replace(/[\s,]+/g, "-").toLowerCase()}.jpg`;
    link.href = previewUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Haptic feedback
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
    }

    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!previewUrl) return;

    // Try Web Share API if browser supports it
    if (navigator.share) {
      try {
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const file = new File([blob], "kun-oyati.jpg", { type: "image/jpeg" });
        await navigator.share({
          title: "Nur — Kun oyati",
          text: `Kun oyati: ${ayah.translation} (${ayah.ref})`,
          files: [file]
        });
        return;
      } catch (err) {
        console.warn("Share API failed, fallback to direct download", err);
      }
    }

    // Show download hint
    handleDownload();
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert("Rasm qurilmangizga yuklandi! Uni do'stlaringizga yuborishingiz mumkin.");
    } else {
      alert("Rasm yuklab olindi!");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto">
      <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Oyatni rasmga yozish</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Live High-Quality Preview Card */}
          <div className="space-y-1.5 text-center">
            <label className="text-[11px] text-muted-foreground font-semibold tracking-wider uppercase block text-left">
              Jonli Ko'rinish (Preview)
            </label>
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-white/5 shadow-inner bg-slate-950 flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Daily Ayah Card Preview" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="animate-pulse space-y-2 text-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8 mx-auto animate-bounce" />
                  <p className="text-xs">Rasm tayyorlanmoqda...</p>
                </div>
              )}
            </div>
          </div>

          {/* Style Controls */}
          <div className="space-y-4 bg-slate-950/40 border border-white/5 p-4 rounded-2xl">
            
            {/* Background Theme Selector */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-semibold block text-left">
                Mavzuni tanlang (Theme)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {THEMES.map((theme) => {
                  const isSelected = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme)}
                      className={`relative h-12 rounded-xl overflow-hidden border-2 transition-all flex flex-col items-center justify-center ${
                        isSelected ? "border-emerald-500 scale-105" : "border-transparent"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${theme.bgGradient[0]}, ${theme.bgGradient[1]})`
                      }}
                    >
                      <span className="text-[10px] text-white/90 font-medium px-1 bg-black/40 rounded-md backdrop-blur-xs">
                        {theme.name}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Personalization Name Input */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 text-left">
                <Smile className="w-3.5 h-3.5 text-emerald-400" /> Ismingizni qo'shish (Majburiy emas)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={25}
                  value={personalizedName}
                  onChange={(e) => setPersonalizedName(e.target.value)}
                  placeholder="Masalan: Sardor"
                  className="w-full h-11 bg-slate-950 border border-white/10 rounded-xl px-4 text-sm text-white placeholder:text-muted-foreground/60 focus:border-emerald-500 focus:outline-none transition-colors"
                />
                {personalizedName && (
                  <button
                    onClick={() => setPersonalizedName("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-white"
                  >
                    Tozalash
                  </button>
                )}
              </div>
            </div>

            {/* Watermark Toggle */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-emerald-400" /> "Nur" logotipini ko'rsatish
              </span>
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`w-9 h-5 rounded-full transition-colors relative ${
                  showWatermark ? "bg-emerald-500" : "bg-slate-800"
                }`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  showWatermark ? "right-1" : "left-1"
                }`} />
              </button>
            </div>

          </div>

        </div>

        {/* Hidden Generation Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Actions Footer */}
        <div className="p-5 border-t border-white/5 bg-slate-950/60 grid grid-cols-2 gap-3">
          <Button
            onClick={handleShare}
            className="h-12 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-medium text-sm flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" /> Ulashish
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isGenerating}
            className="h-12 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-950" /> Yuklab olish
          </Button>
        </div>

      </div>
    </div>,
    document.body
  );
}
