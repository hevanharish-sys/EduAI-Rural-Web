import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Progress() {
  const [progress, setProgress] = useState({
  xp: 0,
  quizzes: 0,
  correct: 0,
  lastGrade: "N/A",
  lastSubject: "N/A",
  subjectStats: {
    english: 0,
    maths: 0,
    science: 0,
    gk: 0,
    computer: 0
  },
  streak: 0,
  lastPlayed: null,

  // ⭐ Weekly goal system
  weeklyXP: 0,
  weeklyTarget: 200,    // Modify target if you want
  weekStart: null
});


  // Load Progress
// Auto-reset weekly XP on Monday
useEffect(() => {
  const saved = localStorage.getItem("user-progress");
  if (!saved) return;

  const data = JSON.parse(saved);
  const today = new Date();
  const day = today.getDay(); // Monday = 1

  // If no weekStart, initialize it
  if (!data.weekStart) {
    data.weekStart = today.toDateString();
    localStorage.setItem("user-progress", JSON.stringify(data));
    setProgress(data);
    return;
  }

  // If it's a new week -> reset weekly XP
  const lastWeek = new Date(data.weekStart);
  const diffDays = Math.floor((today - lastWeek) / (1000 * 3600 * 24));

  if (diffDays >= 7) {
    data.weeklyXP = 0;
    data.weekStart = today.toDateString();
    localStorage.setItem("user-progress", JSON.stringify(data));
    setProgress(data);
  }
}, []);


  return (
    <motion.div
      className="p-6 pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-4">📊 Your Learning Progress</h1>

      {/* XP CARD */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-6"
      >
        <h2 className="text-xl font-bold">Level Progress</h2>

        <p className="text-5xl font-extrabold mt-3">{progress.xp} XP</p>

        <div className="mt-4 w-full bg-white/30 h-3 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.xp % 100}%` }}
            transition={{ duration: 1 }}
            className="h-full bg-white"
          ></motion.div>
        </div>

        <p className="mt-2 text-sm">Next level at {(Math.floor(progress.xp / 100) + 1) * 100} XP</p>
      </motion.div>
      {/* WEEKLY GOAL BOX */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-yellow-100 p-5 rounded-2xl shadow mb-6"
>
  <h2 className="text-xl font-bold text-yellow-800">⭐ Weekly Goal</h2>

  <p className="text-gray-800 mt-1">
    Earn <b>{progress.weeklyTarget} XP</b> this week
  </p>

  {/* Weekly Progress Bar */}
  <div className="w-full bg-yellow-300 h-3 rounded-full mt-3 overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{
        width: `${Math.min(
          (progress.weeklyXP / progress.weeklyTarget) * 100,
          100
        )}%`
      }}
      transition={{ duration: 0.8 }}
      className="h-full bg-yellow-600 rounded-full"
    ></motion.div>
  </div>

  {/* Goal Status */}
  <p className="mt-2 font-semibold">
    {progress.weeklyXP >= progress.weeklyTarget
      ? "🎉 Goal Completed!"
      : progress.weeklyXP >= progress.weeklyTarget / 2
      ? "🔥 Almost there!"
      : "💪 Keep going!"}
  </p>
</motion.div>


      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-5 rounded-xl shadow-md"
        >
          <h3 className="font-semibold text-gray-700">Quizzes Done</h3>
          <p className="text-3xl font-bold mt-1">{progress.quizzes}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-5 rounded-xl shadow-md"
        >
          <h3 className="font-semibold text-gray-700">Correct Answers</h3>
          <p className="text-3xl font-bold mt-1">{progress.correct}</p>
        </motion.div>
      </div>

      {/* Streak */}
      <motion.div
  initial={{ scale: 0.9, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  className="bg-orange-100 p-4 rounded-xl shadow mb-6 flex items-center gap-3"
>
  <motion.div
    animate={{ y: [0, -5, 0] }}
    transition={{ repeat: Infinity, duration: 0.8 }}
    className="text-5xl"
  >
    🔥
  </motion.div>

  <div>
    <h3 className="font-semibold text-gray-800">Daily Streak</h3>
    <p className="text-lg font-bold">{progress.streak} days</p>
  </div>
</motion.div>

      {/* Last Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-4 rounded-xl shadow mb-6"
      >
        <h3 className="font-semibold text-gray-700">Last Activity</h3>
        <p className="mt-2 text-gray-600">
          Grade: <b>{progress.lastGrade}</b> <br />
          Subject: <b>{progress.lastSubject}</b>
        </p>
      </motion.div>

      {/* SUBJECT PROGRESS */}
      <h2 className="text-xl font-bold mb-3">📘 Subject Progress</h2>

      <div className="space-y-4">
        {Object.keys(progress.subjectStats).map((sub) => (
          <motion.div
            key={sub}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-4 rounded-xl shadow"
          >
            <p className="font-semibold capitalize mb-2">{sub}</p>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.subjectStats[sub]}%` }}
                transition={{ duration: 1 }}
                className={`h-3 rounded-full ${sub === "maths"
                    ? "bg-green-500"
                    : sub === "science"
                    ? "bg-red-500"
                    : sub === "gk"
                    ? "bg-yellow-500"
                    : sub === "computer"
                    ? "bg-indigo-500"
                    : "bg-blue-500"
                  }`}
              ></motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <h2 className="text-xl font-bold mt-8 mb-2">🕒 Recent Activity</h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-4 rounded-xl shadow"
      >
        <p className="text-gray-600">
          {progress.lastPlayed
            ? `You last practiced on ${progress.lastPlayed}`
            : "No activity recorded yet"}
        </p>
      </motion.div>
    </motion.div>
  );
}



