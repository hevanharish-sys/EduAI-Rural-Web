// src/games/PuzzleGame.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PuzzleGame - Robust loader + fallback rendering
 *
 * Props supported (keeps backward compatibility):
 *  - grade, subject, allLevels, levelIndex, setLevelIndex, currentLevel
 *  - legacy: data, levelIndex
 *
 * Level JSON: { id, title, desc, question, image, grid }
 */

const DEFAULT_GRID = 3;
const MIN_GRID = 2;
const MAX_GRID = 6;
const AUTO_NEXT_DELAY_MS = 900;

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

/* lightweight confetti using canvas (no external dependency) */
function burstConfetti() {
  try {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.left = 0;
    canvas.style.top = 0;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const pieces = [];
    const colors = ["#FFD166", "#06D6A0", "#EF476F", "#118AB2", "#C77DFF"];
    for (let i = 0; i < 80; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        vx: -3 + Math.random() * 6,
        vy: 2 + Math.random() * 6,
        r: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        vrot: -0.1 + Math.random() * 0.2,
      });
    }
    let t = 0;
    function frame() {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rot += p.vrot;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.8);
        ctx.restore();
      }
      if (t < 150) requestAnimationFrame(frame);
      else document.body.removeChild(canvas);
    }
    requestAnimationFrame(frame);
  } catch (err) {
    console.warn("Confetti failed:", err);
  }
}

