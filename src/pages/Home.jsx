import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ContinueWatching from "../ContinueWatching";
import { movieLessons } from "../data/movieLessons";

/* ----------------------------------------------
   🌐 TRANSLATION DICTIONARY
------------------------------------------------*/
const LANG = {
  en: {
    greeting: "Hey",
    subtitle: "Ready to learn something awesome today?",
    daily: "Daily Challenge",
    complete: "Complete 3 lessons today!",
    streak: "Day Streak",
    continue: "Continue Watching",
    movie: "Movie Mode",
    moviesub: "Watch fun animated lessons",
    quiz: "Quiz Challenge",
    quizsub: "Test your knowledge",
    game: "Game Time",
    gamesub: "Learn while playing",
    music: "Music Mode",
    musicsub: "Learn with songs",
    tutor: "Tutor Help",
    tutorsub: "Ask me anything",
    progress: "My Progress",
    progresssub: "See your achievements",
    lessons: "Lessons Done",
    stars: "Stars Earned",
    badges: "Badges",
    open: "Open"
  },

  ta: {
    greeting: "வணக்கம்",
    subtitle: "இன்று புதியதாக ஏதும் கற்றுக்கொள்ள தயாரா?",
    daily: "இன்றைய சவால்",
    complete: "இன்று 3 பாடங்களை முடிக்கவும்!",
    streak: "தொடர் நாட்கள்",
    continue: "தொடர்ந்து பார்க்க",
    movie: "மூவி முறையில்",
    moviesub: "வேடிக்கையான அனிமேஷன் பாடங்கள்",
    quiz: "வினாடி வினா",
    quizsub: "உங்கள் அறிவை சோதியுங்கள்",
    game: "கேம் டைம்",
    gamesub: "விளையாடி கற்றுக்கொள்ளுங்கள்",
    music: "இசை முறை",
    musicsub: "பாடல்களுடன் கற்றுக்கொள்ளுங்கள்",
    tutor: "ட்யூட்டர் உதவி",
    tutorsub: "எதை வேண்டுமானாலும் கேளுங்கள்",
    progress: "எனது முன்னேற்றம்",
    progresssub: "உங்கள் சாதனைகளைப் பாருங்கள்",
    lessons: "முடித்த பாடங்கள்",
    stars: "சேகரித்த நட்சத்திரங்கள்",
    badges: "பேட்ஜ்கள்",
    open: "திற"
  },

  hi: {
    greeting: "नमस्ते",
    subtitle: "आज कुछ नया सीखने के लिए तैयार हो?",
    daily: "दैनिक चुनौती",
    complete: "आज 3 लेसन पूरा करें!",
    streak: "दिनों की स्ट्रीक",
    continue: "देखना जारी रखें",
    movie: "मूवी मोड",
    moviesub: "मज़ेदार एनिमेटेड लेसन देखें",
    quiz: "क्विज़ चैलेंज",
    quizsub: "अपना ज्ञान परखें",
    game: "गेम टाइम",
    gamesub: "खेलते-खेलते सीखें",
    music: "म्यूज़िक मोड",
    musicsub: "गानों के साथ सीखें",
    tutor: "ट्यूटर सहायता",
    tutorsub: "कुछ भी पूछें",
    progress: "मेरी प्रगति",
    progresssub: "अपनी उपलब्धियाँ देखें",
    lessons: "किए गए लेसन",
    stars: "कमाए गए स्टार",
    badges: "बैज",
    open: "खोलें"
  }
};

/* ----------------------------------------------
    🎨 Floating Background Shapes
------------------------------------------------*/
const FloatingShapes = () => (
  <>
    <motion.div
      className="fixed top-20 right-10 w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30"
      animate={{ y: [0, -20, 0] }}
      transition={{ repeat: Infinity, duration: 6 }}
    />
    <motion.div
      className="fixed bottom-10 left-10 w-40 h-40 bg-gradient-to-br from-blue-400 to-green-400 rounded-full blur-3xl opacity-30"
      animate={{ y: [0, 20, 0] }}
      transition={{ repeat: Infinity, duration: 7 }}
    />
  </>
);

