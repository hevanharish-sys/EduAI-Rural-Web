// ----------------------------------------------
// This loader is specifically for your structure:
// src/data/lessonLoader.js
// src/data/grade1/puzzle.json
// ----------------------------------------------

// Auto-load all JSON files located *inside* this folder
const allJsonFiles = import.meta.glob("./**/*.json", { eager: true });

function findJson(grade, subject) {
  const path = `./${grade}/${subject}.json`; // ✅ CORRECT PATH

  const file = allJsonFiles[path];

  if (!file) {
    console.error("❌ JSON NOT FOUND →", path);
    return null;
  }

  return file.default;
}

// Generic loader for puzzle, dragdrop, battle
export function loadGameLevels(grade, subject) {
  return findJson(grade, subject);
}

// Specific loaders (just call findJson)
export function loadPuzzleGame(grade) {
  return import(`../data/${grade}/puzzle.json`)
    .then((m) => m.default)
    .catch(() => []);
}


export function loadDragDropGame(grade) {
  return findJson(grade, "dragdrop");
}

export function loadBattleGame(grade) {
  return findJson(grade, "battle");
}


// Video & music lessons
export function loadVideoLessons(grade) {
  return findJson(grade, "videoLessons");
}

export function loadMusicLessons(grade) {
  return findJson(grade, "musicLesson");
}



// -----------------------------------------------------
// UNIVERSAL QUIZ LOADER (gk, maths, science, computer...)
// -----------------------------------------------------
export async function loadQuiz(grade, subject) {
  try {
    const file = await import(`../data/${grade}/${subject}.json`);
    return file.default;
  } catch (err) {
    console.error(`❌ Quiz file missing: ${grade}/${subject}.json`, err);
    return [];
  }
}









