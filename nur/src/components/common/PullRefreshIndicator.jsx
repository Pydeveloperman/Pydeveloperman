import React from "react";
import { Loader2, ArrowDown } from "lucide-react";

export default function PullRefreshIndicator({ pullDistance, refreshing, threshold = 70 }) {
  if (pullDistance <= 0 && !refreshing) return null;
  const progress = Math.min(pullDistance / threshold, 1);
  return (
    <div
      className="flex items-center justify-center overflow-hidden"
      style={{ height: `${pullDistance}px` }}
    >
      {refreshing ? (
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
      ) : (
        <ArrowDown
          className="w-5 h-5 text-accent transition-opacity"
          style={{ transform: `rotate(${progress < 1 ? 0 : 180}deg)`, opacity: progress }}
        />
      )}
    </div>
  );
}