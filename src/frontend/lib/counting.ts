// CellDrop counting engine.
// Runs entirely in the browser on a canvas. No backend, no heavy dependency.
//
// Dead cells absorb Trypan Blue and read as strongly blue pixels, so a blue
// threshold finds them reliably.
//
// Live cells stay transparent and appear as refractile objects with a darker
// rim against the field. Their absolute brightness varies wildly between photos,
// so a fixed luminance threshold misses them whenever the image is bright. We
// instead use an adaptive local contrast test: a pixel is a live candidate when
// it is meaningfully darker than the average brightness of its own neighbourhood.
// This adapts to bright or dim images automatically.
//
// Connected component labelling turns each mask into discrete blobs, and area
// and aspect ratio filters drop noise and grid lines. Computer vision is never
// perfect, so every marker stays editable by hand in the UI.

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
  // Higher values detect fainter live cells (looser local contrast requirement).
  liveSensitivity: number;
  // Blob area bounds in pixels of the analysis canvas.
  minArea: number;
  maxArea: number;
}

export const DEFAULT_PARAMS: DetectParams = {
  blueThreshold: 24,
  liveSensitivity: 24,
  minArea: 16,
  maxArea: 2600,
};

// A rectangular region of interest in analysis canvas pixels.
export interface Roi {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

function toMarkers(blobs: Blob[], type: MarkerType): Marker[] {
  return blobs.map((blob) => ({
    id: `auto-${autoIdCounter++}`,
    x: blob.x,
    y: blob.y,
    type,
    source: "auto",
  }));
}

export function detectCells(
  image: ImageData,
  params: DetectParams,
  roi?: Roi | null
): { live: Marker[]; dead: Marker[] } {
  const { width, height, data } = image;
  const pixelCount = width * height;

  const luminance = new Float32Array(pixelCount);
  const deadMask = new Uint8Array(pixelCount);
  const liveMask = new Uint8Array(pixelCount);

  // Luminance for every pixel (needed everywhere for the local averages).
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    luminance[i] = data[offset] * 0.299 + data[offset + 1] * 0.587 + data[offset + 2] * 0.114;
  }

  // Region of interest bounds. Classification only happens inside them.
  const x0 = roi ? Math.max(0, Math.floor(roi.x)) : 0;
  const y0 = roi ? Math.max(0, Math.floor(roi.y)) : 0;
  const x1 = roi ? Math.min(width, Math.floor(roi.x + roi.width)) : width;
  const y1 = roi ? Math.min(height, Math.floor(roi.y + roi.height)) : height;

  // Dead mask: strongly blue pixels.
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * width + x;
      const offset = i * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      if (b - (r + g) / 2 > params.blueThreshold && b > 55) {
        deadMask[i] = 1;
      }
    }
  }

  // Integral image of luminance for O(1) local window averages.
  const stride = width + 1;
  const integral = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += luminance[y * width + x];
      integral[(y + 1) * stride + (x + 1)] = integral[y * stride + (x + 1)] + rowSum;
    }
  }

  const radius = Math.min(40, Math.max(10, Math.round(width / 45)));
  const contrast = Math.max(3, 48 - params.liveSensitivity);

  // Live mask: pixels clearly darker than their local neighbourhood, not blue.
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * width + x;
      if (deadMask[i] === 1) continue;

      const ax = Math.max(0, x - radius);
      const ay = Math.max(0, y - radius);
      const bx = Math.min(width - 1, x + radius);
      const by = Math.min(height - 1, y + radius);
      const windowArea = (bx - ax + 1) * (by - ay + 1);
      const sum =
        integral[(by + 1) * stride + (bx + 1)] -
        integral[ay * stride + (bx + 1)] -
        integral[(by + 1) * stride + ax] +
        integral[ay * stride + ax];
      const localMean = sum / windowArea;

      if (luminance[i] < localMean - contrast) {
        liveMask[i] = 1;
      }
    }
  }

  const dead = toMarkers(labelBlobs(deadMask, width, height, params.minArea, params.maxArea), "dead");
  const live = toMarkers(labelBlobs(liveMask, width, height, params.minArea, params.maxArea), "live");

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
