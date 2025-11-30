// ----------------------------------------------------
// 🔥 UNIVERSAL GAME FILE LOADER (Final Stable Version)
// ----------------------------------------------------

// Always use import.meta.url to calculate correct base path
const basePath = new URL('./', import.meta.url).pathname;

// Resolve the JSON file safely
function resolveFile(grade, file) {
  return `${basePath}${grade}/${file}`;
}

// ----------------------------------------------------
// PUZZLE LEVELS  (puzzle.json)
// ----------------------------------------------------
export async function loadPuzzleLevels(grade) {
  try {
    const file = await import(resolveFile(grade, "puzzle.json"));
    return file.default;
  } catch (err) {
    console.error("❌ Puzzle levels missing:", grade, err);
    return [];
  }
}

// ----------------------------------------------------
// DRAG & DROP LEVELS (dragdrop.json)
// ----------------------------------------------------
export async function loadDragDropLevels(grade) {
  try {
    const file = await import(resolveFile(grade, "dragdrop.json"));
    return file.default;
  } catch (err) {
    console.error("❌ DragDrop levels missing:", grade, err);
    return [];
  }
}

// ----------------------------------------------------
// QUIZ BATTLE LEVELS (battle.json)
// ----------------------------------------------------
export async function loadBattleLevels(grade) {
  try {
    const file = await import(resolveFile(grade, "battle.json"));
    return file.default;
  } catch (err) {
    console.error("❌ Battle levels missing:", grade, err);
    return [];
  }
}

