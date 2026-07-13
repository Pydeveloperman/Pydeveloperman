import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import SurahList from "@/components/quran/SurahList";
import QuranReader from "@/components/quran/QuranReader";

export default function Quran() {
  const { surahNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state; // { name, ayah }

  if (surahNumber) {
    return (
      <QuranReader
        surahNumber={Number(surahNumber)}
        surahName={state?.name || ""}
        startAyah={state?.ayah}
        onBack={() => navigate("/quran")}
      />
    );
  }

  return (
    <SurahList
      onOpen={(number, name, ayah) => navigate(`/quran/${number}`, { state: { name, ayah } })}
    />
  );
}