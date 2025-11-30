import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

export default function BottomNav() {
  const navItems = [
    { path: "/", label: "Home", icon: "🏡" },
    { path: "/movie", label: "Movie", icon: "🎬" },
    { path: "/quiz", label: "Quiz", icon: "🧠" },
    { path: "/game", label: "Game", icon: "🎮" },
    { path: "/progress", label: "Progress", icon: "📈" }
  ];

  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md py-2 px-4 flex justify-between sm:justify-evenly z-50"
    >
      {navItems.map((item, index) => (
        <NavLink
          key={index}
          to={item.path}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-purple-600 font-bold" : "text-gray-500"
            }`
          }
        >
          <span className="text-2xl">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </motion.div>
  );
}
