import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Undo2, Eye, EyeOff } from "lucide-react";
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
  type Roi,
} from "../lib/counting";
import { createSampleImage } from "../lib/sample";
import { computeResults } from "../lib/math";
import { useI18n } from "../i18n";

export type Tool = "live" | "dead" | "erase" | "region";

interface Size {
  width: number;
  height: number;
}

function normalizeRect(x0: number, y0: number, x1: number, y1: number): Roi {
  return {
    x: Math.min(x0, x1),
    y: Math.min(y0, y1),
    width: Math.abs(x1 - x0),
    height: Math.abs(y1 - y0),
  };
}

export default function AnalyzerPage() {
  const { configured, user } = useAuth();
  const { t } = useI18n();

  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const manualIdRef = useRef(0);
  const dragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const historyRef = useRef<Marker[][]>([]);

  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [dims, setDims] = useState<Size | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [params, setParams] = useState<DetectParams>(DEFAULT_PARAMS);
  const [tool, setTool] = useState<Tool>("live");
  const [roi, setRoi] = useState<Roi | null>(null);
  const [draft, setDraft] = useState<Roi | null>(null);
  const [dilution, setDilution] = useState(2);
  const [squares, setSquares] = useState(1);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);

  const live = useMemo(() => markers.filter((m) => m.type === "live").length, [markers]);
  const dead = useMemo(() => markers.filter((m) => m.type === "dead").length, [markers]);

  const result = useMemo(
    () => computeResults({ live, dead, dilutionFactor: dilution, squaresCounted: squares }),
    [live, dead, dilution, squares]
  );

  const loadImage = (data: ImageData, size: Size) => {
    manualIdRef.current = 0;
    dragRef.current = null;
    historyRef.current = [];
    setSaveState("idle");
    setSaveError(null);
    setMarkers([]);
    setRoi(null);
    setDraft(null);
    setDims(size);
    setImageData(data);
  };

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
      loadImage(ctx.getImageData(0, 0, size.width, size.height), size);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleSample = () => {
    const data = createSampleImage();
    loadImage(data, { width: data.width, height: data.height });
  };

  // Draw the source image on the base canvas.
  useEffect(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas || !imageData) return;
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    canvas.getContext("2d")?.putImageData(imageData, 0, 0);
  }, [imageData]);

  // Run automatic detection, debounced, whenever the image, sensitivity, or
  // region changes. Manual markers are preserved; only automatic ones are replaced.
  useEffect(() => {
    if (!imageData) return;
    const timer = setTimeout(() => {
      const detected = detectCells(imageData, params, roi);
      setMarkers((prev) => [
        ...prev.filter((m) => m.source === "manual"),
        ...detected.live,
        ...detected.dead,
      ]);
    }, 180);
    return () => clearTimeout(timer);
  }, [imageData, params, roi]);

  // Draw the region shade and the marker overlay.
  useEffect(() => {
    const canvas = overlayRef.current;
    if (!canvas || !dims) return;
    canvas.width = dims.width;
    canvas.height = dims.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const activeRoi = draft ?? roi;
    if (activeRoi && activeRoi.width > 0 && activeRoi.height > 0) {
      ctx.fillStyle = "rgba(10, 10, 10, 0.28)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.clearRect(activeRoi.x, activeRoi.y, activeRoi.width, activeRoi.height);
      ctx.strokeStyle = "#0b8a4b";
      ctx.lineWidth = Math.max(2, dims.width / 320);
      ctx.strokeRect(activeRoi.x, activeRoi.y, activeRoi.width, activeRoi.height);
    }

    if (showMarkers) {
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
    }
  }, [markers, dims, roi, draft, showMarkers]);

  // Keyboard shortcuts for the marker tools.
  useEffect(() => {
    if (!imageData) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const key = event.key.toLowerCase();
      if ((event.ctrlKey || event.metaKey) && key === "z") {
        event.preventDefault();
        undo();
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (key === "l") setTool("live");
      else if (key === "d") setTool("dead");
      else if (key === "e") setTool("erase");
      else if (key === "r") setTool("region");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageData]);

  const toCanvas = (event: MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
    const canvas = overlayRef.current;
    if (!canvas || !dims) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const pushHistory = () => {
    historyRef.current.push(markers);
    if (historyRef.current.length > 40) historyRef.current.shift();
  };

  const undo = () => {
    const prev = historyRef.current.pop();
    if (prev) setMarkers(prev);
  };

  const applyMarkerAt = (x: number, y: number) => {
    if (tool === "erase") {
      const radius = Math.max(10, (dims?.width ?? 100) / 70);
      let bestId: string | null = null;
      let bestDist = radius * radius;
      for (const m of markers) {
        const d = (m.x - x) ** 2 + (m.y - y) ** 2;
        if (d < bestDist) {
          bestDist = d;
          bestId = m.id;
        }
      }
      if (bestId) {
        pushHistory();
        setMarkers((prev) => prev.filter((m) => m.id !== bestId));
      }
      return;
    }
    if (tool === "live" || tool === "dead") {
      const marker: Marker = {
        id: `manual-${manualIdRef.current++}`,
        x,
        y,
        type: tool,
        source: "manual",
      };
      pushHistory();
      setMarkers((prev) => [...prev, marker]);
    }
  };

  const handleMouseDown = (event: MouseEvent<HTMLCanvasElement>) => {
    const p = toCanvas(event);
    if (!p) return;
    dragRef.current = { x: p.x, y: p.y, moved: false };
    if (tool === "region") setDraft({ x: p.x, y: p.y, width: 0, height: 0 });
  };

  const handleMouseMove = (event: MouseEvent<HTMLCanvasElement>) => {
    const start = dragRef.current;
    if (!start) return;
    const p = toCanvas(event);
    if (!p) return;
    if (Math.abs(p.x - start.x) > 3 || Math.abs(p.y - start.y) > 3) start.moved = true;
    if (tool === "region") setDraft(normalizeRect(start.x, start.y, p.x, p.y));
  };

  const handleMouseUp = (event: MouseEvent<HTMLCanvasElement>) => {
    const start = dragRef.current;
    dragRef.current = null;
    const p = toCanvas(event);

    if (tool === "region") {
      setDraft(null);
      if (start && p) {
        const rect = normalizeRect(start.x, start.y, p.x, p.y);
        setRoi(rect.width > 12 && rect.height > 12 ? rect : null);
      }
      return;
    }

    if (!start || !p || start.moved) return;
    applyMarkerAt(p.x, p.y);
  };

  const handleMouseLeave = () => {
    dragRef.current = null;
    if (tool === "region") setDraft(null);
  };

  const handleClear = () => {
    if (markers.length === 0) return;
    pushHistory();
    setMarkers([]);
  };
  const handleClearRoi = () => setRoi(null);
  const handleResetSettings = () => setParams(DEFAULT_PARAMS);

  const handleNewImage = () => {
    historyRef.current = [];
    setImageData(null);
    setDims(null);
    setMarkers([]);
    setRoi(null);
    setDraft(null);
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
      t("export.csvHeader"),
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
              <span className="eyebrow">{t("analyzer.eyebrow")}</span>
              <h1 className="app-title">{t("analyzer.title")}</h1>
              <p className="muted app-intro-sub">{t("analyzer.sub")}</p>
            </div>
            <ImageDropzone onImage={handleImage} onSample={handleSample} />
          </div>
        ) : (
          <div className="analyzer">
            <section className="analyzer-canvas card card-flush">
              <div className="canvas-stage">
                <canvas ref={baseCanvasRef} className="base-canvas" />
                <canvas
                  ref={overlayRef}
                  className={`overlay-canvas cursor-${tool}`}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseLeave}
                />
              </div>
              <div className="canvas-legend">
                <span className="badge">
                  <span className="dot" style={{ background: "var(--live)" }} />
                  {t("legend.live")}
                </span>
                <span className="badge">
                  <span className="dot" style={{ background: "var(--dead)" }} />
                  {t("legend.dead")}
                </span>
                {roi ? <span className="badge">{t("legend.region")}</span> : null}
                <div className="canvas-tools">
                  <button className="btn btn-ghost btn-sm" onClick={undo}>
                    <Undo2 size={14} />
                    {t("legend.undo")}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowMarkers((v) => !v)}
                    aria-pressed={!showMarkers}
                  >
                    {showMarkers ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showMarkers ? t("legend.hide") : t("legend.show")}
                  </button>
                </div>
                <span className="canvas-meta mono muted">
                  {dims.width} x {dims.height}
                </span>
              </div>
            </section>

            <aside className="analyzer-side">
              <p className="limits-note">{t("analyzer.limits")}</p>
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
                  hasRoi={Boolean(roi)}
                  onClearRoi={handleClearRoi}
                  onClear={handleClear}
                  onNewImage={handleNewImage}
                  onResetSettings={handleResetSettings}
                />
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
