import { CirclePlus, CircleDot, Eraser, Crop, RotateCcw, ImagePlus } from "lucide-react";
import type { DetectParams } from "../lib/counting";
import { Field, Input } from "../../shared/ui";
import type { Tool } from "../pages/AnalyzerPage";

interface Props {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  params: DetectParams;
  onParamsChange: (params: DetectParams) => void;
  dilution: number;
  squares: number;
  onDilutionChange: (value: number) => void;
  onSquaresChange: (value: number) => void;
  hasRoi: boolean;
  onClearRoi: () => void;
  onClear: () => void;
  onNewImage: () => void;
}

const tools: { id: Tool; label: string; icon: typeof CirclePlus }[] = [
  { id: "live", label: "Live", icon: CirclePlus },
  { id: "dead", label: "Dead", icon: CircleDot },
  { id: "erase", label: "Erase", icon: Eraser },
  { id: "region", label: "Region", icon: Crop },
];

export function Controls({
  tool,
  onToolChange,
  params,
  onParamsChange,
  dilution,
  squares,
  onDilutionChange,
  onSquaresChange,
  hasRoi,
  onClearRoi,
  onClear,
  onNewImage,
}: Props) {
  const update = (patch: Partial<DetectParams>) => onParamsChange({ ...params, ...patch });

  return (
    <div className="controls">
      <div className="control-block">
        <span className="control-heading">Marker tool</span>
        <div className="seg" role="tablist" aria-label="Marker tool">
          {tools.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tool === t.id}
              className={`seg-btn ${tool === t.id ? "seg-active" : ""}`.trim()}
              onClick={() => onToolChange(t.id)}
            >
              <t.icon size={15} />
              {t.label}
            </button>
          ))}
        </div>
        <p className="control-hint">
          Click the image to add a marker, Erase to remove one, or Region to drag a box
          that limits automatic detection. Shortcuts L, D, E, R.
        </p>
      </div>

      <hr className="divider" />

      <div className="control-block">
        <span className="control-heading">Detection sensitivity</span>

        <label className="slider">
          <span className="slider-label">
            Blue strength
            <span className="mono">{params.blueThreshold}</span>
          </span>
          <input
            type="range"
            min={6}
            max={70}
            value={params.blueThreshold}
            onChange={(e) => update({ blueThreshold: Number(e.target.value) })}
          />
        </label>

        <label className="slider">
          <span className="slider-label">
            Live sensitivity
            <span className="mono">{params.liveSensitivity}</span>
          </span>
          <input
            type="range"
            min={4}
            max={44}
            value={params.liveSensitivity}
            onChange={(e) => update({ liveSensitivity: Number(e.target.value) })}
          />
        </label>

        <label className="slider">
          <span className="slider-label">
            Min cell size
            <span className="mono">{params.minArea}</span>
          </span>
          <input
            type="range"
            min={4}
            max={120}
            value={params.minArea}
            onChange={(e) => update({ minArea: Number(e.target.value) })}
          />
        </label>

        <label className="slider">
          <span className="slider-label">
            Max cell size
            <span className="mono">{params.maxArea}</span>
          </span>
          <input
            type="range"
            min={400}
            max={6000}
            step={100}
            value={params.maxArea}
            onChange={(e) => update({ maxArea: Number(e.target.value) })}
          />
        </label>
      </div>

      <hr className="divider" />

      <div className="control-block">
        <span className="control-heading">Protocol</span>
        <div className="control-inputs">
          <Field label="Dilution factor" htmlFor="dilution">
            <Input
              id="dilution"
              className="mono"
              type="number"
              min={1}
              step={0.5}
              value={dilution}
              onChange={(e) => onDilutionChange(Number(e.target.value))}
            />
          </Field>
          <Field label="Large squares counted" htmlFor="squares">
            <Input
              id="squares"
              className="mono"
              type="number"
              min={1}
              step={1}
              value={squares}
              onChange={(e) => onSquaresChange(Number(e.target.value))}
            />
          </Field>
        </div>
      </div>

      <hr className="divider" />

      <div className="control-actions">
        <button className="btn btn-ghost btn-sm" onClick={onClear}>
          <RotateCcw size={15} />
          Clear markers
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onNewImage}>
          <ImagePlus size={15} />
          New image
        </button>
      </div>

      {hasRoi ? (
        <button className="btn btn-ghost btn-sm" onClick={onClearRoi}>
          <Crop size={15} />
          Reset region to full image
        </button>
      ) : null}
    </div>
  );
}
