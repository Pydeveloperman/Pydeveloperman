// Media utilities for YouTube and other sources

export const MEDIA_CATEGORIES = [
  "Ma'ruza",
  "Quron darslari",
  "Hujjatli film",
  "Nashid",
  "Siyrat",
  "Boshqa"
];

export function parseYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function youtubeThumb(id) {
  if (!id) return "";
  return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}
