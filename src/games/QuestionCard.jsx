import React from "react";
import { motion } from "framer-motion";

export default function QuestionCard({
  question,
  index,
  total,
  timer,
  selected,
  isLocked,
  onAnswer
}) {
  if (!question) return null;

  const getOptionStyle = (opt) => {
    if (!isLocked) return "bg-gray-100 hover:bg-gray-200";

    if (opt === question.answer) return "bg-green-200 border-green-500";
    if (opt === selected) return "bg-red-200 border-red-500";

    return "bg-gray-100 opacity-60";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-xl p-6 rounded-2xl max-w-4xl w-full mx-auto"
    >
      <div className="flex justify-between text-sm text-gray-500 mb-3">
        <div>Question {index + 1} of {total}</div>
        <div>{timer}s</div>
      </div>

      <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <motion.button
            key={i}
            onClick={() => onAnswer(opt)}
            whileTap={{ scale: 0.97 }}
            disabled={isLocked}
            className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${getOptionStyle(opt)}`}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}



