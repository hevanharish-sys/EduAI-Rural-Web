import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

/**
 * QuizQuestion.jsx
 *
 * Props:
 * - question: { question, options[], answer, subject, topic, chapter, explanation? }
 * - index, total
 * - onNext() -> called when moving to next question
 *
 * Behavior:
 * - User selects an option
 * - If correct -> brief success UI + call onNext after short delay
 * - If wrong -> show Tutor panel with "Why it's wrong" + explanation (from question.explanation or generated)
 *
 * Note: for best tutor text include `explanation` in the question JSON files (optional).
 */

function generateExplanation(questionObj, selected) {
  // If the JSON contains an explicit explanation, prefer it
  if (questionObj.explanation) {
    // Explanation can be a string or an object {correct: "", whyWrong: {optionValue: ""}}
    if (typeof questionObj.explanation === "string") {
      return {
        short: `Correct answer: ${questionObj.answer}`,
        long: questionObj.explanation,
        whyWrong: questionObj.explanation
      };
    } else if (typeof questionObj.explanation === "object") {
      return {
        short: `Correct: ${questionObj.answer}`,
        long: questionObj.explanation.correct || "Explanation not provided.",
        whyWrong:
          (questionObj.explanation.whyWrong && questionObj.explanation.whyWrong[selected]) ||
          questionObj.explanation.correct ||
          "That choice is incorrect because..."
      };
    }
  }

  // Local templated "AI-like" explanation generator (fallback)
  const correct = questionObj.answer;
  const qTopic = questionObj.topic || questionObj.chapter || questionObj.subject || "topic";

  // Short, immediate line
  const short = `Correct answer: ${correct}`;

  // Generate a subject/topic-specific explanation
  let long = "";
  let whyWrong = "";

  switch ((questionObj.subject || "").toLowerCase()) {
    case "maths":
    case "math":
      long = `Because this is a ${qTopic} problem. The correct result follows standard ${qTopic} rules — re-check operations step-by-step (order of operations, simplification, or formula).`;
      whyWrong = `The selected option does not follow the ${qTopic} rule—review calculations and simplify carefully.`;
      break;

    case "science":
      long = `This relates to ${qTopic}. The correct answer matches the scientific principle involved (e.g., property, process or definition).`;
      whyWrong = `The selected option conflicts with the basic concept of ${qTopic}. Re-read the principle and compare each option.`;
      break;

    case "english":
      long = `This is about ${qTopic}. The correct answer fits the grammar/meaning conventions (tense, preposition, or idiom).`;
      whyWrong = `The chosen option doesn't match the grammar or intended meaning here — check usage and sentence structure.`;
      break;

    case "computer":
      long = `This question covers ${qTopic}. The correct option follows how computers/systems actually behave or how the technology is defined.`;
      whyWrong = `The chosen option is not accurate for how this computer concept works in real systems.`;
      break;

    case "social_science":
    case "social science":
      long = `This belongs to ${qTopic}. The correct answer aligns with historical/geographical/civic facts or definitions.`;
      whyWrong = `That option contradicts the factual/historical context for ${qTopic}. Re-check dates/names/definitions.`;
      break;

    default:
      long = `This question covers ${qTopic}. The correct answer is chosen because it follows the canonical definition or rule for that topic.`;
      whyWrong = `That choice doesn't match the definition or rule; compare it to the correct option and identify the mismatch.`;
      break;
  }

  // Add a tiny example-based explanation for numeric options
  if (!isNaN(Number(selected)) || !isNaN(Number(correct))) {
    whyWrong += " Also re-check arithmetic: small mistakes in +, -, ×, ÷ are common.";
  }

  return { short, long, whyWrong };
}

export default function QuizQuestion({ question, index = 0, total = 1, onNext }) {
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [correct, setCorrect] = useState(null); // boolean
  const [showTutor, setShowTutor] = useState(false);
  const [explain, setExplain] = useState({ short: "", long: "", whyWrong: "" });

  useEffect(() => {
    // reset when new question arrives
    setSelected(null);
    setLocked(false);
    setCorrect(null);
    setShowTutor(false);
    setExplain({ short: "", long: "", whyWrong: "" });
  }, [question]);

  function handleSelect(option) {
    if (locked) return;
    setSelected(option);
    setLocked(true);

    const isCorrect = String(option).trim() === String(question.answer).trim();
    setCorrect(isCorrect);

    // Build explanation (either from JSON or generated)
    const generated = generateExplanation(question, option);
    setExplain(generated);

    if (!isCorrect) {
      // Show tutor panel when wrong
      setShowTutor(true);
    } else {
      // If correct, auto move to next after short delay
      setTimeout(() => {
        if (onNext) onNext();
      }, 900);
    }
  }

  function handleTutorContinue() {
    // allow user to continue to next question
    setShowTutor(false);
    if (onNext) onNext();
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-gray-500">Question {index + 1} / {total}</div>
          <h3 className="text-lg font-semibold mt-2">{question.question}</h3>
          {/* chapter/topic badge */}
          {question.chapter && <div className="text-sm text-purple-600 mt-1">Chapter: {question.chapter}</div>}
        </div>
        <div className="text-sm text-gray-400">{question.topic || ""}</div>
      </div>

      {/* Options */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, i) => {
          // determine UI classes
          let base = "p-3 border rounded-lg cursor-pointer";
          if (locked) {
            if (String(opt).trim() === String(question.answer).trim()) base += " border-green-500 bg-green-50";
            else if (selected !== null && String(opt).trim() === String(selected).trim()) base += " border-red-500 bg-red-50";
            else base += " opacity-80";
          } else {
            base += " hover:shadow-md";
          }

          return (
            <motion.div
              key={i}
              onClick={() => handleSelect(opt)}
              whileHover={{ scale: locked ? 1 : 1.02 }}
              className={base}
            >
              <div className="font-medium">{opt}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Feedback area */}
      <div className="mt-4 h-24">
        {locked && correct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-green-50 rounded-md border border-green-100">
            <div className="font-semibold text-green-700">Nice! ✅ That’s correct.</div>
            <div className="text-sm text-green-700 mt-1">{explain.short}</div>
          </motion.div>
        )}

        {locked && !correct && showTutor && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-yellow-50 rounded-md border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-yellow-800">Tutor ✨ — Why that was wrong</div>
                <div className="text-sm text-gray-700 mt-1">{explain.whyWrong}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Correct: <strong>{question.answer}</strong></div>
              </div>
            </div>

            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-purple-600">Read full explanation</summary>
              <div className="mt-2 text-sm text-gray-700">{explain.long}</div>
            </details>

            <div className="mt-3 flex gap-2">
              <button onClick={handleTutorContinue} className="px-3 py-1 bg-purple-600 text-white rounded-md">Continue</button>
              <button onClick={() => setShowTutor(false)} className="px-3 py-1 border rounded-md">Close</button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

