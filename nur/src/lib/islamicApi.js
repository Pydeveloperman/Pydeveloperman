// Bepul Islomiy API yordamchilari

const PRAYER_NAMES = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
export const PRAYER_LABELS = {
  Fajr: "Bomdod",
  Dhuhr: "Peshin",
  Asr: "Asr",
  Maghrib: "Shom",
  Isha: "Xufton",
};

// Namoz vaqtlari - Aladhan API (bepul, kalitsiz)
export async function fetchPrayerTimes(lat, lng) {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`;
  const res = await fetch(url);
  const json = await res.json();
  const t = json.data.timings;
  return PRAYER_NAMES.map((name) => ({
    name,
    label: PRAYER_LABELS[name],
    time: t[name],
  }));
}

// Foydalanuvchi joylashuvi
export function getLocation() {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          // Fallback to Tashkent
          resolve({ lat: 41.2995, lng: 69.2401 });
        },
        { timeout: 5000 }
      );
    } else {
      resolve({ lat: 41.2995, lng: 69.2401 });
    }
  });
}

// Qibla bearing calculation towards Mecca (Kaaba lat: 21.4225, lng: 39.8262)
export function qiblaBearing(lat, lng) {
  const kLat = 21.4225 * Math.PI / 180;
  const kLng = 39.8262 * Math.PI / 180;
  const uLat = lat * Math.PI / 180;
  const uLng = lng * Math.PI / 180;

  const y = Math.sin(kLng - uLng);
  const x = Math.cos(uLat) * Math.tan(kLat) - Math.sin(uLat) * Math.cos(kLng - uLng);
  
  let bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

// Quran API — Alquran API (bepul, kalitsiz)
export async function fetchSurahs() {
  try {
    const res = await fetch("https://api.alquran.cloud/v1/surah");
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error("Failed to fetch surahs", err);
    return [];
  }
}

export async function fetchSurah(surahNumber) {
  try {
    // English translation and Arabic text together
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-simple,uz.sodik`);
    const json = await res.json();
    
    // Combine Arabic and Uzbek translations
    const arabicEdition = json.data[0];
    const uzbekEdition = json.data[1];
    
    const ayahs = arabicEdition.ayahs.map((ayah, idx) => ({
      ...ayah,
      translation: uzbekEdition.ayahs[idx].text
    }));

    return {
      ...arabicEdition,
      ayahs
    };
  } catch (err) {
    console.error("Failed to fetch surah", err);
    return null;
  }
}

// Ayah audio reciters
export const RECITERS = [
  { id: "ar.alafasy", name: "Mishary Rashid Alafasy" },
  { id: "ar.abdulbasitmujawwad", name: "Abdul Basit (Mujawwad)" },
  { id: "ar.hudhaify", name: "Ali Al-Hudhaify" },
  { id: "ar.husary", name: "Mahmoud Khalil Al-Husary" }
];

export function ayahAudioUrl(surahNumber, ayahNumber, reciterId = "ar.alafasy") {
  // Pad surahNumber and ayahNumber to construct the media file ID correctly
  const paddedSurah = String(surahNumber).padStart(3, "0");
  const paddedAyah = String(ayahNumber).padStart(3, "0");
  
  let folder = "Alafasy_128kbps";
  if (reciterId === "ar.abdulbasitmujawwad") {
    folder = "Abdul_Basit_Mujawwad_128kbps";
  } else if (reciterId === "ar.hudhaify") {
    folder = "Hudhaify_128kbps";
  } else if (reciterId === "ar.husary") {
    folder = "Husary_128kbps";
  }

  return `https://everyayah.com/data/${folder}/${paddedSurah}${paddedAyah}.mp3`;
}
