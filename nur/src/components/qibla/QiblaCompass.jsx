import React, { useState, useEffect } from "react";
import { Loader2, Navigation, Compass } from "lucide-react";
import { getLocation, qiblaBearing } from "@/lib/islamicApi";
import { Button } from "@/components/ui/button";

export default function QiblaCompass() {
  const [qibla, setQibla] = useState(null);
  const [heading, setHeading] = useState(0);
  const [needPerm, setNeedPerm] = useState(false);

  useEffect(() => {
    getLocation().then((loc) => setQibla(qiblaBearing(loc.lat, loc.lng)));
  }, []);

  const handleOrientation = (e) => {
    const h = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : 0);
    setHeading(h);
  };

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === "granted") {
          window.addEventListener("deviceorientationabsolute", handleOrientation, true);
          window.addEventListener("deviceorientation", handleOrientation, true);
          setNeedPerm(false);
        } else {
          setNeedPerm(true);
        }
      } catch (err) {
        console.error("Compass permission error", err);
        setNeedPerm(true);
      }
    } else {
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
  };

  useEffect(() => {
    if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
      setNeedPerm(true);
    } else {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  if (qibla === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  // Calculate rotation angle of Qibla
  const qiblaDirection = (qibla - heading + 360) % 360;

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative w-64 h-64 rounded-full border border-white/10 flex items-center justify-center bg-white/5 shadow-inner">
        {/* Outer Ring */}
        <div className="absolute inset-2 rounded-full border border-dashed border-white/5" />
        
        {/* Cardinal Directions */}
        <span className="absolute top-3 text-[10px] font-bold text-muted-foreground">N</span>
        <span className="absolute right-3 text-[10px] font-bold text-muted-foreground">E</span>
        <span className="absolute bottom-3 text-[10px] font-bold text-muted-foreground">S</span>
        <span className="absolute left-3 text-[10px] font-bold text-muted-foreground">W</span>

        {/* Compass Dial */}
        <div 
          className="relative w-48 h-48 rounded-full border border-accent/20 flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ transform: `rotate(${-heading}deg)` }}
        >
          <Compass className="w-8 h-8 text-white/20" />
        </div>

        {/* Qibla Arrow Dial */}
        <div 
          className="absolute w-44 h-44 rounded-full flex items-center justify-center transition-transform duration-100 ease-out"
          style={{ transform: `rotate(${qiblaDirection}deg)` }}
        >
          <div className="absolute -top-3 flex flex-col items-center">
            <Navigation className="w-6 h-6 text-accent fill-accent" />
            <span className="text-[10px] font-bold text-accent mt-0.5">KA'BA</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-semibold">Qibla yo'nalishi: <span className="text-accent font-bold">{Math.round(qibla)}°</span></p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Qurilmani tekis tuting. Arrow (Ka'ba) belgisi Ka'ba tomonga yo'naltirilgan bo'lishi kerak.
        </p>
      </div>

      {needPerm && (
        <Button onClick={requestPermission} className="w-full h-11 rounded-xl text-xs font-semibold">
          Kompas ruxsatini yoqish
        </Button>
      )}
    </div>
  );
}
