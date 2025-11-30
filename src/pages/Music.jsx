import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { loadMusicLessons } from "../data/lessonLoader";

export default function Music() {
  const [grade, setGrade] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [current, setCurrent] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  // Load last music progress
  useEffect(() => {
    const saved = localStorage.getItem("music-progress");
    if (saved) {
      const p = JSON.parse(saved);
      setGrade(p.grade);
      setCurrent(p.lesson);
    }
  }, []);

  // Load lessons whenever grade changes
  useEffect(() => {
    loadMusicLessons(grade).then((data) => {
      setLessons(data);

      if (!current && data.length > 0) setCurrent(data[0]);
    });
  }, [grade]);

  // Save progress
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && current) {
        localStorage.setItem(
          "music-progress",
          JSON.stringify({
            grade,
            lesson: current
          })
        );
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [current, grade]);

  const handleEnded = () => {
    const idx = lessons.findIndex((l) => l.id === current.id);

    if (idx < lessons.length - 1) {
      setCurrent(lessons[idx + 1]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <h1 className="text-3xl font-bold">Music Mode 🎵</h1>
      <p className="text-gray-600">Listen, learn, and sing along!</p>

      {/* Grade Selector */}
      <div className="mt-4 flex gap-3">
        <select
          className="p-2 rounded-xl border shadow"
          value={grade}
          onChange={(e) => setGrade(Number(e.target.value))}
        >
          {[1,2,3,4,5,6,7,8,9].map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 flex flex-col lg:flex-row gap-6">

        {/* AUDIO PLAYER */}
        <div className="flex-1 bg-white p-5 rounded-2xl shadow">
          {current && (
            <>
              <audio
                ref={audioRef}
                controls
                onEnded={handleEnded}
                className="w-full"
              >
                <source src={current.src} type="audio/mpeg" />
              </audio>

              <h2 className="text-xl font-semibold mt-4">{current.title}</h2>
              <p className="text-gray-500">{current.desc}</p>

              {/* KARAOKE LYRICS */}
              <div className="mt-4 bg-purple-50 p-4 rounded-xl">
                {current.lyrics.map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.4 }}
                    className="text-lg font-medium"
                  >
                    🎤 {line}
                  </motion.p>
                ))}
              </div>
            </>
          )}
        </div>

        {/* PLAYLIST SIDEBAR */}
        <div className="w-full lg:w-72 bg-white p-4 rounded-2xl shadow">
          <h3 className="text-lg font-semibold mb-3">Songs</h3>

          <div className="space-y-3">
            {lessons.map((l) => (
              <motion.div
                key={l.id}
                whileHover={{ scale: 1.03 }}
                onClick={() => setCurrent(l)}
                className={`p-3 rounded-xl border cursor-pointer ${
                  current?.id === l.id
                    ? "border-purple-500 bg-purple-50"
                    : "bg-white"
                }`}
              >
                <h4 className="font-semibold">{l.title}</h4>
                <p className="text-xs text-gray-500">{l.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  );
}



