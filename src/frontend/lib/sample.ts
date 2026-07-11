// Builds a synthetic but believable Goryaev chamber image so the analyzer can
// demonstrate itself without the user supplying a photo.
// Live cells are drawn as dark refractile rings, dead cells as solid blue blobs.

// Small seeded pseudo random generator so the sample looks identical every time.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSampleImage(): ImageData {
  const size = 720;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new ImageData(size, size);
  }

  const rand = mulberry32(20260711);

  // Field background with a faint vignette free, flat lab look.
  ctx.fillStyle = "#eef0f1";
  ctx.fillRect(0, 0, size, size);

  // Goryaev grid lines.
  const cells = 8;
  const step = size / cells;
  ctx.strokeStyle = "#c9ced2";
  ctx.lineWidth = 1;
  for (let i = 0; i <= cells; i++) {
    const p = Math.round(i * step) + 0.5;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(size, p);
    ctx.stroke();
  }

  const clamp = (v: number) => Math.max(24, Math.min(size - 24, v));

  // Dead cells: solid blue blobs (Trypan Blue).
  const deadCount = 18;
  for (let i = 0; i < deadCount; i++) {
    const x = clamp(rand() * size);
    const y = clamp(rand() * size);
    const r = 7 + rand() * 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${28 + rand() * 20}, ${52 + rand() * 24}, ${150 + rand() * 40})`;
    ctx.fill();
  }

  // Live cells: bright centre with a darker ring, the refractile look.
  const liveCount = 46;
  for (let i = 0; i < liveCount; i++) {
    const x = clamp(rand() * size);
    const y = clamp(rand() * size);
    const r = 8 + rand() * 4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#f6f7f8";
    ctx.fill();
    ctx.lineWidth = 2.8 + rand() * 1.3;
    ctx.strokeStyle = `rgba(44, 46, 50, ${0.74 + rand() * 0.22})`;
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, size, size);
}
