import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

// Main pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Movie from "./pages/Movie";
import Music from "./pages/Music";
import Game from "./pages/Game";
import Tutor from "./pages/Tutor";
import Progress from "./pages/Progress";
import GameMenu from "./pages/GameMenu";


// Quiz pages
import Quiz from "./pages/Quiz";
import QuizResult from "./pages/QuizResult";
import QuizSelect from "./pages/QuizSelect";

// Gamification
import Leaderboard from "./pages/Leaderboard";
import BadgesPage from "./pages/BadgesPage";

export default function App() {
  const location = useLocation();

  return (
  
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25 }}
      >
        <Routes>
          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Main modes */}
          <Route path="/movie" element={<Movie />} />
          <Route path="/music" element={<Music />} />
          <Route path="/game" element={<Game />} />
          <Route path="/tutor" element={<Tutor />} />
          <Route path="/progress" element={<Progress />} />

          {/* Quiz system */}
          <Route path="/quiz-select" element={<QuizSelect />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quiz/result" element={<QuizResult />} />

          {/* Gamification */}
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/badges" element={<BadgesPage />} />
          <Route path="/progress" element={<Progress />} />
           <Route path="/gamemenu" element={<GameMenu />} />

        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}



