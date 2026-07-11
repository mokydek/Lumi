import { Download, Save, Check } from "lucide-react";
import type { CountResult } from "../lib/math";
import { formatScientific } from "../lib/math";

export type SaveState = "idle" | "saving" | "saved" | "error";

interface Props {
  live: number;
  dead: number;
  result: CountResult;
  canSave: boolean;
  saveState: SaveState;
  saveError: string | null;
  onSave: () => void;
  onExport: () => void;
}

export function ResultsPanel({
  live,
  dead,
  result,
  canSave,
  saveState,
  saveError,
  onSave,
  onExport,
}: Props) {
  const sci = formatScientific(result.concentration);

  return (
    <div className="results">
      <div className="results-counts">
        <div className="count-tile count-live">
          <span className="count-dot dot" />
          <span className="count-label">Live</span>
          <span className="count-value mono">{live}</span>
        </div>
        <div className="count-tile count-dead">
          <span className="count-dot dot" />
          <span className="count-label">Dead</span>
          <span className="count-value mono">{dead}</span>
        </div>
      </div>

      <div className="result-row">
        <div className="result-head">
          <span className="result-name">Viability</span>
          <span className="result-figure mono">{result.viability.toFixed(1)}%</span>
        </div>
        <div className="meter">
          <div
            className="meter-fill"
            style={{ width: `${Math.min(100, Math.max(0, result.viability))}%` }}
          />
        </div>
      </div>

      <div className="result-row">
        <div className="result-head">
          <span className="result-name">Concentration</span>
          <span className="result-figure mono">
            {sci.mantissa} x 10<sup>{sci.exponent}</sup>
          </span>
        </div>
        <span className="result-unit muted">cells per mL, all counted</span>
      </div>

      <div className="result-mini">
        <div className="mini">
          <span className="mini-label">Total</span>
          <span className="mini-value mono">{result.total}</span>
        </div>
        <div className="mini">
          <span className="mini-label">Per square</span>
          <span className="mini-value mono">{result.avgPerSquare.toFixed(1)}</span>
        </div>
        <div className="mini">
          <span className="mini-label">Live per mL</span>
          <span className="mini-value mono">
            {formatScientific(result.liveConcentration).mantissa}e
            {formatScientific(result.liveConcentration).exponent}
          </span>
        </div>
      </div>

      <div className="results-actions">
        {canSave ? (
          <button
            className="btn btn-primary btn-block"
            onClick={onSave}
            disabled={saveState === "saving"}
          >
            {saveState === "saved" ? (
              <>
                <Check size={16} />
                Saved
              </>
            ) : (
              <>
                <Save size={16} />
                {saveState === "saving" ? "Saving" : "Save to history"}
              </>
            )}
          </button>
        ) : null}
        <button className="btn btn-ghost btn-block" onClick={onExport}>
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {saveError ? <div className="notice notice-error">{saveError}</div> : null}
    </div>
  );
}
