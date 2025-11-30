import React, { useContext, useState } from "react";
import { LanguageContext } from "../LanguageContext";
import { translations } from "../data/translations";
import LanguageSwitcher from "../LanguageSwitcher";

export default function Login() {
  const { lang } = useContext(LanguageContext);
  const t = translations[lang];

  const [username, setUsername] = useState("");

  const handleLogin = () => {
    if (!username.trim()) return alert(t.enterName);

    localStorage.setItem("studentName", username);
    window.location.href = "/home"; // redirect after login
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100 p-6">

      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>

      <div className="bg-white/80 backdrop-blur-lg shadow-xl p-10 rounded-3xl max-w-sm w-full text-center">

        <h1 className="text-3xl font-bold mb-3">
          {t.welcome}
        </h1>

        <p className="text-gray-600 mb-6">
          {t.loginMessage}
        </p>

        <input
          type="text"
          placeholder={t.enterName}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 rounded-xl border border-gray-300 mb-4 shadow-sm focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-3 rounded-xl text-lg font-semibold shadow hover:bg-blue-600 transition-all"
        >
          {t.login}
        </button>
      </div>
    </div>
  );
}

