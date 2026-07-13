import { db } from "@/api/apiClient";

const STORAGE_KEY = "nur_notification_enabled";
const timeouts = [];

export function isNotificationEnabled() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setNotificationEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function hasNotificationSupport() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestPermission() {
  if (!hasNotificationSupport()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function clearScheduled() {
  timeouts.forEach(clearTimeout);
  timeouts.length = 0;
}

function scheduleOne(prayer, baseDate = new Date()) {
  const [h, m] = prayer.time.split(":").map(Number);
  const target = new Date(baseDate);
  target.setHours(h, m, 0, 0);

  // Agar vaqt o'tib bo'lsa — ertaga uchun rejalashtirish
  if (target <= new Date()) {
    target.setDate(target.getDate() + 1);
  }

  const delay = target - new Date();
  if (delay <= 0) return;

  const id = setTimeout(() => {
    fireNotification(prayer);
    // Iloka ochiq bo'lsa — keyingi kun uchun qayta rejalashtirish
    scheduleOne(prayer, new Date(Date.now() + 86400000));
  }, delay);
  timeouts.push(id);
}

export function schedulePrayerNotifications(times) {
  clearScheduled();
  if (!isNotificationEnabled() || !hasNotificationSupport()) return;
  if (Notification.permission !== "granted") return;
  times.forEach((p) => scheduleOne(p));
}

async function fireNotification(prayer) {
  if (!isNotificationEnabled() || Notification.permission !== "granted") return;

  try {
    new Notification(`🕌 ${prayer.label} namozi`, {
      body: `${prayer.label} namozini o'qish vaqti keldi. Alloh qabul qilsin!`,
      tag: `prayer-${prayer.name}`,
      requireInteraction: false,
      silent: false,
    });

    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

    // Tarixga yozish
    await db.entities.NotificationLog.create({
      prayer_name: prayer.name,
      prayer_label: prayer.label,
      sent_at: new Date().toISOString(),
    });
  } catch {
    // Notification ruxsat etilmagan yoki xato
  }
}