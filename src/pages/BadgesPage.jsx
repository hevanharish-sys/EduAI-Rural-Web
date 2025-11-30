import React from "react";
import { motion } from "framer-motion";

export default function BadgesPage() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");

  const badges = profile.badges || [];
  const xp = profile.xp || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 pb-24"
    >
      <h1 className="text-2xl font-bold mb-4">🎖 Your Badges & XP</h1>

      <div className="bg-white p-5 rounded-2xl shadow">
        <div className="mb-6">
          <p className="text-sm text-gray-500">Total XP</p>
          <h2 className="text-3xl font-bold text-purple-600">{xp}</h2>
        </div>

        <h3 className="font-semibold mb-2">Badges</h3>
        <div className="flex gap-3 flex-wrap">
          {badges.length === 0 && (
            <div className="text-gray-500 text-sm">No badges earned yet.</div>
          )}

          {badges.map((b, i) => (
            <div
              key={i}
              className="px-4 py-2 rounded-xl bg-yellow-100 text-yellow-700 font-medium"
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
