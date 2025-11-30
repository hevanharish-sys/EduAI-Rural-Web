import React from "react";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const lb = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  // Sort: highest score → highest XP
  const sorted = lb
    .slice()
    .sort((a, b) => b.score - a.score || b.xp - a.xp)
    .slice(0, 20);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 pb-24"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Leaderboard 🏆</h1>

        <div className="bg-white rounded-2xl p-4 shadow">
          <ol className="space-y-3">
            {sorted.map((u, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center p-3 border rounded-lg"
              >
                <div>
                  <div className="font-semibold">{u.name || "Guest"}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(u.date).toLocaleString()}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">{u.score} pts</div>
                  <div className="text-xs text-gray-500">{u.xp} XP</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </motion.div>
  );
}
