import { useState, useEffect } from "react";

// Telegram Mini App user hook — reads Telegram user info from WebApp SDK
export function useTelegramUser() {
  const [tgUser, setTgUser] = useState(null);
  const [tgReady, setTgReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      setTgReady(true);
      return;
    }

    tg.ready();
    tg.expand();

    const user = tg.initDataUnsafe?.user;
    if (user) {
      setTgUser({
        id: user.id,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        username: user.username || "",
        fullName: [user.first_name, user.last_name].filter(Boolean).join(" "),
        languageCode: user.language_code || "",
      });
    }

    // Configure Telegram theme
    if (tg.setHeaderColor) {
      tg.setHeaderColor("#0a1512");
    }
    if (tg.setBackgroundColor) {
      tg.setBackgroundColor("#0a1512");
    }

    setTgReady(true);
  }, []);

  return { tgUser, tgReady, isTelegram: !!window.Telegram?.WebApp };
}