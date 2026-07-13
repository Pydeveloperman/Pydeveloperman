import React from "react";

// Amallar soniga qarab o'sadigan daraxt (0-7 daraja)
export default function ImanTree({ level = 0 }) {
  const l = Math.min(7, level);
  const trunkH = 20 + l * 8;
  const leaves = l >= 2;
  const leafSize = 10 + l * 7;

  return (
    <div className="relative flex flex-col items-center justify-end h-56 rounded-3xl bg-gradient-to-b from-emerald-900/40 to-emerald-950/60 overflow-hidden border border-accent/10">
      <div className="absolute top-4 right-5 w-8 h-8 rounded-full bg-amber-300/40 blur-md" />
      {/* Leaves */}
      {leaves && (
        <div
          className="rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 transition-all duration-700 shadow-lg"
          style={{ width: leafSize * 6, height: leafSize * 5, marginBottom: -leafSize }}
        />
      )}
      {l < 2 && (
        <div className="rounded-full bg-emerald-500/70 transition-all duration-700" style={{ width: 24 + l * 8, height: 24 + l * 8, marginBottom: -6 }} />
      )}
      {/* Trunk */}
      <div className="bg-gradient-to-b from-amber-800 to-amber-950 rounded-t-md" style={{ width: 12 + l, height: trunkH }} />
      {/* Ground */}
      <div className="w-full h-3 bg-emerald-800/80" />
    </div>
  );
}