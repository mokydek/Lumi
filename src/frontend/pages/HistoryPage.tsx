import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ArrowRight } from "lucide-react";
import { Header } from "../../shared/Header";
import {
  listAnalyses,
  deleteAnalysis,
  type AnalysisRecord,
} from "../../backend/analyses";
import { formatScientific } from "../lib/math";
import { useI18n } from "../i18n";

export default function HistoryPage() {
  const { t } = useI18n();
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listAnalyses().then(({ data, error: listError }) => {
      if (!active) return;
      setRecords(data);
      setError(listError);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id: string) => {
    const { error: deleteError } = await deleteAnalysis(id);
    if (deleteError) {
      setError(deleteError);
      return;
    }
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="page app-page">
      <Header />
      <main className="app-main container">
        <div className="history-head">
          <div>
            <span className="eyebrow">{t("history.eyebrow")}</span>
            <h1 className="app-title">{t("history.title")}</h1>
          </div>
          <Link to="/app" className="btn btn-primary btn-sm">
            {t("history.new")}
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="empty-state mono muted">{t("history.loading")}</div>
        ) : error ? (
          <div className="notice notice-error">{error}</div>
        ) : records.length === 0 ? (
          <div className="empty-state">
            <p className="muted">{t("history.empty")}</p>
            <Link to="/app" className="link">
              {t("history.runFirst")}
            </Link>
          </div>
        ) : (
          <div className="card card-flush">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("history.date")}</th>
                    <th>{t("history.live")}</th>
                    <th>{t("history.dead")}</th>
                    <th>{t("history.viability")}</th>
                    <th>{t("history.concentration")}</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const sci = formatScientific(record.concentration);
                    return (
                      <tr key={record.id}>
                        <td className="mono">
                          {new Date(record.created_at).toLocaleDateString()}
                        </td>
                        <td className="mono">{record.live}</td>
                        <td className="mono">{record.dead}</td>
                        <td className="mono">{record.viability.toFixed(1)}%</td>
                        <td className="mono">
                          {sci.mantissa} x 10<sup>{sci.exponent}</sup>
                        </td>
                        <td className="table-action">
                          <button
                            className="icon-btn"
                            aria-label={t("history.deleteAria")}
                            onClick={() => handleDelete(record.id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
