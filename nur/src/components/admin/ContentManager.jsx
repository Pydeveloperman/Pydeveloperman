import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { db } from "@/api/apiClient";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPE_LABELS = {
  ayah: "Oyat",
  dua: "Dua",
  hadith: "Hadis",
  lesson: "Ibrat",
};

const EMPTY = { type: "ayah", title: "", arabic: "", translation: "", ref: "", category: "" };

export default function ContentManager({ filterType }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const all = await db.entities.Content.list("-created_date", 100);
    setItems(filterType ? all.filter((i) => i.type === filterType) : all);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterType]);

  const save = async () => {
    if (!editing.translation) return;
    if (editing.id) {
      await db.entities.Content.update(editing.id, editing);
    } else {
      await db.entities.Content.create(editing);
    }
    setEditing(null);
    setShowForm(false);
    load();
  };

  const remove = async (id) => {
    await db.entities.Content.delete(id);
    load();
  };

  const startNew = () => {
    setEditing({ ...EMPTY, type: filterType || "ayah" });
    setShowForm(true);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {filterType ? `${TYPE_LABELS[filterType]} boshqaruvi` : "Barcha kontent"}
        </h2>
        <Button onClick={startNew} size="sm" className="rounded-lg bg-primary text-primary-foreground">
          <Plus className="w-4 h-4" /> Qo'shish
        </Button>
      </div>

      {showForm && editing && (
        <div className="glass rounded-2xl p-4 space-y-3 border border-accent/30">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">{editing.id ? "Tahrirlash" : "Yangi qo'shish"}</span>
            <button onClick={() => { setShowForm(false); setEditing(null); }}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {!filterType && (
            <Select
              value={editing.type}
              onValueChange={(v) => setEditing({ ...editing, type: v })}
            >
              <SelectTrigger className="w-full bg-white/5 rounded-xl border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Input placeholder="Sarlavha" value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="bg-white/5" />
          <Input placeholder="Arabcha matn" value={editing.arabic || ""} onChange={(e) => setEditing({ ...editing, arabic: e.target.value })} className="bg-white/5 font-arabic text-right text-lg" />
          <Input placeholder="Tarjima" value={editing.translation || ""} onChange={(e) => setEditing({ ...editing, translation: e.target.value })} className="bg-white/5" />
          <div className="grid grid-cols-2 gap-2">
            <Input placeholder="Manba" value={editing.ref || ""} onChange={(e) => setEditing({ ...editing, ref: e.target.value })} className="bg-white/5" />
            <Input placeholder="Kategoriya" value={editing.category || ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="bg-white/5" />
          </div>
          <Button onClick={save} className="w-full rounded-xl bg-emerald-600 text-white">
            <Check className="w-4 h-4" /> Saqlash
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">Hozircha kontent yo'q</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="glass rounded-xl p-3 flex items-start gap-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/20 text-accent font-medium shrink-0 mt-0.5">
                {TYPE_LABELS[item.type]}
              </span>
              <div className="flex-1 min-w-0">
                {item.title && <p className="text-xs text-accent font-medium">{item.title}</p>}
                {item.arabic && <p className="font-arabic text-base text-right truncate">{item.arabic}</p>}
                <p className="text-sm truncate">{item.translation}</p>
                {item.ref && <p className="text-[10px] text-muted-foreground">{item.ref}</p>}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => { setEditing(item); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-white/10">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-red-500/10">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}