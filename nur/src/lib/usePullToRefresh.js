import { useState, useRef, useEffect } from "react";

// Pull-to-refresh hook — window scroll asosida ishlaydi
export function usePullToRefresh(onRefresh, options = {}) {
  const { threshold = 70, maxPull = 120 } = options;
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);
  const pullDist = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (refreshingRef.current) return;
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      } else {
        pulling.current = false;
      }
    };

    const handleTouchMove = (e) => {
      if (!pulling.current || refreshingRef.current) return;
      const currentY = e.touches[0].clientY;
      const dy = currentY - startY.current;
      if (dy > 0) {
        // Prevent default browser refresh/scroll
        if (e.cancelable) e.preventDefault();
        // Logarithmic/resistance pulling
        const dist = Math.min(maxPull, dy * 0.5);
        pullDist.current = dist;
        setPullDistance(dist);
      } else {
        pulling.current = false;
        pullDist.current = 0;
        setPullDistance(0);
      }
    };

    const handleTouchEnd = async () => {
      if (!pulling.current || refreshingRef.current) return;
      pulling.current = false;
      const finalDist = pullDist.current;
      pullDist.current = 0;

      if (finalDist >= threshold) {
        setRefreshing(true);
        refreshingRef.current = true;
        setPullDistance(threshold);
        try {
          if (onRefreshRef.current) {
            await onRefreshRef.current();
          }
        } catch (err) {
          console.error("Refresh failed", err);
        } finally {
          setRefreshing(false);
          refreshingRef.current = false;
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [threshold, maxPull]);

  return { pullDistance, refreshing };
}
