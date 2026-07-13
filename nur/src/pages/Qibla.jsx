import React from "react";
import QiblaCompass from "@/components/qibla/QiblaCompass";

export default function Qibla() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gold-text">Qibla kompas</h1>
      <QiblaCompass />
    </div>
  );
}