import React, { useContext } from "react";
import { LanguageContext } from "../src/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useContext(LanguageContext);

  return (
    <div className="flex gap-2 bg-white/70 px-4 py-2 rounded-full shadow">
      {["en", "hi", "ta", "ml"].map((code) => (
        <button
          key={code}
          className={`px-2 font-semibold ${
            lang === code ? "text-blue-600" : "text-gray-500"
          }`}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