export default function PuzzleGame(props) {
  // Accept both prop shapes
  const {
    grade: propGrade,
    subject: propSubject,
    allLevels,
    levelIndex: propLevelIndex,
    setLevelIndex,
    currentLevel,
    data: legacyData,
  } = props;

  const grade = propGrade || "grade1";
  const subject = propSubject || "puzzle";
  const data = Array.isArray(allLevels) && allLevels.length > 0
    ? allLevels
    : Array.isArray(legacyData) ? legacyData : [];
  const levelIndex = propLevelIndex || props.levelIndex || 1; // 1-based
  const level = currentLevel || (data[levelIndex - 1] ?? null);

  // states
  const [gridSize, setGridSize] = useState(DEFAULT_GRID);
  const [tiles, setTiles] = useState([]); // array of { correctIndex, posIndex, src? }
  const [useSlicedTiles, setUseSlicedTiles] = useState(false); // true if we successfully generated dataURLs
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [xp, setXp] = useState(() => {
    try {
      return parseInt(localStorage.getItem(`pa_xp_${grade}`) || "0", 10);
    } catch {
      return 0;
    }
  });
  const [streak, setStreak] = useState(0);
  const timerRef = useRef(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const startTimeRef = useRef(Date.now());
  const imageRef = useRef(null); // original Image object (for fallback rendering)

  // compute difficulty multiplier
  const difficultyMultiplier = useMemo(() => {
    const map = {
      grade1: 1, grade2: 1.2, grade3: 1.4, grade4: 1.6, grade5: 1.8,
      grade6: 2.0, grade7: 2.2, grade8: 2.4, grade9: 2.6
    };
    return map[grade] || 1;
  }, [grade]);

  const baseXp = Math.round(12 * difficultyMultiplier * (gridSize / DEFAULT_GRID));

  // Utility: Fisher-Yates
  const shuffleArray = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // Slice image into dataURLs using canvas. Returns array of dataURLs or throws.
  const sliceImageToDataURLs = async (img, grid) => {
    // attempt to slice using canvas tiles
    const tileW = Math.floor(img.naturalWidth / grid);
    const tileH = Math.floor(img.naturalHeight / grid);

    const pieces = [];
    for (let r = 0; r < grid; r++) {
      for (let c = 0; c < grid; c++) {
        const canvas = document.createElement("canvas");
        canvas.width = tileW;
        canvas.height = tileH;
        const ctx = canvas.getContext("2d");
        // drawImage might throw DOMException if crossOrigin is blocked
        ctx.drawImage(
          img,
          c * tileW, r * tileH, tileW, tileH,
          0, 0, tileW, tileH
        );
        pieces.push(canvas.toDataURL("image/png"));
      }
    }
    return pieces;
  };

  // initialize when level changes
  useEffect(() => {
    setSelectedIndex(null);
    setIsSolved(false);
    setTimeElapsed(0);
    startTimeRef.current = Date.now();
    imageRef.current = null;
    setUseSlicedTiles(false);

    if (!level) {
      setTiles([]);
      return;
    }

    const g = clamp(level.grid ?? level.gridSize ?? DEFAULT_GRID, MIN_GRID, MAX_GRID);
    setGridSize(g);

    // create ordered tile meta
    const total = g * g;
    const ordered = new Array(total).fill(0).map((_, i) => ({
      correctIndex: i,
      posIndex: i,
      src: null, // filled if we create dataURLs
    }));

    // start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    // load image and attempt slicing
    const imageUrl = level.image;
    if (!imageUrl) {
      // no image — just set tiles as placeholders
      const shuffled = shuffleArray(ordered).map((t, idx) => ({ ...t, posIndex: idx }));
      setTiles(shuffled);
      return;
    }

    // Attempt 1: load with crossOrigin and slice (preferred)
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.referrerPolicy = "no-referrer"; // reduce some CORS issues in certain hosts
    let didSucceed = false;

    const onErrorFallback = async (err) => {
      // fallback: load without crossOrigin and render using CSS backgrounds
      console.warn("Puzzle: slicing failed, will use background fallback.", err);
      // set tiles with no src, but shuffled
      const shuffled = shuffleArray(ordered).map((t, idx) => ({ ...t, posIndex: idx }));
      setUseSlicedTiles(false);
      setTiles(shuffled);
      setLoading(falseRef.current); // noop placeholder (we won't use loadingRef)
    };

    let loadingCancelled = false;
    // wrap in promise flow
    const attemptSlice = () => {
      return new Promise((resolve) => {
        img.onload = async () => {
          if (loadingCancelled) return resolve(false);
          imageRef.current = img;
          try {
            const pieces = await sliceImageToDataURLs(img, g);
            // build tiles with src
            const tileObjs = pieces.map((src, idx) => ({
              correctIndex: idx,
              posIndex: idx,
              src,
            }));
            // shuffle posIndex
            const shuffled = shuffleArray(tileObjs).map((t, idx) => ({ ...t, posIndex: idx }));
            setTiles(shuffled);
            setUseSlicedTiles(true);
            didSucceed = true;
            resolve(true);
          } catch (sliceErr) {
            // slicing failed (likely CORS). fallback to background approach
            console.warn("Puzzle slicing error (probably CORS):", sliceErr);
            resolve(false);
          }
        };
        img.onerror = (e) => {
          console.warn("Puzzle image failed to load with crossOrigin:", e);
          resolve(false);
        };
        img.src = imageUrl;
      });
    };

    (async () => {
      const ok = await attemptSlice();
      if (!ok) {
        // try fallback: load image without crossOrigin to display via background
        try {
          const img2 = new Image();
          img2.crossOrigin = ""; // explicitly no crossOrigin
          img2.onload = () => {
            imageRef.current = img2;
            const shuffled = shuffleArray(ordered).map((t, idx) => ({ ...t, posIndex: idx }));
            setUseSlicedTiles(false);
            setTiles(shuffled);
          };
          img2.onerror = () => {
            // last-resort: try wiki test image (guaranteed)
            console.warn("Fallback image load failed, using placeholder.");
            const shuffled = shuffleArray(ordered).map((t, idx) => ({ ...t, posIndex: idx }));
            setUseSlicedTiles(false);
            setTiles(shuffled);
          };
          img2.src = imageUrl;
        } catch (e) {
          onErrorFallback(e);
        }
      }
    })();

    // cleanup
    return () => {
      loadingCancelled = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  // persist XP
  useEffect(() => {
    try {
      localStorage.setItem(`pa_xp_${grade}`, String(xp));
    } catch {}
  }, [xp, grade]);

  // check solved on tiles change
  useEffect(() => {
    if (!tiles || tiles.length === 0) return;
    const ok = tiles.every((t) => t.posIndex === t.correctIndex);
    if (ok && !isSolved) {
      setIsSolved(true);
      setXp((x) => x + baseXp);
      setStreak((s) => s + 1);
      burstConfetti();
      setTimeout(() => {
        if (typeof setLevelIndex === "function") {
          setLevelIndex((i) => i + 1);
        }
      }, AUTO_NEXT_DELAY_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles]);

  // helper: swap positions by posIndex A & B
  const swapByPos = useCallback((posA, posB) => {
    setTiles((prev) => {
      const copy = prev.map((t) => ({ ...t }));
      const a = copy.find((c) => c.posIndex === posA);
      const b = copy.find((c) => c.posIndex === posB);
      if (!a || !b) return prev;
      const tmp = a.posIndex;
      a.posIndex = b.posIndex;
      b.posIndex = tmp;
      return copy;
    });
  }, []);

  // click handler for tile at posIndex
  const handleTileClick = (posIndex) => {
    if (isSolved) return;
    if (selectedIndex == null) {
      setSelectedIndex(posIndex);
      return;
    }
    // if same -> deselect
    if (selectedIndex === posIndex) {
      setSelectedIndex(null);
      return;
    }
    // swap selectedIndex and posIndex
    swapByPos(selectedIndex, posIndex);
    setSelectedIndex(null);
    // small XP per move
    setXp((x) => x + Math.max(1, Math.round(baseXp * 0.06)));
  };

  // get tile for a display pos
  const tileAt = useCallback((pos) => {
    const t = tiles.find((tt) => tt.posIndex === pos);
    return t ?? null;
  }, [tiles]);

  // responsive board size
  const containerSize = 360;
  const gap = 6;

  if (!level) {
    return (
      <div className="p-6">
        <div className="text-red-600 font-semibold">No puzzle levels found for this selection.</div>
      </div>
    );
  }

  // Render
  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700">{level.title || `Level ${levelIndex}`}</h2>
          <p className="text-gray-600 mt-1">{level.desc || level.question || ""}</p>
          <div className="mt-2 text-sm text-gray-500">Grid: {gridSize}×{gridSize} • Time: {timeElapsed}s</div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white px-3 py-2 rounded-lg shadow text-sm">
            ⭐ <strong>{xp}</strong>
          </div>
          <div className="bg-white px-3 py-2 rounded-lg shadow text-sm">
            🔥 <strong>{streak}</strong>
          </div>
        </div>
      </div>

      {/* Puzzle + Side panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* puzzle board */}
        <div className="bg-white rounded-2xl p-4 shadow-md flex-shrink-0">
          <div
            className="relative touch-none"
            style={{
              width: containerSize,
              height: containerSize,
              maxWidth: "calc(100vw - 48px)",
              maxHeight: "calc(100vh - 220px)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                gap: `${gap}px`,
                width: "100%",
                height: "100%",
              }}
            >
              {Array.from({ length: gridSize * gridSize }, (_, i) => {
                const tile = tileAt(i);
                const pieceIndex = tile ? tile.correctIndex : i;
                const isSelected = selectedIndex === i;
                const isCorrect = tile && tile.posIndex === tile.correctIndex;

                // If we have sliced tiles, render <img src={tile.src}>
                if (useSlicedTiles && tile && tile.src) {
                  return (
                    <motion.button
                      key={`cell-${i}`}
                      layout
                      onClick={() => handleTileClick(i)}
                      whileTap={{ scale: 0.96 }}
                      className={`rounded-md overflow-hidden border relative focus:outline-none
                        ${isSelected ? "ring-4 ring-indigo-200" : ""}
                        ${isCorrect ? "border-green-300" : "border-gray-200"}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        cursor: isSolved ? "default" : "pointer",
                        padding: 0,
                        background: "transparent",
                        display: "flex",
                      }}
                    >
                      <img src={tile.src} draggable="false" alt={`piece-${i}`} className="w-full h-full object-cover" />
                      {isCorrect && <span className="absolute right-1 top-1 bg-white/80 text-green-600 text-xs px-1 rounded">✓</span>}
                    </motion.button>
                  );
                }

                // Otherwise fallback to CSS-sliced background using original level.image
                // Compute background position for pieceIndex
                const bgX = ((pieceIndex % gridSize) / (gridSize - 1)) * 100;
                const bgY = (Math.floor(pieceIndex / gridSize) / (gridSize - 1)) * 100;

                return (
                  <motion.button
                    key={`cell-${i}`}
                    layout
                    onClick={() => handleTileClick(i)}
                    whileTap={{ scale: 0.96 }}
                    className={`rounded-md overflow-hidden border relative focus:outline-none
                      ${isSelected ? "ring-4 ring-indigo-200" : ""}
                      ${isCorrect ? "border-green-300" : "border-gray-200"}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      cursor: isSolved ? "default" : "pointer",
                      backgroundImage: `url(${level.image})`,
                      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                      backgroundPosition: `${bgX}% ${bgY}%`,
                      backgroundRepeat: "no-repeat",
                    }}
                    title={isSelected ? "Selected - click another tile to swap" : "Click to select / swap"}
                  >
                    {isCorrect && <span className="absolute right-1 top-1 bg-white/80 text-green-600 text-xs px-1 rounded">✓</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* side panel */}
        <div className="flex-1 min-w-[220px]">
          <div className="bg-white rounded-2xl p-4 shadow-md sticky top-24">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Progress</div>
                <div className="text-lg font-semibold">{levelIndex}/{Math.max(1, data.length)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Grid</div>
                <div className="font-semibold">{gridSize}×{gridSize}</div>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-500 mb-2">Actions</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // reshuffle current level
                    setTiles((prev) => {
                      const cp = prev.map(t => ({ ...t }));
                      // random shuffle posIndex
                      for (let k = cp.length - 1; k > 0; k--) {
                        const j = Math.floor(Math.random() * (k + 1));
                        const tmp = cp[k].posIndex;
                        cp[k].posIndex = cp[j].posIndex;
                        cp[j].posIndex = tmp;
                      }
                      // ensure not solved
                      if (cp.every(x => x.posIndex === x.correctIndex) && cp.length >= 2) {
                        const tmp = cp[0].posIndex;
                        cp[0].posIndex = cp[1].posIndex;
                        cp[1].posIndex = tmp;
                      }
                      return cp;
                    });
                    setSelectedIndex(null);
                  }}
                  className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Shuffle
                </button>

                <button
                  onClick={() => {
                    if (typeof setLevelIndex === "function" && levelIndex > 1) setLevelIndex(levelIndex - 1);
                  }}
                  className="px-3 py-2 bg-white border rounded hover:bg-gray-50"
                >
                  Prev
                </button>

                <button
                  onClick={() => {
                    if (typeof setLevelIndex === "function" && levelIndex < data.length) setLevelIndex(levelIndex + 1);
                  }}
                  className="px-3 py-2 bg-indigo-600 text-white rounded hover:brightness-95"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-500">Hints</div>
              <div className="mt-2 text-sm text-gray-700">
                {level.hint || "Tap a tile, then tap another tile to swap. Complete the image to finish the level."}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-500">Rewards</div>
              <div className="mt-2 text-sm text-gray-700">
                Complete = <strong>+{baseXp}</strong> XP (auto-awarded). Moves reward tiny XP.
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <div className="w-full bg-gray-200 h-3 rounded overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all"
                  style={{ width: `${Math.round((levelIndex / Math.max(1, data.length)) * 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 w-16 text-right">{Math.round((levelIndex / Math.max(1, data.length)) * 100)}%</div>
            </div>
          </div>

          {/* completion banner */}
          <AnimatePresence>
            {isSolved && (
              <motion.div initial={{opacity:0, y:12}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="mt-4 p-3 bg-green-50 border border-green-100 rounded shadow-sm text-green-700">
                🎉 Level solved! +{baseXp} XP awarded.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}







