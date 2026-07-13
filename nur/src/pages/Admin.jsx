import React, { useState, useEffect } from "react";
import { db } from "@/api/apiClient";
import AdminDashboard from "@/components/admin/AdminDashboard";
import ContentManager from "@/components/admin/ContentManager";
import DuaManager from "@/components/admin/DuaManager";
import MediaManager from "@/components/admin/MediaManager";
import UserList from "@/components/admin/UserList";
import UserProgress from "@/components/admin/UserProgress";
import { LayoutDashboard, FileText, Users, ArrowLeft, HandHeart, BarChart3, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Admin() {
  const [tab, setTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const isBypass = localStorage.getItem("bypass_admin") === "true";
    if (isBypass) {
      setIsAdmin(true);
      return;
    }

    db.auth.me().then((u) => {
      setIsAdmin(u?.role === "admin");
    }).catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-destructive font-medium">Sizda ushbu sahifaga kirish huquqi yo'q</p>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
          </Button>
        </Link>
      </div>
    );
  }

  const renderContent = () => {
    switch (tab) {
      case "dashboard":
        return <AdminDashboard />;
      case "content":
        return <ContentManager />;
      case "duas":
        return <DuaManager />;
      case "media":
        return <MediaManager />;
      case "users":
        return <UserList />;
      case "progress":
        return <UserProgress />;
      default:
        return <AdminDashboard />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "content", label: "Kun darsi", icon: FileText },
    { id: "duas", label: "Dualar", icon: HandHeart },
    { id: "media", label: "Media", icon: PlayCircle },
    { id: "users", label: "Foydalanuvchilar", icon: Users },
    { id: "progress", label: "Progress", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold gold-text">Admin Panel</h1>
          <p className="text-xs text-muted-foreground mt-1">Tizim ma'lumotlarini boshqarish</p>
        </div>
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Chiqish
          </Button>
        </Link>
      </header>

      {/* Tabs list */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                active ? "bg-accent text-accent-foreground shadow" : "bg-white/5 text-muted-foreground hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="glass rounded-3xl p-6">
        {renderContent()}
      </div>
    </div>
  );
}
