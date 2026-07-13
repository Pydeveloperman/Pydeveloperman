import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/nav/BottomNav";

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-0 inset-x-0 h-72 bg-gradient-to-b from-emerald-950/40 to-transparent pointer-events-none" />
      <main
        className="relative max-w-md mx-auto px-4 no-scrollbar"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 24px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 112px)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}