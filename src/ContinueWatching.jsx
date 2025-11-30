import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ContinueWatching({ lesson, time }) {
  const nav = useNavigate();
  if (!lesson) return null;

  const resumeText = `Resume at ${Math.floor(time)}s`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-4 border cursor-pointer"
      onClick={() => nav("/movie")}
    >
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-indigo-300 to-pink-300 flex items-center justify-center text-xl">
        🎬
      </div>

      {/* Text */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <div className="font-semibold text-sm">{lesson.title}</div>
            <div className="text-xs text-gray-500 mt-1">{lesson.desc}</div>
          </div>
          <div className="text-xs text-gray-400">{resumeText}</div>
        </div>

        {/* Progress indicator */}
        <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
          <div className="h-2 bg-purple-500 rounded-full" style={{ width: "28%" }} />
        </div>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); nav("/movie"); }}
        className="ml-3 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm"
      >
        Continue
      </button>
    </motion.div>
  );
}

