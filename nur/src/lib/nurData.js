// Statik ma'lumotlar: kun oyatlari, dualar, ibratlar, fon rasmlar

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dayIndex(mod) {
  const d = new Date();
  return (d.getDate() + d.getMonth() * 31) % mod;
}

export const DAILY_AYAHS = [
  { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Albatta, qiyinchilik bilan birga yengillik bordir.", ref: "Sharh, 6" },
  { arabic: "فَاذْكُرُونِي أَذْكُرْكُمْ", translation: "Meni yod eting, Men ham sizni yod etaman.", ref: "Baqara, 152" },
  { arabic: "وَقُل رَّبِّ زِدْنِي عِلْمًا", translation: "Rabbim, ilmimni ziyoda qilgin, deb ayting.", ref: "Toha, 114" },
  { arabic: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", translation: "Albatta, Alloh sabr qiluvchilar bilan birgadir.", ref: "Baqara, 153" },
  { arabic: "وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ", translation: "U qayerda bo'lsangiz, siz bilan birgadir.", ref: "Hadid, 4" },
  { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً", translation: "Rabbimiz, bizga bu dunyoda ham yaxshilik ato et.", ref: "Baqara, 201" },
  { arabic: "وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ", translation: "Allohning rahmatidan noumid bo'lmang.", ref: "Yusuf, 87" },
  { arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", translation: "Bizga Alloh yetarli, U eng yaxshi vakildir.", ref: "Oli Imron, 173" },
];

export const DAILY_LESSONS = [
  "Payg'ambarimiz (s.a.v.): «Insonlarning eng yaxshisi — boshqalarga eng ko'p foyda keltirganidir.»",
  "«Kim bir qiyinchilikni yengsa, Alloh unga ikki yengillik ato etadi.»",
  "«Tabassum — bu sadaqa.» (Termiziy)",
  "«Kuchli inson — g'azab paytida o'zini tuta olgan kishidir.» (Buxoriy)",
  "«Qo'shningga yaxshilik qil, mo'min bo'lasan.» (Termiziy)",
  "«Alloh toza, faqat tozani qabul qiladi.» (Muslim)",
  "«Ilm izlash har bir musulmonga farzdir.» (Ibn Moja)",
];

export const BG_IMAGES = [
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1080&q=80",
];

export const ZIKR_LIST = [
  { arabic: "سُبْحَانَ اللَّهِ", translation: "Subhanalloh", meaning: "Alloh barcha ayb-nuqsonlardan pokdir" },
  { arabic: "الْحَمْدُ لِلَّهِ", translation: "Alhamdulillah", meaning: "Allohga hamd bo'lsin" },
  { arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ", translation: "La ilaha illalloh", meaning: "Allohdan o'zga iloh yo'q" },
  { arabic: "اللَّهُ أَكْبَرُ", translation: "Allohu Akbar", meaning: "Alloh eng buyukdir" },
  { arabic: "أَسْتَغْفِرُ اللَّهَ", translation: "Astaghfirulloh", meaning: "Allohdan mag'firat so'rayman" }
];

export const DUA_CATEGORIES = [
  {
    id: "morning",
    title: "Tonggi va kechki duolar",
    icon: "Sunrise",
    duas: [
      { id: "m1", title: "Tong otganda o'qiladigan duo", arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", translation: "Tong ottirdik va mulk Allohnikidir." },
      { id: "m2", title: "Kech bo'lganda o'qiladigan duo", arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", translation: "Kech kiritdik va mulk Allohnikidir." }
    ]
  },
  {
    id: "food",
    title: "Taomlanish duolari",
    icon: "UtensilsCrossed",
    duas: [
      { id: "f1", title: "Taomdan oldin", arabic: "بِسْمِ اللَّهِ", translation: "Allohning nomi bilan boshlayman." },
      { id: "f2", title: "Taomdan keyin", arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا", translation: "Bizni to'ydirgan va chanqog'imizni qondirgan Allohga hamd bo'lsin." }
    ]
  },
  {
    id: "travel",
    title: "Safar duolari",
    icon: "Plane",
    duas: [
      { id: "t1", title: "Ulovga minganda", arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا", translation: "Bizga buni bo'ysundirgan zot pokdir." }
    ]
  },
  {
    id: "health",
    title: "Shifo va salomatlik",
    icon: "HeartPulse",
    duas: [
      { id: "h1", title: "Kasal bo'lganda", arabic: "أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ", translation: "Ey insonlar Parvardigori, kasallikni ketkaz va shifo ber." }
    ]
  }
];
