import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Check, Youtube, Send, FileText } from "lucide-react";
import { db } from "@/api/apiClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseYouTubeId, youtubeThumb, MEDIA_CATEGORIES } from "@/lib/mediaUtils";

const EMPTY = { type: "video", title: "", source: "youtube", url: "", description: "", category: "", thumbnail: "", is_active: true };

export default function MediaManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState("video");

  const load = async () => {
    setLoading(true);
    const all = await db.entities.Media.list("-created_date", 100);
    setItems(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title || !editing.url) return;
    // YouTube havola uchun thumbnail avtomatik
    if (editing.source === "youtube" && !editing.thumbnail) {
      const ytId = parseYouTubeId(editing.url);
      if (ytId) editing.thumbnail = youtubeThumb(ytId);
    }
    if (editing.id) {
      await db.entities.Media.update(editing.id, editing);
    } else {
      await db.entities.Media.create(editing);
    }
    setEditing(null);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    await db.entities.Media.delete(id);
    load();
  };

  const toggleActive = async (item) => {
    await db.entities.Media.update(item.id, { is_active: !item.is_active });
    load();
  };

  const filtered = items.filter((m) => m.type === tab);
  const formItem = editing || EMPTY;
  // Form source options depend on whether we're editing
  const handleSourceChange = (source) => {
    setEditing({ ...editing, source });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Media boshqaruvi</h2>
        <Button onClick={() => { setEditing({ ...EMPTY, type: tab }); setShowForm(true); }} size="sm" className="rounded-lg bg-primary text-primary-foreground">
          <Plus className="w-4 h-4" /> Qo'shish
        </Button>
      </div>

      {/* Video / Audio tab */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
        <button
          onClick={() => setTab("video")}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "video" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
        >
          Videolar ({items.filter((m) => m.type === "video").length})
        </button>
        <button
          onClick={() => setTab("audio")}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${tab === "audio" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}`}
        >
          Audiolar ({items.filter((m) => m.type === "audio").length})
        </button>
      </div>

      {/* Forma */}
      {showForm && editing && (
        <div className="glass rounded-2xl p-4 space-y-3 border border-accent/30">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">{editing.id ? "Tahrirlash" : "Yangi qo'shish"}</span>
            <button onClick={() => { setShowForm(false); setEditing(null); }}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Source toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditing({ ...editing, source: "youtube" })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${editing.source === "youtube" ? "bg-red-500/20 ring-1 ring-red-500/40 text-red-400" : "bg-white/5 text-muted-foreground"}`}
            >
              <Youtube className="w-4 h-4" /> YouTube
            </button>
            <button
              onClick={() => setEditing({ ...editing, source: "telegram" })}
              className={`flex-1 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${editing.source === "telegram" ? "bg-blue-500/20 ring-1 ring-blue-500/40 text-blue-400" : "bg-white/5 text-muted-foreground"}`}
            >
              <Send className="w-4 h-4" /> Telegram
            </button>
          </div>

          <Input placeholder="Sarlavha" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="bg-white/5" />

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              {editing.source === "youtube" ? "YouTube havolasi (https://youtu.be/... yoki https://youtube.com/watch?v=...)" : "Telegram havolasi (https://t.me/...)"}
            </p>
            <Input
              placeholder={editing.source === "youtube" ? "https://youtu.be/..." : "https://t.me/..."}
              value={editing.url || ""}
              onChange={(e) => setEditing({ ...editing, url: e.target.value })}
              className="bg-white/5"
            />
          </div>

          <Input placeholder="Tavsif (ixtiyoriy)" value={editing.description || ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="bg-white/5" />
          <div>
            <p className="text-xs text-muted-foreground mb-1">Kategoriya</p>
            <div className="flex flex-wrap gap-1.5">
              {MEDIA_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setEditing({ ...editing, category: c })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${editing.category === c ? "bg-accent text-accent-foreground" : "bg-white/5 text-muted-foreground"}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <Input placeholder="Orqa fon URL (ixtiyoriy)" value={editing.thumbnail || ""} onChange={(e) => setEditing({ ...editing, thumbnail: e.target.value })} className="bg-white/5" />

          {editing.source === "youtube" && editing.url && parseYouTubeId(editing.url) && (
            <div className="rounded-xl overflow-hidden">
              <img src={youtubeThumb(parseYouTubeId(editing.url))} alt="preview" className="w-full h-28 object-cover" />
              <p className="text-[10px] text-emerald-400 mt-1 text-center">✓ YouTube havolasi aniqlandi</p>
            </div>
          )}

          <Button onClick={save} className="w-full rounded-xl bg-emerald-600 text-white">
            <Check className="w-4 h-4" /> Saqlash
          </Button>
        </div>
      )}

      {/* Ro'yxat */}
      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8 space-y-2">
          <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Hozircha {tab === "video" ? "videolar" : "audiolar"} yo'q</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className={`glass rounded-xl p-2.5 ${!item.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-3">
                {/* Thumbnail */}
                <div className="relative w-16 h-12 rounded-lg overflow-hidden shrink-0 bg-white/5">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.source === "telegram" ? <Send className="w-4 h-4 text-blue-400" /> : <Youtube className="w-4 h-4 text-red-500" />}
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.title}</p>
                  {item.category && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-muted-foreground">{item.category}</span>}
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{item.url}</p>
                </div>
              </div>
              {/* Actions */}
              <div className="flex gap-1 pt-2 mt-2 border-t border-white/5">
                <button onClick={() => { setEditing(item); setShowForm(true); }} className="flex-1 py-1.5 rounded-lg hover:bg-white/10 text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Pencil className="w-3 h-3" /> Tahrirlash
                </button>
                <button onClick={() => toggleActive(item)} className="flex-1 py-1.5 rounded-lg hover:bg-white/10 text-xs text-muted-foreground">
                  {item.is_active ? "O'chirish" : "Yoqish"}
                </button>
                <button onClick={() => remove(item.id)} className="flex-1 py-1.5 rounded-lg hover:bg-red-500/10 text-xs text-red-400 flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> O'chirish
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}