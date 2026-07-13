import React, { useState } from "react";
import { Search } from "lucide-react";
import { ASMA_UL_HUSNA } from "@/lib/asmaulHusna";
import { Input } from "@/components/ui/input";

export default function AsmaulHusna() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = ASMA_UL_HUSNA.filter((n) => {
    const s = q.toLowerCase();
    return n.translit.toLowerCase().includes(s) || n.meaning.toLowerCase().includes(s) || String(n.n) === q;
  });

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold gold-text">Asma-ul-Husna</h1>
        <p className="text-xs text-muted-foreground mt-1">Allohning 99 go'zal ismlari</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Izlash..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="bg-white/5 rounded-xl pl-10"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {filtered.map((name) => (
          <button
            key={name.n}
            onClick={() => setSelected(name)}
            className="glass rounded-xl p-3 flex flex-col items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="text-[10px] text-muted-foreground">{name.n}</span>
            <span className="font-arabic text-xl text-white">{name.arabic}</span>
            <span className="text-[10px] text-accent font-medium text-center leading-tight">{name.translit}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-md glass rounded-t-3xl p-8 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <p className="text-6xl font-arabic text-white mb-2">{selected.arabic}</p>
              <p className="text-xl font-bold gold-text">{selected.translit}</p>
              <p className="text-sm text-muted-foreground mt-1">{selected.meaning}</p>
              <p className="text-xs text-muted-foreground mt-2">№ {selected.n} / 99</p>
            </div>
            <button onClick={() => setSelected(null)} className="w-full py-2.5 rounded-xl bg-white/10 text-sm font-medium">
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}