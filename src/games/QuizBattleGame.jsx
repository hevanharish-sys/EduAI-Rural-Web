import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function QuizBattleGame({ currentLevel, allLevels, levelIndex, setLevelIndex }) {
  const questions = currentLevel?.questions || [];
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const question = questions[index];

  useEffect(() => {
    setIndex(0);
    setSelected(null);
    setLocked(false);
  }, [currentLevel]);

  const handleSelect = (opt) => {
    if (locked) return;

    setSelected(opt);
    setLocked(true);

    const correct = opt === question.answer;

    if (correct) {
      setScore((s) => s + 10);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex(index + 1);
        setSelected(null);
        setLocked(false);
      } else {
        // go to next level
        setLevelIndex((prev) => prev + 1);
      }
    }, 900);
  };

  const optionStyle = (opt) => {
    if (!locked) return "bg-white hover:bg-gray-100 border-gray-200";

    if (opt === question.answer)
      return "bg-green-200 border-green-600";

    if (opt === selected)
      return "bg-red-200 border-red-600";

    return "bg-gray-100 opacity-60";
  };

  return (
    <div className="p-6 w-full">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div className="text-lg font-semibold">
          ⚔️ Battle Mode — Question {index + 1}/{questions.length}
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-3 py-1 rounded-xl shadow text-sm">
            ⭐ Score: <b>{score}</b>
          </div>
          <div className="bg-white px-3 py-1 rounded-xl shadow text-sm">
            🔥 Streak: <b>{streak}</b>
          </div>
        </div>
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h2 className="text-xl font-bold mb-6">
          {question?.question}
        </h2>

        <div className="flex flex-col gap-3">
          {question.options.map((opt, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(opt)}
              disabled={locked}
              className={`w-full text-left px-4 py-3 rounded-xl border text-lg transition-all ${optionStyle(
                opt
              )}`}
            >
              {opt}
            </motion.button>
          ))}
        </div>

        {/* Progress */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all"
            style={{
              width: `${((index + 1) / questions.length) * 100}%`,
            }}
          ></div>
        </div>
      </motion.div>
    </div>
  );
}

