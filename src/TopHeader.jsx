import React from "react";
import { motion } from "framer-motion";

export default function TopHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "Hevan";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-white/60 backdrop-blur-md shadow-sm border-b p-4 px-6 
                 flex items-center justify-between sticky top-0 z-40"
    >
      {/* Left: Avatar + Greeting */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-green-500 
                        flex items-center justify-center text-3xl shadow">
          😊
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-gray-800 text-lg">Hey, {name}!</span>
          <span className="text-sm text-gray-500">Welcome back 👋</span>
        </div>
      </div>

      {/* Right: Language Selector */}
      <button className="bg-white rounded-full px-4 py-2 border shadow text-sm">
        🇬🇧 English
      </button>
    </motion.div>
  );
}
