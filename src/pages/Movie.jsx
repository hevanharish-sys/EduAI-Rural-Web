import React, { useEffect, useState, useRef } from "react";
import { loadVideoLessons } from "../data/lessonLoader";
import { motion } from "framer-motion";

export default function Movie() {
  const grade = JSON.parse(localStorage.getItem("user"))?.grade || 1;

  const [lessons, setLessons] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef();

  useEffect(() => {
    loadVideoLessons(grade).then(data => {
      setLessons(data);
      setCurrent(data[0]);
    });
  }, [grade]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onloadeddata = () => setLoading(false);
    }
  }, [current]);

  return (
    <div className="p-6 pb-28">

      <h1 className="text-3xl font-bold">Movie Mode 🎬</h1>
      <p className="text-gray-600">Videos for Grade {grade}</p>

      <div className="flex flex-col lg:flex-row gap-6 mt-6">

        <div className="flex-1 bg-white p-4 rounded-2xl shadow">
          {loading && <div className="h-60 bg-gray-200 animate-pulse rounded-xl"></div>}

          {current && (
            <video
              key={current.id}
              ref={videoRef}
              controls
              className={`w-full rounded-xl ${loading ? "hidden" : ""}`}
            >
              <source src={current.src} type="video/mp4" />
              <track
                default
                kind="subtitles"
                src={current.subtitles}
                srcLang="en"
                label="English"
              />
            </video>
          )}

          <h2 className="mt-4 text-xl font-semibold">{current?.title}</h2>
          <p className="text-gray-500">{current?.desc}</p>
        </div>

        <div className="w-full lg:w-72 bg-white p-4 rounded-2xl shadow h-fit">
          <h3 className="text-lg font-semibold mb-3">Lessons</h3>

          {lessons.map(lesson => (
            <motion.div
              whileHover={{ scale: 1.04 }}
              key={lesson.id}
              onClick={() => {
                setCurrent(lesson);
                setLoading(true);
              }}
              className={`p-3 rounded-lg border cursor-pointer mb-2 ${
                lesson.id === current?.id ? "border-purple-500 bg-purple-50" : ""
              }`}
            >
              <h4 className="font-semibold">{lesson.title}</h4>
              <p className="text-xs text-gray-500">{lesson.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

