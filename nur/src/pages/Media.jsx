import React, { useState, useEffect, useCallback } from "react";
import { db } from "@/api/apiClient";
import { Video, Music, ExternalLink, Play, AlertCircle } from "lucide-react";
import { usePullToRefresh } from "@/lib/usePullToRefresh";
import PullRefreshIndicator from "@/components/common/PullRefreshIndicator";

export default function Media() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "video", "audio"

  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch media records from database
      const records = await db.entities.Media.filter({});
      setMediaList(records || []);
    } catch (err) {
      console.error("Failed to fetch media", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const { pullDistance, refreshing } = usePullToRefresh(fetchMedia);

  const filteredMedia = mediaList.filter((m) => {
    if (activeTab === "all") return true;
    return m.type === activeTab;
  });

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    // Handle standard watch links, share links, or just IDs
    let id = "";
    if (url.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(new URL(url).search);
      id = urlParams.get("v") || "";
    } else if (url.includes("youtu.be/")) {
      id = url.split("youtu.be/")[1]?.split("?")[0] || "";
    } else if (url.includes("youtube.com/embed/")) {
      id = url.split("youtube.com/embed/")[1]?.split("?")[0] || "";
    } else {
      id = url; // assume direct ID
    }
    return `https://www.youtube.com/embed/${id}`;
  };

  return (
    <div className="space-y-5">
      <PullRefreshIndicator pullDistance={pullDistance} refreshing={refreshing} />

      <header className="text-center">
        <h1 className="text-2xl font-bold gold-text flex items-center justify-center gap-1.5">
          <Play className="w-5 h-5 text-accent fill-accent/10" /> Islomiy media
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Videolar, ma'ruzalar va foydali audiolar</p>
      </header>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/5 p-1">
        {[
          { id: "all", label: "Barchasi" },
          { id: "video", label: "Videolar", icon: Video },
          { id: "audio", label: "Audiolar", icon: Music },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12 glass rounded-2xl p-6 space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm font-medium text-foreground">Hozircha media fayllar yo'q</p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Admin panel orqali foydali video darsliklar va ma'ruzalarni joylashtirishingiz mumkin.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMedia.map((media) => {
            const isYoutube = media.source === "youtube";
            return (
              <div key={media.id} className="glass rounded-2xl overflow-hidden flex flex-col">
                {isYoutube ? (
                  <div className="relative aspect-video w-full bg-black/45">
                    <iframe
                      src={getYouTubeEmbedUrl(media.url)}
                      title={media.title}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <Music className="w-5 h-5 text-accent" />
                      </span>
                      <div className="text-left">
                        <p className="text-sm font-semibold leading-tight">{media.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{media.source}</p>
                      </div>
                    </div>
                    {media.url && (
                      <a
                        href={media.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noopener noreferrer"
                        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 active:scale-95 transition-transform shrink-0"
                      >
                        <ExternalLink className="w-4 h-4 text-white" />
                      </a>
                    )}
                  </div>
                )}

                {isYoutube && (
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-accent shrink-0" />
                      <p className="text-sm font-semibold leading-tight text-left">{media.title}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
