import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// --- Sound Effects ---
const hoverSound = new Audio("/sounds/hover.mp3");
const clickSound = new Audio("/sounds/click.mp3");

// Game categories
const categories = ["All", "Puzzle", "Drag & Drop", "Battle"];

const games = [
  {
    id: "puzzle",
    title: "Puzzle Mode",
    desc: "Rearrange tiles and solve picture puzzles",
    icon: "🧩",
    category: "Puzzle",
    gradient: "from-purple-400 to-indigo-500",
    link: "/game?subject=puzzle",
  },
  {
    id: "dragdrop",
    title: "Drag & Drop",
    desc: "Match items using drag and drop",
    icon: "🖱️",
    category: "Drag & Drop",
    gradient: "from-blue-400 to-blue-600",
    link: "/game?subject=dragdrop",
  },
  {
    id: "battle",
    title: "Quiz Battle",
    desc: "Fast-paced answer battle",
    icon: "⚔️",
    category: "Battle",
    gradient: "from-red-400 to-pink-600",
    link: "/game?subject=battle",
  },
];

export default function GameMenu() {
  const [selected, setSelected] = useState("All");
  const [dark, setDark] = useState(false);

  // Theme toggle
  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  const filtered = selected === "All"
    ? games
    : games.filter((g) => g.category === selected);

  return (
    <div className="relative p-6 min-h-screen overflow-hidden bg-gradient-to-br from-[#f0f4ff] to-[#e8f0ff] dark:from-[#0a0a0f] dark:to-[#1a1a25] transition-all">

      {/* 🌌 Animated Blurred Background Orbs */}
      <motion.div
        className="absolute top-0 left-0 w-80 h-80 bg-purple-400/30 rounded-full blur-[120px]"
        animate={{ x: [0, 50, -30], y: [0, 40, -20] }}
        transition={{ repeat: Infinity, duration: 12 }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-[150px]"
        animate={{ x: [0, -40, 20], y: [0, -50, 30] }}
        transition={{ repeat: Infinity, duration: 15 }}
      />

      {/* 🌠 Star Particle Layer */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(80)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/80 dark:bg-white"
            animate={{ y: ["0vh", "100vh"] }}
            transition={{
              repeat: Infinity,
              duration: 4 + Math.random() * 6,
              delay: Math.random() * 3,
            }}
            style={{
              left: Math.random() * 100 + "%",
              opacity: Math.random(),
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-extrabold text-center text-gray-800 dark:text-white mb-2"
      >
        Game Time 🎮
      </motion.h1>

      <p className="text-center text-gray-600 dark:text-gray-300 mb-10">
        Choose a game and start learning with fun!
      </p>

      {/* 🌗 Theme Toggle */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setDark(!dark)}
          className="px-4 py-2 rounded-full bg-white dark:bg-black border shadow text-sm"
        >
          {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex justify-center flex-wrap gap-3 mb-10">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setSelected(cat)}
            whileTap={{ scale: 0.9 }}
            className={`px-4 py-2 rounded-full border backdrop-blur-lg 
            ${selected === cat
              ? "bg-indigo-500 text-white shadow-lg"
              : "bg-white/60 dark:bg-white/10 text-gray-800 dark:text-gray-200"
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Game Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.map((game) => (
          <Link to={game.link} key={game.id}>
            <motion.div
              onMouseEnter={() => hoverSound.play()}
              onClick={() => clickSound.play()}
              className="relative p-6 rounded-3xl shadow-xl border 
                bg-white/30 dark:bg-white/5 backdrop-blur-xl cursor-pointer 
                transition-all hover:shadow-2xl hover:-translate-y-1"

              whileHover={{ scale: 1.06, rotate: 1 }}
              whileTap={{ scale: 0.97 }}

              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                card.style.transform = `rotateY(${x / 20}deg) rotateX(${-y / 20}deg)`;
              }}

              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "rotateY(0deg) rotateX(0deg)";
              }}
            >
              {/* Shimmer overlay */}
              <div className="absolute inset-0 opacity-0 hover:opacity-20 transition bg-white/40 blur-lg rounded-3xl"></div>

              <div className={`w-14 h-14 bg-gradient-to-br ${game.gradient} rounded-2xl flex items-center justify-center text-3xl text-white shadow-xl mb-4`}>
                {game.icon}
              </div>

              <h2 className="text-xl font-bold dark:text-white">{game.title}</h2>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                {game.desc}
              </p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}



