import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BookOpen, HandHeart, Compass, PlayCircle, User } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Bosh" },
  { to: "/quran", icon: BookOpen, label: "Qur'on" },
  { to: "/duas", icon: HandHeart, label: "Dualar" },
  { to: "/media", icon: PlayCircle, label: "Media" },
  { to: "/qibla", icon: Compass, label: "Qibla" },
  { to: "/profile", icon: User, label: "Profil" },
];

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 glass border-t border-white/5"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around px-2 py-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all ${
                isActive ? "text-accent" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}