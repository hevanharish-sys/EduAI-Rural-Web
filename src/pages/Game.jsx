// src/pages/Game.jsx
import React, { useEffect, useMemo, useCallback, useState } from "react";
import { motion } from "framer-motion";

import DragDropGame from "../games/DragDropGame";
import PuzzleGame from "../games/PuzzleGame";
import QuizBattleGame from "../games/QuizBattleGame";

import {
  loadGameLevels,
  loadPuzzleGame,
  loadDragDropGame,
  loadBattleGame,
} from "../data/lessonLoader";

const KNOWN_SUBJECTS = [
  "puzzle",
  "dragdrop",
  "battle",
  "english",
  "maths",
  "science",
  "gk",
  "computer",
];

const DEFAULT_GRADE = "grade1";
const DEFAULT_SUBJECT = "puzzle";

function getQueryParams() {
  try {
    const params = new URLSearchParams(window.location.search);
    return {
      grade: params.get("grade") || DEFAULT_GRADE,
      subject: params.get("subject") || DEFAULT_SUBJECT,
      level: parseInt(params.get("level") || "1", 10) || 1,
    };
  } catch (e) {
    return { grade: DEFAULT_GRADE, subject: DEFAULT_SUBJECT, level: 1 };
  }
}

export default function Game() {
  const initial = getQueryParams();

  const [grade, setGrade] = useState(initial.grade);
  const [subject, setSubject] = useState(initial.subject);
  const [levelIndex, setLevelIndex] = useState(Math.max(1, initial.level)); // 1-based
  const [items, setItems] = useState([]); // normalized levels array
  const [gameType, setGameType] = useState("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const gradeOptions = useMemo(
    () => [
      "grade1",
      "grade2",
      "grade3",
      "grade4",
      "grade5",
      "grade6",
      "grade7",
      "grade8",
      "grade9",
    ],
    []
  );

  // Normalize loader output into an array of levels
  const normalize = (raw) => {
    if (!raw) return [];
    // if the loader returned an object with default (ES module)
    if (raw.default) raw = raw.default;
    // array -> ok
    if (Array.isArray(raw)) return raw;
    // common shapes: { levels: [...] } or { data: [...] }
    if (raw.levels && Array.isArray(raw.levels)) return raw.levels;
    if (raw.data && Array.isArray(raw.data)) return raw.data;
    // find first array value inside object (best-effort)
    const arr = Object.values(raw).find((v) => Array.isArray(v));
    if (arr) return arr;
    // last resort: wrap object as single-level
    return [raw];
  };

  const loadData = useCallback(
    async (g, s) => {
      setLoading(true);
      setError(null);
      setItems([]);
      setGameType("unknown");

      try {
        // loadGameLevels is async — await it
        let data = null;
        try {
          data = await loadGameLevels(g, s);
        } catch (err) {
          // swallow - we'll try fallbacks below
          console.debug("loadGameLevels failed, trying specific loaders", err);
        }

        // fallback to specific loaders if generic returned null/undefined
        if (!data) {
          if (s === "puzzle") {
            try {
              data = await loadPuzzleGame(g);
            } catch (e) {
              data = null;
            }
          } else if (s === "dragdrop") {
            try {
              data = await loadDragDropGame(g);
            } catch (e) {
              data = null;
            }
          } else if (s === "battle") {
            try {
              data = await loadBattleGame(g);
            } catch (e) {
              data = null;
            }
          } else {
            // try generic again but with different path shape (some loaders may export differently)
            try {
              data = await loadGameLevels(g, s);
            } catch (e) {
              data = null;
            }
          }
        }

        if (!data) {
          setItems([]);
          setGameType("unavailable");
          return;
        }

        const normalized = normalize(data);
        setItems(normalized);

        // detect game type more robustly
        let detected = s || "unknown";
        if (normalized.length && normalized[0] && typeof normalized[0].type === "string") {
          detected = normalized[0].type.toLowerCase();
        } else {
          // if subject is 'puzzle' but file uses 'puzzle-image' or similar, map it
          if (s && s.startsWith("puzzle")) detected = "puzzle";
          if (s && s.includes("drag")) detected = "dragdrop";
          if (s && s.includes("battle")) detected = "battle";
        }

        // normalize some variants
        if (detected.includes("puzzle")) detected = "puzzle";
        if (detected.includes("drag")) detected = "dragdrop";
        if (detected.includes("battle") || detected.includes("quiz")) detected = "battle";

        setGameType(detected);

        // if current levelIndex is out of range, reset to 1
        if (normalized.length > 0 && levelIndex > normalized.length) {
          setLevelIndex(1);
        }
      } catch (err) {
        console.error("Game Load Error:", err);
        setError("Unable to load game data. See console.");
        setItems([]);
      } finally {
        setLoading(false);
      }
    },
    [levelIndex]
  );

  // load when grade/subject change
  useEffect(() => {
    loadData(grade, subject);
  }, [grade, subject, loadData]);

  // Ensure levelIndex stays in range when items change
  useEffect(() => {
    if (items.length === 0) {
      setLevelIndex(1);
      return;
    }
    if (levelIndex < 1) setLevelIndex(1);
    if (levelIndex > items.length) setLevelIndex(1);
  }, [items, levelIndex]);

  const maxLevels = items.length;
  const currentLevel = items[levelIndex - 1] || null;

  const onPrev = () => {
    if (levelIndex <= 1) return;
    setLevelIndex((i) => i - 1);
  };
  const onNext = () => {
    if (levelIndex >= maxLevels) return;
    setLevelIndex((i) => i + 1);
  };

  // Render chosen game component
  function renderGame() {
    if (!items || items.length === 0) {
      return (
        <div className="p-6">
          <h3 className="text-xl font-semibold text-red-600">Puzzle Mode — UNAVAILABLE</h3>
          <p className="text-muted">No levels found for this selection.</p>
        </div>
      );
    }

    // common props shape (keeps backward compat with your games)
    const commonProps = {
      grade,
      subject,
      allLevels: items,
      levelIndex,
      setLevelIndex,
      currentLevel,
    };

    switch (gameType) {
      case "puzzle":
        // PuzzleGame: keep both the older (data/levelIndex) shape and commonProps available.
        return <PuzzleGame {...commonProps} data={items} levelIndex={levelIndex} />;
      case "dragdrop":
        return <DragDropGame {...commonProps} />;
      case "battle":
        return <QuizBattleGame {...commonProps} />;
      default:
        // try fallback mapping based on subject
        if (subject === "puzzle") return <PuzzleGame {...commonProps} data={items} levelIndex={levelIndex} />;
        if (subject === "dragdrop") return <DragDropGame {...commonProps} />;
        if (subject === "battle") return <QuizBattleGame {...commonProps} />;

        return (
          <div className="p-6">
            <h3 className="text-xl font-semibold">Invalid game type: "{gameType}"</h3>
            <p className="text-muted">Try changing the subject to puzzle, dragdrop, or battle.</p>
          </div>
        );
    }
  }

  return (
    <motion.div
      key={`${grade}-${subject}-${levelIndex}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 pb-24"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Game Mode — <span className="text-indigo-600">{String(gameType).toUpperCase()}</span>
        </h1>
        <div className="text-sm text-gray-600 mt-1">
          Grade: <b>{grade}</b> • Subject: <b>{subject}</b> • Level {levelIndex}/{maxLevels || "?"}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-6">
        <label>
          Grade
          <select value={grade} onChange={(e) => { setGrade(e.target.value); setLevelIndex(1); }} className="ml-2 p-2 border rounded">
            {gradeOptions.map((g) => (
              <option key={g} value={g}>{g.replace("grade", "Grade ")}</option>
            ))}
          </select>
        </label>

        <label>
          Subject
          <select value={subject} onChange={(e) => { setSubject(e.target.value); setLevelIndex(1); }} className="ml-2 p-2 border rounded">
            {KNOWN_SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={onPrev} disabled={levelIndex <= 1} className="px-3 py-2 bg-gray-100 rounded disabled:opacity-50">
            ◀ Prev
          </button>
          <button onClick={onNext} disabled={levelIndex >= maxLevels} className="px-3 py-2 bg-indigo-600 text-white rounded disabled:opacity-50">
            Next ▶
          </button>
        </div>
      </div>

      {loading && (
        <div className="p-8 bg-white/60 rounded shadow-sm">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-300 rounded w-48 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      )}

      {error && (
        <div className="p-6 bg-red-50 border border-red-100 rounded">
          <strong className="text-red-700">Error:</strong> {error}
        </div>
      )}

      {!loading && !error && renderGame()}
    </motion.div>
  );
}











