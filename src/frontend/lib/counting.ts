// CellDrop counting engine.
// Runs entirely in the browser on a canvas. No backend, no heavy dependency.
//
// Strategy, deliberately pragmatic for the MVP:
//   1. Dead cells absorb Trypan Blue and read as strongly blue pixels.
//      We threshold "blueness" to build a dead mask.
//   2. Live cells stay transparent and show up as darker refractile rings
//      against the bright field. We threshold luminance for a live mask,
//      excluding anything already flagged as blue.
//   3. Connected component labelling turns each mask into discrete blobs.
//      Area and aspect ratio filters drop noise and grid lines.
//
// Computer vision is never perfect, so every marker is editable by hand in
// the UI. The engine only proposes a starting point.

export type MarkerType = "live" | "dead";
export type MarkerSource = "auto" | "manual";

export interface Marker {
  id: string;
  x: number;
  y: number;
  type: MarkerType;
  source: MarkerSource;
}

export interface DetectParams {
  // How much the blue channel must exceed red and green for a dead cell.
  blueThreshold: number;
  // Luminance below which a non blue pixel becomes a live cell candidate.
  darkThreshold: number;
  // Blob area bounds in pixels of the analysis canvas.
  minArea: number;
  maxArea: number;
}

// A rectangular region of interest in analysis canvas pixels.
export interface Roi {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_PARAMS: DetectParams = {
  blueThreshold: 26,
  darkThreshold: 118,
  minArea: 14,
  maxArea: 2400,
};

// Longest edge of the analysis canvas. Large phone photos are scaled down to
// this size so detection stays fast and marker coordinates stay consistent.
export const ANALYSIS_MAX_EDGE = 1100;

interface Blob {
  x: number;
  y: number;
  area: number;
  width: number;
  height: number;
}

function labelBlobs(
  mask: Uint8Array,
  width: number,
  height: number,
  minArea: number,
  maxArea: number
): Blob[] {
  const visited = new Uint8Array(mask.length);
  const stack: number[] = [];
  const blobs: Blob[] = [];

  for (let start = 0; start < mask.length; start++) {
    if (mask[start] === 0 || visited[start] === 1) continue;

    stack.length = 0;
    stack.push(start);
    visited[start] = 1;

    let area = 0;
    let sumX = 0;
    let sumY = 0;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    while (stack.length > 0) {
      const idx = stack.pop() as number;
      const x = idx % width;
      const y = (idx - x) / width;

      area++;
      sumX += x;
      sumY += y;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;

      // 8-connected neighbours
      for (let dy = -1; dy <= 1; dy++) {
        const ny = y + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          if (nx < 0 || nx >= width) continue;
          const nidx = ny * width + nx;
          if (mask[nidx] === 1 && visited[nidx] === 0) {
            visited[nidx] = 1;
            stack.push(nidx);
          }
        }
      }
    }

    if (area < minArea || area > maxArea) continue;

    const w = maxX - minX + 1;
    const h = maxY - minY + 1;
    const aspect = Math.max(w, h) / Math.max(1, Math.min(w, h));
    // Grid lines are long and thin; reject them.
    if (aspect > 4.5) continue;

    blobs.push({
      x: Math.round(sumX / area),
      y: Math.round(sumY / area),
      area,
      width: w,
      height: h,
    });
  }

  return blobs;
}

let autoIdCounter = 0;

export function detectCells(
  image: ImageData,
  params: DetectParams,
  roi?: Roi | null
): { live: Marker[]; dead: Marker[] } {
  const { width, height, data } = image;
  const pixelCount = width * height;

  const deadMask = new Uint8Array(pixelCount);
  const liveMask = new Uint8Array(pixelCount);

  // When a region of interest is set, only classify pixels inside it.
  const x0 = roi ? Math.max(0, Math.floor(roi.x)) : 0;
  const y0 = roi ? Math.max(0, Math.floor(roi.y)) : 0;
  const x1 = roi ? Math.min(width, Math.floor(roi.x + roi.width)) : width;
  const y1 = roi ? Math.min(height, Math.floor(roi.y + roi.height)) : height;

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * width + x;
      const offset = i * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];

      const luminance = r * 0.299 + g * 0.587 + b * 0.114;
      const blueness = b - (r + g) / 2;

      if (blueness > params.blueThreshold && b > 55) {
        deadMask[i] = 1;
      } else if (luminance < params.darkThreshold && blueness < params.blueThreshold * 0.5) {
        liveMask[i] = 1;
      }
    }
  }

  const deadBlobs = labelBlobs(deadMask, width, height, params.minArea, params.maxArea);
  const liveBlobs = labelBlobs(liveMask, width, height, params.minArea, params.maxArea);

  const dead: Marker[] = deadBlobs.map((blob) => ({
    id: `auto-${autoIdCounter++}`,
    x: blob.x,
    y: blob.y,
    type: "dead",
    source: "auto",
  }));

  const live: Marker[] = liveBlobs.map((blob) => ({
    id: `auto-${autoIdCounter++}`,
    x: blob.x,
    y: blob.y,
    type: "live",
    source: "auto",
  }));

  return { live, dead };
}

// Compute the analysis canvas size for a source image, capping the longest edge.
export function fitAnalysisSize(
  naturalWidth: number,
  naturalHeight: number
): { width: number; height: number } {
  const longest = Math.max(naturalWidth, naturalHeight);
  if (longest <= ANALYSIS_MAX_EDGE) {
    return { width: naturalWidth, height: naturalHeight };
  }
  const scale = ANALYSIS_MAX_EDGE / longest;
  return {
    width: Math.round(naturalWidth * scale),
    height: Math.round(naturalHeight * scale),
  };
}
