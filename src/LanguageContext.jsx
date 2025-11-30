import React, { createContext, useState, useEffect } from "react";

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(localStorage.getItem("appLang") || "en");

  useEffect(() => {
    localStorage.setItem("appLang", lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}