/* ----------------------------------------------
     MAIN HOME COMPONENT
------------------------------------------------*/
export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user.name || "Hevan Harish";

  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  // Save language
  const t = LANG[lang];

  const savedProgress = (() => {
    try {
      return JSON.parse(localStorage.getItem("movie-progress") || "null");
    } catch (e) {
      return null;
    }
  })();

  const continueLesson =
    savedProgress && savedProgress.id
      ? movieLessons.find((l) => l.id === savedProgress.id)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 pb-24 relative"
    >
      <FloatingShapes />

      {/* Top UI */}
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">
            {t.greeting}, {name}! 👋
          </h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              localStorage.setItem("lang", e.target.value);
            }}
            className="px-3 py-2 rounded-full border shadow bg-white"
          >
            <option value="en">🇬🇧 EN</option>
            <option value="ta">🇮🇳 TA</option>
            <option value="hi">🇮🇳 HI</option>
          </select>

          <div className="w-12 h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center shadow text-xl">
            😊
          </div>
        </div>
      </div>

      {/* Daily Challenge */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-5 rounded-2xl shadow z-10"
      >
        <p className="font-semibold flex items-center gap-2">🎯 {t.daily}</p>
        <p className="opacity-90 text-sm">{t.complete}</p>

        <div className="text-right mt-2">
          <p className="text-3xl font-bold">5</p>
          <p className="text-xs">{t.streak} 🔥</p>
        </div>
      </motion.div>

      {/* Continue Watching */}
      {continueLesson && (
        <div className="mt-6">
          <ContinueWatching lesson={continueLesson} time={savedProgress.time} />
        </div>
      )}

      {/* Feature GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 relative z-10">
        <FeatureCard icon="🎬" title={t.movie} subtitle={t.moviesub} color="from-pink-400 to-purple-400" path="/movie" t={t} />
        <FeatureCard icon="🧠" title={t.quiz} subtitle={t.quizsub} color="from-blue-400 to-indigo-400" path="/quiz" t={t} />
        <FeatureCard icon="🎮" title={t.game} subtitle={t.gamesub} color="from-green-400 to-green-600" path="/GameMenu" t={t} />
        <FeatureCard icon="🎵" title={t.music} subtitle={t.musicsub} color="from-yellow-400 to-orange-400" path="/music" t={t} />
        <FeatureCard icon="❓" title={t.tutor} subtitle={t.tutorsub} color="from-orange-400 to-red-400" path="/tutor" t={t} />
        <FeatureCard icon="📈" title={t.progress} subtitle={t.progresssub} color="from-teal-400 to-blue-400" path="/progress" t={t} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10 relative z-10">
        <Stat number="12" label={t.lessons} />
        <Stat number="48" label={t.stars} />
        <Stat number="8" label={t.badges} />
      </div>
    </motion.div>
  );
}

/* ----------------------------------------------
   ⭐ PRO MAX FeatureCard Component
------------------------------------------------*/
function FeatureCard({ icon, title, subtitle, color, path, t }) {
  return (
    <Link to={path}>
      <motion.div
        whileHover={{ scale: 1.05, rotateX: 5, rotateY: -5 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="cursor-pointer bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 group relative"
      >
        <div className={`bg-gradient-to-r ${color} h-20 flex items-center justify-center`}>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center text-white text-3xl shadow-xl">
            {icon}
          </div>
        </div>

        <div className="p-6 text-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />

          <h2 className="font-extrabold text-lg text-gray-800">{title}</h2>
          <p className="text-gray-500 text-sm">{subtitle}</p>

          <motion.div
            whileTap={{ scale: 0.9 }}
            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl shadow hover:bg-black transition"
          >
            {t.open}
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ----------------------------------------------
    📊 Stats Component
------------------------------------------------*/
function Stat({ number, label }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white shadow-md rounded-2xl p-5 text-center border"
    >
      <h1 className="text-3xl font-bold text-purple-600">{number}</h1>
      <p className="text-gray-600 text-sm">{label}</p>
    </motion.div>
  );
}

