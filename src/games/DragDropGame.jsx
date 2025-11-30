// DragDropGame — PRO UI Version (SAFE, compatible with all grades)
import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function DragDropGame({ currentLevel, grade }) {
  // ------------------ ALWAYS RUN HOOKS FIRST ------------------
  const [items, setItems] = useState([]);
  const [targets, setTargets] = useState([]);
  const [drops, setDrops] = useState({});
  const [xp, setXP] = useState(0);
  const [completed, setCompleted] = useState(false);

  const difficulty = {
    grade1: 1,
    grade2: 1.2,
    grade3: 1.4,
    grade4: 1.6,
    grade5: 1.8,
    grade6: 2.0,
    grade7: 2.2,
    grade8: 2.4,
    grade9: 2.6,
  }[grade] || 1;

  // ------------------ NORMALIZE JSON DATA ------------------
  const pairs = useMemo(() => {
    if (!currentLevel) return [];

    if (Array.isArray(currentLevel.pairs)) {
      return currentLevel.pairs.map((p) => ({
        left: p.drag || p.left,
        right: p.target || p.right,
      }));
    }

    return [];
  }, [currentLevel]);

  // ------------------ INIT LEVEL ------------------
  useEffect(() => {
    if (pairs.length) {
      setItems(pairs.map((p) => p.left));
      setTargets(pairs.map((p) => p.right));
      setDrops({});
      setCompleted(false);
    }
  }, [pairs]);

  // ------------------ SAFETY CHECK ------------------
  if (!pairs.length) {
    return (
      <div className="p-6 text-red-600">
        <h3 className="text-xl font-bold">Invalid dragdrop level</h3>
        <p className="text-gray-600 mt-1">This level uses unsupported format.</p>
      </div>
    );
  }

  // ------------------ HANDLE DROP ------------------
  function handleDrop(item, target) {
    const correct = item === target;
    setDrops((prev) => ({ ...prev, [target]: item }));

    if (correct) setXP((x) => x + 10 * difficulty);

    const all = targets.every(
      (t) => drops[t] === t || (t === target && correct)
    );
    if (all) setCompleted(true);
  }

  function handleDragEnd(e, item) {
    const x = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const y = e.clientY ?? e.changedTouches?.[0]?.clientY;
    const el = document.elementFromPoint(x, y);
    const zone = el?.closest("[data-dropzone]");
    if (zone) handleDrop(item, zone.dataset.dropzone);
  }

  // ------------------ UI: PRO MODE ------------------
  return (
    <div className="p-4">

      {/* XP Badge */}
      <motion.div
        className="fixed top-6 right-6 bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-2xl shadow-lg"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        ⭐ XP: {xp}
      </motion.div>

      {/* Title */}
      <motion.h2
        className="text-3xl font-bold mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {currentLevel.title}
      </motion.h2>

      {currentLevel.desc && (
        <p className="text-gray-600 mb-4">{currentLevel.desc}</p>
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">

        {/* LEFT SIDE — DRAG ITEMS */}
        <div>
          <h3 className="text-gray-500 mb-2 font-semibold">Drag These:</h3>
          <div className="flex flex-wrap gap-4">
            {items.map((item, i) => (
              <motion.div
                key={i}
                draggable
                onDragEnd={(e) => handleDragEnd(e, item)}
                onTouchEnd={(e) => handleDragEnd(e, item)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="bg-white p-6 rounded-3xl shadow-xl cursor-pointer text-lg font-bold 
                  border-2 border-purple-300 min-w-[120px] text-center"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE — DROP TARGETS */}
        <div>
          <h3 className="text-gray-500 mb-2 font-semibold">Drop Here:</h3>
          <div className="flex flex-col gap-4">
            {targets.map((t, i) => (
              <motion.div
                key={i}
                data-dropzone={t}
                className={`p-6 rounded-3xl border-4 min-h-[90px] flex justify-center items-center text-lg font-semibold
                  ${
                    drops[t] === t
                      ? "border-green-500 bg-green-100"
                      : "border-dashed border-gray-300 bg-gray-100"
                  }
                `}
                whileHover={{ scale: drops[t] ? 1 : 1.02 }}
              >
                {drops[t] || "Drop Here"}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CELEBRATION */}
      <AnimatePresence>
        {completed && (
          <motion.div
            className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-3xl shadow-2xl text-xl font-bold"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            🎉 Level Completed! Excellent!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}









