import React, { useState } from "react";
import DuaList from "@/components/duas/DuaList";
import Tasbih from "@/components/duas/Tasbih";
import AiAssistant from "@/components/duas/AiAssistant";
import { useProgress } from "@/lib/useProgress";
import { Sparkles } from "lucide-react";

export default function Duas() {
  const [activeTab, setActiveTab] = useState("duas");
  const { progress, addZikr } = useProgress();

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1">
        <button
          onClick={() => setActiveTab("duas")}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === "duas" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-white"
          }`}
        >
          Dualar
        </button>
        <button
          onClick={() => setActiveTab("tasbih")}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
            activeTab === "tasbih" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-white"
          }`}
        >
          Tasbeh
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeTab === "ai" ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-white"
          }`}
        >
          <Sparkles className="w-3 h-3 text-yellow-400 fill-yellow-400/20" />
          AI Suhbat
        </button>
      </div>

      {activeTab === "duas" && <DuaList />}
      {activeTab === "tasbih" && <Tasbih zikrCount={progress?.zikr_count || 0} onAdd={addZikr} />}
      {activeTab === "ai" && <AiAssistant />}
    </div>
  );
}
