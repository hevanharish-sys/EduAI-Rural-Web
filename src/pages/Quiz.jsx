import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import QuestionCard from "../games/QuestionCard";
import { loadQuiz } from "../data/lessonLoader"; // uses import.meta.glob loader

// ---- ANIMATED BACKGROUND ----
const AnimatedBackground = () => (
  <div className="absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-blue-200 to-indigo-200 animate-gradient" />
    <style>{`
      .animate-gradient {
        background-size: 400% 400%;
        animation: gradientMove 12s ease infinite;
      }
      @keyframes gradientMove {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  </div>
);

// ---- NORMALIZER (Fixes repeating options, ensures correct answer) ----
function normalizeQuestions(raw) {
  return raw.map((q) => {
    const opts = Array.isArray(q.options) ? [...q.options] : [];

    // ensure answer is included
    if (!opts.includes(q.answer)) opts.push(q.answer);

    // Remove duplicates (case-insensitive)
    const seen = new Set();
    const deduped = opts.filter((o) => {
      const key = o.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // shuffle
    for (let i = deduped.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deduped[i], deduped[j]] = [deduped[j], deduped[i]];
    }

    return {
      ...q,
      options: deduped,
    };
  });
}

export default function Quiz() {
  const [grade, setGrade] = useState("grade1");
  const [subject, setSubject] = useState("english");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(30);

  const recognitionRef = useRef(null);

  // ---- LOAD QUESTIONS ----
  useEffect(() => {
    async function load() {
      const raw = await loadQuiz(grade, subject); // auto loads /src/data/gradeX/subject.json
      const normalized = normalizeQuestions(raw);
      setQuestions(normalized);
      setIndex(0);
      setTimer(30);
    }
    load();
  }, [grade, subject]);

  // ---- TIMER ----
  useEffect(() => {
    if (!questions.length) return;

    const t = setInterval(() => {
      setTimer((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(t);
  }, [questions]);

  // ---- TEXT-TO-SPEECH ----
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.pitch = 1;
    utter.rate = 1;
    speechSynthesis.speak(utter);
  };

  // ---- VOICE ANSWER ----
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported.");
      return;
    }

    const recog = new window.webkitSpeechRecognition();
    recognitionRef.current = recog;

    recog.lang = "en-US";
    recog.start();

    recog.onresult = (e) => {
      const spoken = e.results[0][0].transcript.toLowerCase();
      const q = questions[index];

      const match = q.options.find(
        (o) => o.toLowerCase() === spoken.trim()
      );

      if (match) handleAnswer(match);
      else alert(`I heard "${spoken}" but didn’t find a matching option.`);
    };
  };

  // ---- ANSWER HANDLER ----
const [selected, setSelected] = useState(null);
const [isLocked, setIsLocked] = useState(false);

const handleAnswer = (opt) => {
  if (isLocked) return;

  setSelected(opt);
  setIsLocked(true);

  const isCorrect = opt === questions[index].answer;

  // XP + streak
  if (isCorrect) {
    setXp((prev) => prev + 5);
    setStreak((prev) => prev + 1);
  } else {
    setStreak(0);
  }

  // Auto next after small delay
  setTimeout(() => {
    if (index < questions.length - 1) {
      setSelected(null);
      setIsLocked(false);
      setIndex((prev) => prev + 1);
    } else {
      navigate("/quizresult");
    }
  }, 900);
};

  return (
    <div className="relative min-h-screen p-6">
      <AnimatedBackground />

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">Voice Quiz</h1>

      {/* Top Bar */}
      <div className="flex items-center gap-3 mb-4">
        {/* Grade Select */}
        <select
          className="px-3 py-2 rounded-lg shadow bg-white"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        >
          {Array.from({ length: 9 }, (_, i) => (
            <option key={i} value={`grade${i + 1}`}>
              Grade {i + 1}
            </option>
          ))}
        </select>

        {/* Subject Select */}
        <select
          className="px-3 py-2 rounded-lg shadow bg-white"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="english">English</option>
          <option value="maths">Maths</option>
          <option value="science">Science</option>
          <option value="gk">GK</option>
          <option value="computer">Computer</option>
          <option value="evs">EVS</option>
        </select>

        {/* XP */}
        <div className="px-3 py-2 rounded-lg shadow bg-white text-sm">
          ⭐ XP {xp}
        </div>

        {/* Streak */}
        <div className="px-3 py-2 rounded-lg shadow bg-white text-sm">
          🔥 Streak {streak}
        </div>
      </div>

      {/* Voice Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          onClick={() => speak(questions[index]?.question)}
        >
          🔊 Read Question
        </button>

        <button
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          onClick={startListening}
        >
          🎤 Answer by Voice
        </button>
      </div>

      {/* Question Card */}
      {questions.length > 0 && (
        <QuestionCard
          question={questions[index]}
          index={index}
          total={questions.length}
          timer={timer}
          selected={selected}
          isLocked={isLocked}
          onAnswer={handleAnswer}
        />
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        <button
          disabled={index === 0}
          className="px-3 py-2 rounded bg-gray-200"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          ◀ Prev
        </button>

        <button
          disabled={index === questions.length - 1}
          className="px-3 py-2 rounded bg-indigo-600 text-white"
          onClick={() => setIndex((i) => Math.min(questions.length - 1, i + 1))}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
}













