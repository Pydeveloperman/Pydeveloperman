import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, Trash2, Copy, Check, MessageSquare, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STARTER_PROMPTS = [
  { text: "Namozda xushu va diqqatga qanday erishiladi?", label: "Namozda xushu" },
  { text: "Qur'on o'qish va yodlash sirlari haqida gapiring.", label: "Qur'on foydalari" },
  { text: "Duolarning ijobat bo'lish shartlari va odoblari nimalar?", label: "Duolar ijobati" },
  { text: "Kundalik hayotda ixlos va samimiyatni qanday saqlash mumkin?", label: "Ixlos va samimiyat" }
];

const SYSTEM_INSTRUCTION = `Siz "Nur" islomiy ilovasining aqlli, samimiy va ma'rifatli AI yordamchisiz (assistant).
Foydalanuvchilarga islomiy savollar, kunlik ibodatlar, Qur'on, hadislar, odob-ahloq va ruhiy yuksalish haqida samimiy, ishonchli, to'g'ri va tushunarli javoblar bering.
Quyidagi qoidalarga qat'iy rioya qiling:
1. Har doim o'ta muloyim, hurmat bilan va samimiy ohangda javob bering.
2. Mumkin qadar javoblaringizni Qur'on oyatlari (sura va oyat raqamlari bilan) va sahih hadislar bilan asoslang.
3. Agar savol islomiy yoki tarbiyaviy mavzulardan butunlay uzoq bo'lsa, uni chiroyli tarzda islomiy va foydali hikmatlarga bog'lab javob bering yoki muloyimlik bilan foydaliroq mavzularda so'rashini taklif qiling.
4. Javoblarni chiroyli qilib markdown formatda (kichik sarlavhalar, bullet pointlar bilan) taqdim eting, o'qish qulay bo'lsin.
5. Har bir javobingiz oxirida qisqacha duo yoki xayrli tilak bildiring.`;

export default function AiAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("nur_ai_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        console.warn("Could not parse saved chat history:", e);
      }
    } else {
      // Welcome message
      setMessages([
        {
          sender: "ai",
          text: "Assalomu alaykum va rahmatullohi va barakotuh! Men Nur AI islomiy yordamchingizman. Sizga qanday yordam bera olaman?",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Save chat history to localStorage
  const saveHistory = (newMessages) => {
    setMessages(newMessages);
    localStorage.setItem("nur_ai_chat_history", JSON.stringify(newMessages));
  };

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    if (!textToSend) setInput("");

    const updatedMessages = [
      ...messages,
      { sender: "user", text, timestamp: new Date().toISOString() }
    ];
    saveHistory(updatedMessages);
    setLoading(true);

    try {
      // Build session prompt for Gemini API
      // To simulate conversational memory, we can merge the last 6 messages
      const conversationContext = updatedMessages.slice(-6).map(m => {
        return m.sender === "user" ? `User: ${m.text}` : `AI: ${m.text}`;
      }).join("\n");

      const response = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Mana suhbat davomi:\n${conversationContext}\n\nAI (iltimos faqat javobni bering):`,
          systemInstruction: SYSTEM_INSTRUCTION
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        saveHistory([
          ...updatedMessages,
          { sender: "ai", text: data.text, timestamp: new Date().toISOString() }
        ]);
      } else {
        throw new Error(data.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error("Gemini call failed:", err);
      saveHistory([
        ...updatedMessages,
        {
          sender: "ai",
          text: "Uzr so'rayman, internet aloqasida yoki tizimda xatolik yuz berdi. Iltimos, birozdan so'ng qayta urinib ko'ring yoki sozlamalardan API kalitingiz o'rnatilganini tekshiring.",
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Barcha suhbatlar tarixini o'chirib tashlamoqchimisiz?")) {
      const welcome = [
        {
          sender: "ai",
          text: "Assalomu alaykum va rahmatullohi va barakotuh! Men Nur AI islomiy yordamchingizman. Sizga qanday yordam bera olaman?",
          timestamp: new Date().toISOString()
        }
      ];
      saveHistory(welcome);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] min-h-[350px] glass rounded-2xl overflow-hidden border border-emerald-500/10">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-emerald-950/20 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-accent fill-accent/10" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Suhbat</h3>
            <p className="text-[10px] text-muted-foreground">Nur Islomiy Ma'rifiy Yordamchisi</p>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Tarixni tozalash"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs relative group transition-all text-left ${
                  msg.sender === "user"
                    ? "bg-accent text-accent-foreground rounded-tr-none"
                    : msg.isError
                    ? "bg-red-500/10 border border-red-500/25 text-red-200 rounded-tl-none"
                    : "bg-white/5 border border-white/5 text-foreground/95 rounded-tl-none"
                }`}
              >
                {/* Text render */}
                <div className="whitespace-pre-line leading-relaxed prose prose-invert max-w-none">
                  {msg.text}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[9px] text-muted-foreground">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                  <button
                    onClick={() => handleCopy(msg.text, index)}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-white/10 text-muted-foreground hover:text-white transition-all ml-2"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/5 text-foreground/90 rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Starter Prompts - only show when there is just 1 message (the welcome message) */}
      {messages.length === 1 && !loading && (
        <div className="px-4 py-2 border-t border-white/5 bg-emerald-950/5 space-y-1.5 text-left">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold uppercase tracking-wider">
            <MessageSquare className="w-3 h-3 text-accent" /> Tavsiya etilgan mavzular
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt.text)}
                className="text-[10px] px-2.5 py-1.5 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/15 text-emerald-300 hover:text-white transition-all flex items-center gap-1 border border-emerald-500/10 text-left"
              >
                {prompt.label}
                <ArrowRight className="w-2.5 h-2.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 border-t border-white/5 bg-emerald-950/10 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ismd yoki islomiy amallar haqida so'rang..."
          disabled={loading}
          className="flex-1 bg-white/5 hover:bg-white/10 focus:bg-white/10 text-xs text-white placeholder-muted-foreground rounded-xl px-3.5 py-2.5 outline-none transition-all border border-white/5 focus:border-accent/40"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-accent text-accent-foreground hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none transition-all flex items-center justify-center shadow-md shadow-accent/10"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
