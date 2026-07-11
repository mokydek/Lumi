import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Header } from "../../shared/Header";
import { useAuth } from "../../backend/auth";
import { saveAnalysis } from "../../backend/analyses";
import { ImageDropzone } from "../components/ImageDropzone";
import { Controls } from "../components/Controls";
import { ResultsPanel, type SaveState } from "../components/ResultsPanel";
import {
  detectCells,
  fitAnalysisSize,
  DEFAULT_PARAMS,
  type DetectParams,
  type Marker,
} from "../lib/counting";
import { computeResults } from "../lib/math";

export type Tool = "live" | "dead" | "erase";

export default function AnalyzerPage() {
  const { configured, user } = useAuth();

  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const manualIdRef = useRef(0);

  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [params, setParams] = useState<DetectParams>(DEFAULT_PARAMS);
  const [tool, setTool] = useState<Tool>("live");
  const [dilution, setDilution] = useState(2);
  const [squares, setSquares] = useState(1);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const live = useMemo(() => markers.filter((m) => m.type === "live").length, [markers]);
  const dead = useMemo(() => markers.filter((m) => m.type === "dead").length, [markers]);

  const result = useMemo(
    () => computeResults({ live, dead, dilutionFactor: dilution, squaresCounted: squares }),
    [live, dead, dilution, squares]
  );

  // Load an image, scale it to the analysis size, and read its pixels.
  const handleImage = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = fitAnalysisSize(img.naturalWidth, img.naturalHeight);
      const offscreen = document.createElement("canvas");
      offscreen.width = size.width;
      offscreen.height = size.height;
      const ctx = offscreen.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return;
      }
      ctx.drawImage(img, 0, 0, size.width, size.height);
      const data = ctx.getImageData(0, 0, size.width, size.height);
      manualIdRef.current = 0;
      setSaveState("idle");
      setSaveError(null);
      setMarkers([]);
      setDims(size);
      setImageData(data);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Draw the source image on the base canvas.
  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas || !imageData) return;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d")?.putImageData(imageData, 0, 0);
  }, [imageData]);

  // Run automatic detection, debounced, whenever the image or sensitivity changes.
  // Manual markers are preserved; only the automatic ones are replaced.
  useEffect(() => {
    if (!imageData) return;
    const timer = setTimeout(() => {
      const detected = detectCells(imageData, params);
      setMarkers((prev) => [
        ...prev.filter((m) => m.source === "manual"),
        ...detected.live,
        ...detected.dead,
      ]);
    }, 180);
    return () => clearTimeout(timer);
  }, [imageData, params]);

  // Draw the marker overlay.
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !dims) return;
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const r = Math.max(6, Math.round(dims.width / 110));
    for (const m of markers) {
      ctx.beginPath();
      ctx.arc(m.x, m.y, r, 0, Math.PI * 2);
      if (m.type === "live") {
        ctx.strokeStyle = "#0b8a4b";
        ctx.lineWidth = Math.max(2, r * 0.4);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(37, 99, 235, 0.82)";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }, [markers, dims]);

  const handleCanvasClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = overlayRef.current;
    if (!canvas || !dims) return;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);

    if (tool === "erase") {
      const radius = Math.max(10, dims.width / 70);
      let bestId: string | null = null;
      let bestDist = radius * radius;
      for (const m of markers) {
        const d = (m.x - x) ** 2 + (m.y - y) ** 2;
        if (d < bestDist) {
          bestDist = d;
          bestId = m.id;
        }
      }
      if (bestId) setMarkers((prev) => prev.filter((m) => m.id !== bestId));
      return;
    }

    const marker: Marker = {
      id: `manual-${manualIdRef.current++}`,
      x,
      y,
      type: tool,
      source: "manual",
    };
    setMarkers((prev) => [...prev, marker]);
  };

  const handleClear = () => setMarkers([]);

  const handleNewImage = () => {
    setImageData(null);
    setDims(null);
    setMarkers([]);
    setSaveState("idle");
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaveState("saving");
    setSaveError(null);
    const { error } = await saveAnalysis({
      live,
      dead,
      viability: Number(result.viability.toFixed(2)),
      concentration: Math.round(result.concentration),
      dilution_factor: dilution,
      squares_counted: squares,
    });
    if (error) {
      setSaveState("error");
      setSaveError(error);
      return;
    }
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 2500);
  };

  const handleExport = () => {
    const rows = [
      "metric,value",
      `live,${live}`,
      `dead,${dead}`,
      `total,${result.total}`,
      `viability_percent,${result.viability.toFixed(2)}`,
      `dilution_factor,${dilution}`,
      `squares_counted,${squares}`,
      `concentration_cells_per_ml,${Math.round(result.concentration)}`,
      `live_concentration_cells_per_ml,${Math.round(result.liveConcentration)}`,
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "celldrop-analysis.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page app-page">
      <Header />
      <main className="app-main container">
        {!imageData || !dims ? (
          <div className="analyzer-empty">
            <div className="app-intro">
              <span className="eyebrow">Analyzer</span>
              <h1 className="app-title">Count a sample</h1>
              <p className="muted app-intro-sub">
                Load a photo of a Goryaev chamber. CellDrop proposes the live and dead
                cells, then you refine by hand. Nothing leaves your browser.
              </p>
            </div>
            <ImageDropzone onImage={handleImage} />
          </div>
        ) : (
          <div className="analyzer">
            <section className="analyzer-canvas card card-flush">
              <div className="canvas-stage">
                <canvas ref={baseCanvasRef} className="base-canvas" />
                <canvas
                  ref={overlayRef}
                  className={`overlay-canvas cursor-${tool}`}
                  onClick={handleCanvasClick}
                />
              </div>
              <div className="canvas-legend">
                <span className="badge">
                  <span className="dot" style={{ background: "var(--live)" }} />
                  Live rings
                </span>
                <span className="badge">
                  <span className="dot" style={{ background: "var(--dead)" }} />
                  Dead dots
                </span>
                <span className="canvas-meta mono muted">
                  {dims.width} x {dims.height}
                </span>
              </div>
            </section>

            <aside className="analyzer-side">
              <div className="card">
                <ResultsPanel
                  live={live}
                  dead={dead}
                  result={result}
                  canSave={configured && Boolean(user)}
                  saveState={saveState}
                  saveError={saveError}
                  onSave={handleSave}
                  onExport={handleExport}
                />
              </div>
              <div className="card">
                <Controls
                  tool={tool}
                  onToolChange={setTool}
                  params={params}
                  onParamsChange={setParams}
                  dilution={dilution}
                  squares={squares}
                  onDilutionChange={setDilution}
                  onSquaresChange={setSquares}
                  onClear={handleClear}
                  onNewImage={handleNewImage}
                />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
