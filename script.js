// ============================================================
// SHIVAM RO — Scroll-driven frame animation
// 240 JPG frames extracted from the animation zip
// ============================================================

// Initialize Lucide Icons
lucide.createIcons();
console.log("Shivam RO Vibe Coding - Active 💧");

// ── Config ─────────────────────────────────────────────────
const TOTAL_FRAMES = 240;
const FRAMES_DIR = "frames/";
const FRAME_PREFIX = "ezgif-frame-";
const FRAME_EXT = ".jpg";

// Overlay text phases (shown at different scroll points)
const TEXT_PHASES = [
    { start: 0, end: 0.33, id: "overlay-phase-1" },
    { start: 0.33, end: 0.66, id: "overlay-phase-2" },
    { start: 0.66, end: 1.0, id: "overlay-phase-3" },
];

// ── DOM Elements ────────────────────────────────────────────
const canvas = document.getElementById("animation-canvas");
const ctx = canvas.getContext("2d");
const section = document.getElementById("animation-section");
const progressBar = document.getElementById("scroll-progress-bar");

// ── Loading overlay (inject dynamically) ────────────────────
const loadingOverlay = document.createElement("div");
loadingOverlay.id = "loading-overlay";
loadingOverlay.innerHTML = `
  <div class="loading-spinner"></div>
  <div id="loading-bar-track"><div id="loading-bar-fill"></div></div>
  <p class="loading-text">Loading animation… <span id="loading-pct">0</span>%</p>
`;
document.body.appendChild(loadingOverlay);

const loadingBarFill = document.getElementById("loading-bar-fill");
const loadingPct = document.getElementById("loading-pct");

// ── Frame image cache ────────────────────────────────────────
const frames = new Array(TOTAL_FRAMES);
let loadedCount = 0;
let currentFrameIndex = 0;

// ── Canvas sizing ────────────────────────────────────────────
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    renderFrame(currentFrameIndex);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ── Render a single frame ─────────────────────────────────────
function renderFrame(index) {
    const img = frames[index];
    if (!img || !img.complete) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Cover-fill: always fill entire canvas, crop if needed
    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // On mobile portrait, use min scale so full width is always visible
    const isMobile = window.innerWidth <= 640;
    const scale = isMobile ? Math.min(cw / iw, ch / ih) : Math.max(cw / iw, ch / ih);

    const drawW = iw * scale;
    const drawH = ih * scale;
    const drawX = (cw - drawW) / 2;
    const drawY = (ch - drawH) / 2;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
}

// ── Preload all frames ─────────────────────────────────────────
function padNum(n) {
    return String(n).padStart(3, "0");
}

function preloadFrames() {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const src = `${FRAMES_DIR}${FRAME_PREFIX}${padNum(i)}${FRAME_EXT}`;
        img.src = src;

        img.onload = () => {
            loadedCount++;
            const pct = Math.round((loadedCount / TOTAL_FRAMES) * 100);
            loadingBarFill.style.width = pct + "%";
            loadingPct.textContent = pct;

            // Show first frame as soon as it's ready
            if (i === 1) renderFrame(0);

            if (loadedCount === TOTAL_FRAMES) onAllFramesLoaded();
        };

        img.onerror = () => {
            // Still count errored frames so loading completes
            loadedCount++;
            if (loadedCount === TOTAL_FRAMES) onAllFramesLoaded();
        };

        frames[i - 1] = img; // 0-indexed
    }
}

function onAllFramesLoaded() {
    // Fade out loading overlay
    loadingOverlay.classList.add("fade-out");
    setTimeout(() => loadingOverlay.remove(), 600);

    // Attach scroll listener now that frames are ready
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // render correct frame for initial scroll position
}

// ── Scroll handler ─────────────────────────────────────────────
function onScroll() {
    const sectionRect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + sectionRect.top;
    const sectionHeight = section.offsetHeight - window.innerHeight;

    const scrolled = Math.max(0, window.scrollY - sectionTop);
    const progress = Math.min(1, scrolled / sectionHeight); // 0 → 1

    // Update progress bar
    progressBar.style.width = (progress * 100) + "%";

    // Map progress → frame index
    const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(progress * TOTAL_FRAMES)
    );

    if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        renderFrame(currentFrameIndex);
    }

    // Update overlay text phases
    updateOverlayText(progress);
}

// ── Overlay text phase switcher ────────────────────────────────
let activePhaseId = TEXT_PHASES[0].id;

function updateOverlayText(progress) {
    let newPhaseId = activePhaseId;

    for (const phase of TEXT_PHASES) {
        if (progress >= phase.start && progress < phase.end) {
            newPhaseId = phase.id;
            break;
        }
    }
    // Last segment edge case
    if (progress >= 1) newPhaseId = TEXT_PHASES[TEXT_PHASES.length - 1].id;

    if (newPhaseId !== activePhaseId) {
        // Hide old
        const oldEl = document.getElementById(activePhaseId);
        if (oldEl) oldEl.classList.add("hidden");

        // Show new with re-trigger animation
        const newEl = document.getElementById(newPhaseId);
        if (newEl) {
            newEl.classList.remove("hidden");
            // Re-trigger CSS animation
            newEl.style.animation = "none";
            newEl.offsetHeight;   // force reflow
            newEl.style.animation = "";
        }

        activePhaseId = newPhaseId;
    }
}

// ── Start ──────────────────────────────────────────────────────
preloadFrames();



