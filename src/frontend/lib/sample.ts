// Builds a synthetic but believable Goryaev chamber image so the analyzer can
// demonstrate itself without the user supplying a photo. It mirrors the common
// real case: a blue stained field where live cells are bright refractile spots
// and dead cells are darker blue blobs.

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

  const rand = mulberry32(20260712);

  // Blue stained field.
  ctx.fillStyle = "#2f6ec8";
  ctx.fillRect(0, 0, size, size);

  // Faint Goryaev grid lines.
  const cells = 8;
  const step = size / cells;
  ctx.strokeStyle = "rgba(220, 230, 245, 0.22)";
  ctx.lineWidth = 1.5;
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

  // Dead cells: darker blue blobs (absorbed Trypan Blue).
  for (let i = 0; i < 5; i++) {
    const x = clamp(rand() * size);
    const y = clamp(rand() * size);
    const r = 7 + rand() * 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${16 + rand() * 12}, ${40 + rand() * 16}, ${96 + rand() * 24})`;
    ctx.fill();
  }

  // Live cells: bright refractile spots, a light core with a brighter rim.
  for (let i = 0; i < 48; i++) {
    const x = clamp(rand() * size);
    const y = clamp(rand() * size);
    const r = 7 + rand() * 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(224, 236, 250, ${0.9 + rand() * 0.1})`;
    ctx.fill();
    ctx.lineWidth = 1.6;
    ctx.strokeStyle = "rgba(245, 250, 255, 0.9)";
    ctx.stroke();
  }

  return ctx.getImageData(0, 0, size, size);
}
