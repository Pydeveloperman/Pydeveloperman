import React, { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/api/apiClient";

const EMPTY_DUA = { type: "dua", title: "", arabic: "", translation: "", ref: "", category: "Umumiy", is_active: true };

export default function DuaManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeCat, setActiveCat] = useState("Umumiy");

  const load = async () => {
    setLoading(true);
    try {
      const all = await db.entities.Content.filter({ type: "dua" }, "-created_date", 200);
      setItems(all);
      const cats = [...new Set(all.map((d) => d.category || "Umumiy"))];
      if (!cats.includes(activeCat) && cats.length > 0) setActiveCat(cats[0]);
    } catch (err) {
      console.error("Failed to load duas", err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing.id) {
        await db.entities.Content.update(editing.id, editing);
      } else {
        await db.entities.Content.create(editing);
      }
      setEditing(null);
      setShowForm(false);
      load();
    } catch (err) {
      console.error("Failed to save dua", err);
    }
  };

  const remove = async (id) => {
    if (!confirm("Haqiqatan ham ushbu duoni o'chirib tashlamoqchimisiz?")) return;
    try {
      await db.entities.Content.delete(id);
      load();
    } catch (err) {
      console.error("Failed to delete dua", err);
    }
  };

  const filtered = items.filter((d) => (d.category || "Umumiy") === activeCat);
  const categories = [...new Set(items.map((d) => d.category || "Umumiy"))];
  if (!categories.includes("Umumiy")) categories.push("Umumiy");

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Duolar boshqaruvi</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Tizimdagi barcha duolarni tahrirlash va yangi qo'shish</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => { setEditing({ ...EMPTY_DUA, category: activeCat || "Umumiy" }); setShowForm(true); }}
            className="rounded-xl h-10 gap-1.5 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" /> Qo'shish
          </Button>
        )}
      </div>

      {showForm && editing && (
        <form onSubmit={save} className="glass rounded-3xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white">{editing.id ? "Duoni tahrirlash" : "Yangi duo qo'shish"}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase font-bold">Nomi</label>
              <Input
                required
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                placeholder="Duo nomi"
                className="h-10 border-white/5 bg-white/5 rounded-xl text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase font-bold">Kategoriya</label>
              <Input
                required
                value={editing.category}
                onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                placeholder="Masalan: Kunlik, Taom, Safar"
                className="h-10 border-white/5 bg-white/5 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase font-bold">Arabcha matni</label>
            <textarea
              required
              rows={3}
              value={editing.arabic}
              onChange={(e) => setEditing({ ...editing, arabic: e.target.value })}
              placeholder="Arabcha duoning o'zi"
              className="w-full font-arabic text-right p-3 border border-white/5 bg-white/5 rounded-xl text-lg text-white focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase font-bold">Tarjimasi / Transkripsiyasi</label>
            <textarea
              required
              rows={3}
              value={editing.translation}
              onChange={(e) => setEditing({ ...editing, translation: e.target.value })}
              placeholder="Duoning o'zbekcha tarjimasi"
              className="w-full p-3 border border-white/5 bg-white/5 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-muted-foreground uppercase font-bold">Manba / Hadis</label>
            <Input
              value={editing.ref || ""}
              onChange={(e) => setEditing({ ...editing, ref: e.target.value })}
              placeholder="Masalan: Muslim, Termiziy"
              className="h-10 border-white/5 bg-white/5 rounded-xl text-xs text-white"
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { setEditing(null); setShowForm(false); }}
              className="h-10 rounded-xl text-xs border-white/10 hover:bg-white/5 text-white"
            >
              Bekor qilish
            </Button>
            <Button type="submit" className="h-10 rounded-xl text-xs">
              Saqlash
            </Button>
          </div>
        </form>
      )}

      {/* Category tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCat(c)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition ${
              activeCat === c ? "bg-accent text-accent-foreground" : "bg-white/5 text-muted-foreground hover:bg-white/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5">
              <p className="text-xs text-muted-foreground">Ushbu turkumda hech qanday duo yo'q</p>
            </div>
          ) : (
            filtered.map((d) => (
              <div key={d.id} className="glass rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-white">{d.title}</h4>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => { setEditing(d); setShowForm(true); }}
                      className="w-8 h-8 p-0 rounded-lg border-white/10 hover:bg-white/5 text-white"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => remove(d.id)}
                      className="w-8 h-8 p-0 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/15 border border-red-500/20"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="font-arabic text-lg text-right text-white leading-loose">{d.arabic}</p>
                  <p className="text-[11px] text-foreground/85 leading-relaxed">{d.translation}</p>
                  {d.ref && <p className="text-[10px] text-muted-foreground text-right">— {d.ref}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
