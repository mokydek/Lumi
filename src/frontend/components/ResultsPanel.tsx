import { Download, Save, Check } from "lucide-react";
import type { CountResult } from "../lib/math";
import { formatScientific } from "../lib/math";
import { useI18n } from "../i18n";

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
  const { t } = useI18n();
  const sci = formatScientific(result.concentration);
  const liveSci = formatScientific(result.liveConcentration);

  const total = result.total;
  const cv = total > 0 ? Math.round(100 / Math.sqrt(total)) : 0;
  const lowCountText = t("analyzer.lowCount")
    .replace("{count}", String(total))
    .replace("{cv}", String(cv));

  return (
    <div className="results">
      <p className="results-verify">{t("analyzer.verify")}</p>

      <div className="results-counts">
        <div className="count-tile count-live">
          <span className="count-dot dot" />
          <span className="count-label">{t("results.live")}</span>
          <span className="count-value mono">{live}</span>
        </div>
        <div className="count-tile count-dead">
          <span className="count-dot dot" />
          <span className="count-label">{t("results.dead")}</span>
          <span className="count-value mono">{dead}</span>
        </div>
      </div>

      <div className="result-row">
        <div className="result-head">
          <span className="result-name">{t("results.viability")}</span>
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
          <span className="result-name">{t("results.concentration")}</span>
          <span className="result-figure mono">
            {sci.mantissa} x 10<sup>{sci.exponent}</sup>
          </span>
        </div>
        <span className="result-unit muted">{t("results.concentrationUnit")}</span>
      </div>

      <div className="result-mini">
        <div className="mini">
          <span className="mini-label">{t("results.total")}</span>
          <span className="mini-value mono">{result.total}</span>
        </div>
        <div className="mini">
          <span className="mini-label">{t("results.perSquare")}</span>
          <span className="mini-value mono">{result.avgPerSquare.toFixed(1)}</span>
        </div>
        <div className="mini">
          <span className="mini-label">{t("results.livePerMl")}</span>
          <span className="mini-value mono">
            {liveSci.mantissa}e{liveSci.exponent}
          </span>
        </div>
      </div>

      {total > 0 ? (
        total < 100 ? (
          <div className="reliability reliability-low">{lowCountText}</div>
        ) : (
          <div className="reliability reliability-ok">{t("analyzer.countOk")}</div>
        )
      ) : null}

      <p className="results-ruo">{t("ruo.results")}</p>

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
                {t("results.saved")}
              </>
            ) : (
              <>
                <Save size={16} />
                {saveState === "saving" ? t("results.saving") : t("results.save")}
              </>
            )}
          </button>
        ) : null}
        <button className="btn btn-ghost btn-block" onClick={onExport}>
          <Download size={16} />
          {t("results.export")}
        </button>
      </div>

      <p className="results-caption muted">{t("export.caption")}</p>
      {canSave ? <p className="results-caption muted">{t("save.privacy")}</p> : null}

      {saveError ? <div className="notice notice-error">{saveError}</div> : null}
    </div>
  );
}
