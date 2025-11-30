import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function QuizSelect() {
  return (
    <div className="relative min-h-screen p-6 overflow-hidden">

      {/* Animated BG */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="absolute -top-20 -right-20 w-96 h-96 bg-purple-300 rounded-full opacity-40 blur-3xl"
      />

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
        className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-300 rounded-full opacity-40 blur-3xl"
      />

      <div className="relative z-10">
        <h1 className="text-4xl font-extrabold">Voice Quiz</h1>
        <p className="text-gray-600 mt-1">
          Choose the quiz mode you want to learn!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          <QuizCard title="English" color="from-blue-400 to-blue-600" subject="english" />
          <QuizCard title="Maths" color="from-yellow-400 to-orange-500" subject="maths" />
          <QuizCard title="Science" color="from-green-400 to-green-600" subject="science" />
          <QuizCard title="GK" color="from-purple-400 to-pink-500" subject="gk" />
          <QuizCard title="Computer" color="from-gray-500 to-gray-700" subject="computer" />
        </div>
      </div>
    </div>
  );
}

function QuizCard({ title, color, subject }) {
  return (
    <Link to={`/quiz?subject=${subject}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow text-white`}
      >
        <h2 className="text-2xl font-bold">{title}</h2>
        <p>Start Quiz →</p>
      </motion.div>
    </Link>
  );
}


