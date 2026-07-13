import React, { useEffect, useState } from "react";
import { Mail, Shield, Calendar } from "lucide-react";
import { db } from "@/api/apiClient";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.entities.User.list().then((u) => {
      setUsers(u);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div key={u.id} className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-sm font-bold">
            {(u.full_name || u.email || "?")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{u.full_name || "Ism kiritilmagan"}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Mail className="w-3 h-3" /> {u.email}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-white/5 text-muted-foreground"}`}>
              {u.role === "admin" ? <Shield className="w-3 h-3 inline mr-1" /> : ""}{u.role || "user"}
            </span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" /> {new Date(u.created_date).toLocaleDateString("uz")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}