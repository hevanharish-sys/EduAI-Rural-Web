// src/pages/QuizResult.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function QuizResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const score = state?.score ?? 0;
  const total = state?.total ?? 0;
  const answers = state?.answers ?? [];

  const pct = total ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    // clear saved quiz progress
    localStorage.removeItem("quiz-progress");

    // Confetti blast on results load!
    setTimeout(() => {
      confetti({
        particleCount: 180,
        spread: 80,
        startVelocity: 40,
        origin: { x: 0.5, y: 0.6 }
      });

      if (pct === 100) {
        // bonus confetti reward
        confetti({
          particleCount: 300,
          spread: 120,
          startVelocity: 60,
          origin: { x: 0.5, y: 0.6 }
        });
      }
    }, 200);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="p-6 pb-24">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-white p-8 rounded-2xl shadow inline-block w-full">
          
          <h2 className="text-4xl font-bold text-purple-600">{score}/{total}</h2>
          <p className="mt-2 text-gray-600">You scored {pct}%</p>

          <div className="mt-4 text-xl">
            {pct === 100 ? "🏆 Perfect Score!" : pct >= 60 ? "🎉 Great Job!" : "✨ Keep Practicing!"}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            {answers.map((a, idx) => (
              <div key={idx} className="p-3 border rounded-lg text-left bg-gray-50">
                <div className="font-semibold">Q{a.id}</div>
                <div className="text-sm text-gray-600">
                  Answered: {a.selected === null ? "Skipped" : String.fromCharCode(65 + a.selected)}
                </div>
                <div className="text-sm">
                  {a.correct ? (
                    <span className="text-green-600">Correct ✔</span>
                  ) : (
                    <span className="text-red-600">Wrong ✘</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => navigate("/quiz")} className="px-4 py-2 rounded-lg border">Try Again</button>
            <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">Back Home</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
