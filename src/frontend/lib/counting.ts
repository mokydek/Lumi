// CellDrop counting engine.
// Runs entirely in the browser on a canvas. No backend, no heavy dependency.
//
// The engine counts discrete cells with a centre versus surround blob detector
// followed by non maximum suppression. For every pixel it compares the average
// brightness of a small inner window (the size of a cell) with a larger outer
// window (the surrounding field). A real cell makes the inner window stand out
// from the outer one, so it produces a strong local peak. Flat field, texture,
// noise, and thin grid lines do not, because the large windows average them
// away. Non maximum suppression then keeps one marker per cell.
//
// This is robust by design: the detection reacts to compact, cell sized spots
// rather than to any pixel that crosses a threshold, so turning sensitivity up
// finds fainter cells instead of exploding into thousands of false marks.
//
// Image polarity is measured once. On a light field live cells read darker than
// the background; on a dark or heavily stained (blue) field they read brighter.
// Dead cells absorb Trypan Blue and read as dark blue spots in either case.
//
// Computer vision is never perfect, so every marker stays editable by hand.

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
  // Higher values detect fainter cells (lower peak threshold). Bounded so even
  // the maximum still rejects flat noise.
  liveSensitivity: number;
  // Approximate cell radius in analysis pixels. Sets the inner detection window.
  cellSize: number;
}

export const DEFAULT_PARAMS: DetectParams = {
  blueThreshold: 24,
  liveSensitivity: 14,
  cellSize: 7,
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

interface Peak {
  x: number;
  y: number;
  score: number;
}

let autoIdCounter = 0;

export function detectCells(
  image: ImageData,
  params: DetectParams,
  roi?: Roi | null
): { live: Marker[]; dead: Marker[] } {
  const { width, height, data } = image;
  const pixelCount = width * height;

  const luminance = new Float32Array(pixelCount);
  const blueness = new Float32Array(pixelCount);

  let globalSum = 0;
  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const value = r * 0.299 + g * 0.587 + b * 0.114;
    luminance[i] = value;
    blueness[i] = b - (r + g) / 2;
    globalSum += value;
  }
  const globalMean = globalSum / pixelCount;
  const brightField = globalMean >= 130;

  const x0 = roi ? Math.max(0, Math.floor(roi.x)) : 0;
  const y0 = roi ? Math.max(0, Math.floor(roi.y)) : 0;
  const x1 = roi ? Math.min(width, Math.floor(roi.x + roi.width)) : width;
  const y1 = roi ? Math.min(height, Math.floor(roi.y + roi.height)) : height;

  // Integral image of luminance for O(1) window averages.
  const stride = width + 1;
  const integral = new Float64Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      rowSum += luminance[y * width + x];
      integral[(y + 1) * stride + (x + 1)] = integral[y * stride + (x + 1)] + rowSum;
    }
  }

  const meanAt = (cx: number, cy: number, radius: number): number => {
    const ax = Math.max(0, cx - radius);
    const ay = Math.max(0, cy - radius);
    const bx = Math.min(width - 1, cx + radius);
    const by = Math.min(height - 1, cy + radius);
    const area = (bx - ax + 1) * (by - ay + 1);
    const sum =
      integral[(by + 1) * stride + (bx + 1)] -
      integral[ay * stride + (bx + 1)] -
      integral[(by + 1) * stride + ax] +
      integral[ay * stride + ax];
    return sum / area;
  };

  const rIn = Math.max(3, Math.round(params.cellSize));
  const rOut = Math.max(rIn + 3, Math.round(params.cellSize * 2.6));
  // Peak must clear this centre versus surround margin. Kept well above noise
  // even at maximum sensitivity so the count never explodes.
  const threshold = Math.max(10, 34 - params.liveSensitivity);
  // Suppression radius near a cell diameter so each cell yields a single marker.
  const nms = Math.max(6, Math.round(rIn * 2.4));

  // Centre versus surround score. Positive brightScore means the centre is
  // brighter than its surroundings (a bright blob); positive darkScore means it
  // is darker (a dark blob).
  const brightScore = new Float32Array(pixelCount);
  const darkScore = new Float32Array(pixelCount);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = y * width + x;
      const diff = meanAt(x, y, rIn) - meanAt(x, y, rOut);
      brightScore[i] = diff;
      darkScore[i] = -diff;
    }
  }

  const collectPeaks = (score: Float32Array): Peak[] => {
    const candidates: Peak[] = [];
    for (let y = Math.max(1, y0); y < Math.min(height - 1, y1); y++) {
      for (let x = Math.max(1, x0); x < Math.min(width - 1, x1); x++) {
        const i = y * width + x;
        const s = score[i];
        if (s <= threshold) continue;
        if (
          s < score[i - 1] ||
          s < score[i + 1] ||
          s < score[i - width] ||
          s < score[i + width] ||
          s < score[i - width - 1] ||
          s < score[i - width + 1] ||
          s < score[i + width - 1] ||
          s < score[i + width + 1]
        ) {
          continue;
        }
        candidates.push({ x, y, score: s });
      }
    }

    candidates.sort((a, b) => b.score - a.score);

    // Greedy non maximum suppression using a spatial grid for fast lookup.
    const accepted: Peak[] = [];
    const grid = new Map<string, Peak[]>();
    const cellSizeGrid = Math.max(1, nms);
    const nmsSq = nms * nms;

    for (const cand of candidates) {
      const gx = Math.floor(cand.x / cellSizeGrid);
      const gy = Math.floor(cand.y / cellSizeGrid);
      let ok = true;
      for (let dgx = -1; dgx <= 1 && ok; dgx++) {
        for (let dgy = -1; dgy <= 1 && ok; dgy++) {
          const near = grid.get(`${gx + dgx},${gy + dgy}`);
          if (!near) continue;
          for (const a of near) {
            if ((a.x - cand.x) ** 2 + (a.y - cand.y) ** 2 < nmsSq) {
              ok = false;
              break;
            }
          }
        }
      }
      if (!ok) continue;
      accepted.push(cand);
      const key = `${gx},${gy}`;
      const bucket = grid.get(key);
      if (bucket) bucket.push(cand);
      else grid.set(key, [cand]);
    }

    return accepted;
  };

  const marker = (peak: Peak, type: MarkerType): Marker => ({
    id: `auto-${autoIdCounter++}`,
    x: peak.x,
    y: peak.y,
    type,
    source: "auto",
  });

  const isDeadCentre = (peak: Peak): boolean => {
    const i = peak.y * width + peak.x;
    return (
      blueness[i] > params.blueThreshold &&
      data[i * 4 + 2] > 55 &&
      luminance[i] < globalMean * 0.66
    );
  };

  const live: Marker[] = [];
  const dead: Marker[] = [];

  if (brightField) {
    // Cells read darker than the light field. Split dark blobs by blue.
    for (const peak of collectPeaks(darkScore)) {
      if (isDeadCentre(peak)) dead.push(marker(peak, "dead"));
      else live.push(marker(peak, "live"));
    }
  } else {
    // Stained field. Live cells are the bright blobs, dead cells the dark blue ones.
    for (const peak of collectPeaks(brightScore)) {
      live.push(marker(peak, "live"));
    }
    for (const peak of collectPeaks(darkScore)) {
      if (isDeadCentre(peak)) dead.push(marker(peak, "dead"));
    }
  }

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
