import { CirclePlus, CircleDot, Eraser, Crop, RotateCcw, ImagePlus } from "lucide-react";
import type { DetectParams } from "../lib/counting";
import { Field, Input } from "../../shared/ui";
import { useI18n } from "../i18n";
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

const toolMeta: { id: Tool; icon: typeof CirclePlus; labelKey: string }[] = [
  { id: "live", icon: CirclePlus, labelKey: "controls.live" },
  { id: "dead", icon: CircleDot, labelKey: "controls.dead" },
  { id: "erase", icon: Eraser, labelKey: "controls.erase" },
  { id: "region", icon: Crop, labelKey: "controls.region" },
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
  const { t } = useI18n();
  const update = (patch: Partial<DetectParams>) => onParamsChange({ ...params, ...patch });

  return (
    <div className="controls">
      <div className="control-block">
        <span className="control-heading">{t("controls.tool")}</span>
        <div className="seg" role="tablist" aria-label={t("controls.tool")}>
          {toolMeta.map((meta) => (
            <button
              key={meta.id}
              role="tab"
              aria-selected={tool === meta.id}
              className={`seg-btn ${tool === meta.id ? "seg-active" : ""}`.trim()}
              onClick={() => onToolChange(meta.id)}
            >
              <meta.icon size={15} />
              {t(meta.labelKey)}
            </button>
          ))}
        </div>
        <p className="control-hint">{t("controls.toolHint")}</p>
      </div>

      <hr className="divider" />

      <div className="control-block">
        <span className="control-heading">{t("controls.sensitivity")}</span>

        <label className="slider">
          <span className="slider-label">
            {t("controls.blueStrength")}
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
            {t("controls.liveSensitivity")}
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
            {t("controls.minSize")}
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
            {t("controls.maxSize")}
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
        <span className="control-heading">{t("controls.protocol")}</span>
        <div className="control-inputs">
          <Field label={t("controls.dilution")} htmlFor="dilution">
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
          <Field label={t("controls.squares")} htmlFor="squares">
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
          {t("controls.clearMarkers")}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onNewImage}>
          <ImagePlus size={15} />
          {t("controls.newImage")}
        </button>
      </div>

      {hasRoi ? (
        <button className="btn btn-ghost btn-sm" onClick={onClearRoi}>
          <Crop size={15} />
          {t("controls.resetRegion")}
        </button>
      ) : null}
    </div>
  );
}
